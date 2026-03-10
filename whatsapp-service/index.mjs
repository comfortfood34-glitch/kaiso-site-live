import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, proto } from '@whiskeysockets/baileys';
import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { MongoClient } from 'mongodb';

const app = express();
app.use(cors());
app.use(express.json());

const AUTH_DIR = path.resolve('./auth_session');
const PID_FILE = path.resolve('./whatsapp.pid');
const PORT = 8002;
const logger = pino({ level: 'warn' });

// Read MongoDB URL from backend .env
let MONGO_URL = '';
let DB_NAME = '';
try {
  const envContent = fs.readFileSync(path.resolve('../backend/.env'), 'utf-8');
  const mongoMatch = envContent.match(/MONGO_URL="?([^"\n]+)"?/);
  const dbMatch = envContent.match(/DB_NAME="?([^"\n]+)"?/);
  MONGO_URL = mongoMatch ? mongoMatch[1] : '';
  DB_NAME = dbMatch ? dbMatch[1] : 'kaiso_reservas';
} catch(e) {
  console.error('[WhatsApp] Could not read backend .env:', e.message);
}

let mongoDb = null;
let sock = null;
let qrDataUrl = null;
let connectionStatus = 'disconnected';
let phoneNumber = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 15;

// PID management
fs.writeFileSync(PID_FILE, process.pid.toString());
process.on('exit', () => { try { fs.unlinkSync(PID_FILE); } catch(e) {} });
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));

// MongoDB session storage
async function connectMongo() {
  if (mongoDb) return mongoDb;
  if (!MONGO_URL) return null;
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    mongoDb = client.db(DB_NAME);
    console.log('[WhatsApp] MongoDB connected for session storage');
    return mongoDb;
  } catch(e) {
    console.error('[WhatsApp] MongoDB connection failed:', e.message);
    return null;
  }
}

async function saveSessionToMongo() {
  const db = await connectMongo();
  if (!db || !fs.existsSync(AUTH_DIR)) return;
  try {
    const files = fs.readdirSync(AUTH_DIR);
    const sessionData = {};
    for (const file of files) {
      const content = fs.readFileSync(path.join(AUTH_DIR, file), 'utf-8');
      sessionData[file] = content;
    }
    await db.collection('whatsapp_session').updateOne(
      { _id: 'auth_session' },
      { $set: { files: sessionData, updated_at: new Date() } },
      { upsert: true }
    );
    console.log(`[WhatsApp] Session saved to MongoDB (${files.length} files)`);
  } catch(e) {
    console.error('[WhatsApp] Failed to save session:', e.message);
  }
}

async function loadSessionFromMongo() {
  const db = await connectMongo();
  if (!db) return false;
  try {
    const doc = await db.collection('whatsapp_session').findOne({ _id: 'auth_session' });
    if (!doc || !doc.files) return false;
    fs.mkdirSync(AUTH_DIR, { recursive: true });
    for (const [file, content] of Object.entries(doc.files)) {
      fs.writeFileSync(path.join(AUTH_DIR, file), content);
    }
    console.log(`[WhatsApp] Session loaded from MongoDB (${Object.keys(doc.files).length} files)`);
    return true;
  } catch(e) {
    console.error('[WhatsApp] Failed to load session:', e.message);
    return false;
  }
}

async function clearSessionFromMongo() {
  const db = await connectMongo();
  if (!db) return;
  try {
    await db.collection('whatsapp_session').deleteOne({ _id: 'auth_session' });
    console.log('[WhatsApp] Session cleared from MongoDB');
  } catch(e) {}
}

async function startWhatsApp() {
  connectionStatus = 'connecting';
  qrDataUrl = null;

  // Load session from MongoDB if local session is empty
  if (!fs.existsSync(AUTH_DIR) || fs.readdirSync(AUTH_DIR).length === 0) {
    await loadSessionFromMongo();
  }

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    markOnlineOnConnect: false,
    browser: ['Kaiso Sushi', 'Chrome', '120.0.0'],
    keepAliveIntervalMs: 25000,
    connectTimeoutMs: 60000,
    retryRequestDelayMs: 2000,
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on('creds.update', async () => {
    await saveCreds();
    // Backup to MongoDB every time creds update
    await saveSessionToMongo();
  });

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
        connectionStatus = 'qr_ready';
        console.log('[WhatsApp] QR Code generated');
      } catch (err) {
        console.error('[WhatsApp] QR error:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`[WhatsApp] Closed (code: ${statusCode})`);
      connectionStatus = 'disconnected';
      qrDataUrl = null;

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('[WhatsApp] Logged out - clearing session');
        if (fs.existsSync(AUTH_DIR)) fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        await clearSessionFromMongo();
        reconnectAttempts = 0;
        setTimeout(() => startWhatsApp(), 2000);
      } else if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        reconnectAttempts++;
        const delay = Math.min(3000 * Math.pow(1.3, reconnectAttempts - 1), 60000);
        console.log(`[WhatsApp] Reconnecting in ${Math.round(delay/1000)}s (${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => startWhatsApp(), delay);
      } else {
        console.log('[WhatsApp] Max attempts reached. Waiting 5min then retry...');
        reconnectAttempts = 0;
        setTimeout(() => startWhatsApp(), 300000);
      }
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      qrDataUrl = null;
      reconnectAttempts = 0;
      phoneNumber = sock.user?.id?.split(':')[0] || sock.user?.id;
      console.log(`[WhatsApp] Connected as ${phoneNumber}`);
      // Save session immediately on successful connection
      await saveSessionToMongo();
    }
  });
}

// --- API Endpoints ---

app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    phone: phoneNumber,
    qr: connectionStatus === 'qr_ready' ? qrDataUrl : null,
    uptime: Math.floor(process.uptime()),
    reconnectAttempts,
  });
});

app.post('/send', async (req, res) => {
  if (connectionStatus !== 'connected' || !sock) {
    return res.status(503).json({ error: 'WhatsApp not connected' });
  }
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ error: 'phone and message required' });

  try {
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    console.log(`[WhatsApp] Sent to ${cleanPhone}`);
    res.json({ success: true, to: cleanPhone });
  } catch (err) {
    console.error('[WhatsApp] Send error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/reset', async (req, res) => {
  console.log('[WhatsApp] Reset requested');
  try {
    if (sock) { sock.ev.removeAllListeners(); await sock.logout().catch(() => {}); sock = null; }
  } catch(e) {}
  if (fs.existsSync(AUTH_DIR)) fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  await clearSessionFromMongo();
  connectionStatus = 'disconnected';
  qrDataUrl = null;
  phoneNumber = null;
  reconnectAttempts = 0;
  setTimeout(() => startWhatsApp(), 1000);
  res.json({ success: true });
});

app.post('/reconnect', async (req, res) => {
  console.log('[WhatsApp] Reconnect requested');
  if (connectionStatus === 'connected') return res.json({ success: true, message: 'Already connected' });
  try { if (sock) { sock.ev.removeAllListeners(); sock.end(undefined); sock = null; } } catch(e) {}
  reconnectAttempts = 0;
  setTimeout(() => startWhatsApp(), 500);
  res.json({ success: true });
});

app.get('/health', (req, res) => {
  res.json({ alive: true, pid: process.pid, uptime: Math.floor(process.uptime()) });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WhatsApp Service] Port ${PORT} (PID: ${process.pid})`);
  startWhatsApp();
});
