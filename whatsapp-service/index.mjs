import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
import express from 'express';
import cors from 'cors';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import pino from 'pino';

const app = express();
app.use(cors());
app.use(express.json());

const AUTH_DIR = path.resolve('./auth_session');
const PID_FILE = path.resolve('./whatsapp.pid');
const PORT = 8002;
const logger = pino({ level: 'warn' });

let sock = null;
let qrDataUrl = null;
let connectionStatus = 'disconnected';
let phoneNumber = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;

// Write PID file so backend can check if we're running
fs.writeFileSync(PID_FILE, process.pid.toString());
process.on('exit', () => { try { fs.unlinkSync(PID_FILE); } catch(e) {} });
process.on('SIGTERM', () => { process.exit(0); });
process.on('SIGINT', () => { process.exit(0); });

async function startWhatsApp() {
  connectionStatus = 'connecting';
  qrDataUrl = null;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    logger,
    markOnlineOnConnect: false,
    browser: ['Kaiso Sushi', 'Chrome', '120.0.0'],
    keepAliveIntervalMs: 30000,
    connectTimeoutMs: 60000,
    retryRequestDelayMs: 2000,
    defaultQueryTimeoutMs: undefined,
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      try {
        qrDataUrl = await QRCode.toDataURL(qr, { width: 300, margin: 2 });
        connectionStatus = 'qr_ready';
        console.log('[WhatsApp] QR Code generated - scan with your phone');
      } catch (err) {
        console.error('[WhatsApp] QR generation error:', err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(`[WhatsApp] Connection closed (code: ${statusCode})`);
      connectionStatus = 'disconnected';
      qrDataUrl = null;

      if (statusCode === DisconnectReason.loggedOut) {
        // User logged out - clear session and wait for new QR scan
        console.log('[WhatsApp] Logged out. Clearing session...');
        if (fs.existsSync(AUTH_DIR)) {
          fs.rmSync(AUTH_DIR, { recursive: true, force: true });
        }
        reconnectAttempts = 0;
        setTimeout(() => startWhatsApp(), 2000);
      } else if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
        // Connection lost - reconnect with backoff
        reconnectAttempts++;
        const delay = Math.min(2000 * Math.pow(1.5, reconnectAttempts - 1), 30000);
        console.log(`[WhatsApp] Reconnecting in ${Math.round(delay/1000)}s (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})`);
        setTimeout(() => startWhatsApp(), delay);
      } else {
        console.log('[WhatsApp] Max reconnect attempts reached. Use /reset to try again.');
      }
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      qrDataUrl = null;
      reconnectAttempts = 0;
      phoneNumber = sock.user?.id?.split(':')[0] || sock.user?.id;
      console.log(`[WhatsApp] Connected as ${phoneNumber}`);
    }
  });

  // Periodic keepalive check
  setInterval(() => {
    if (connectionStatus === 'connected' && sock) {
      try {
        sock.sendPresenceUpdate('available');
      } catch (e) {
        // ignore
      }
    }
  }, 60000);
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
  if (!phone || !message) {
    return res.status(400).json({ error: 'phone and message required' });
  }

  try {
    const cleanPhone = phone.replace(/[\s\-\+\(\)]/g, '');
    const jid = `${cleanPhone}@s.whatsapp.net`;
    await sock.sendMessage(jid, { text: message });
    console.log(`[WhatsApp] Message sent to ${cleanPhone}`);
    res.json({ success: true, to: cleanPhone });
  } catch (err) {
    console.error('[WhatsApp] Send error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/reset', async (req, res) => {
  console.log('[WhatsApp] Resetting connection...');
  try {
    if (sock) {
      sock.ev.removeAllListeners();
      await sock.logout().catch(() => {});
      sock = null;
    }
  } catch (e) { /* ignore */ }

  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  }

  connectionStatus = 'disconnected';
  qrDataUrl = null;
  phoneNumber = null;
  reconnectAttempts = 0;

  setTimeout(() => startWhatsApp(), 1000);
  res.json({ success: true, message: 'Resetting... new QR will appear shortly' });
});

app.post('/reconnect', async (req, res) => {
  console.log('[WhatsApp] Reconnecting...');
  if (connectionStatus === 'connected') {
    return res.json({ success: true, message: 'Already connected' });
  }

  try {
    if (sock) {
      sock.ev.removeAllListeners();
      sock.end(undefined);
      sock = null;
    }
  } catch (e) { /* ignore */ }

  reconnectAttempts = 0;
  setTimeout(() => startWhatsApp(), 500);
  res.json({ success: true, message: 'Reconnecting...' });
});

app.get('/health', (req, res) => {
  res.json({ alive: true, pid: process.pid, uptime: Math.floor(process.uptime()) });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WhatsApp Service] Running on port ${PORT} (PID: ${process.pid})`);
  startWhatsApp();
});
