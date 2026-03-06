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
const PORT = 8002;
const logger = pino({ level: 'warn' });

let sock = null;
let qrDataUrl = null;
let connectionStatus = 'disconnected'; // disconnected, qr_ready, connecting, connected
let phoneNumber = null;

async function startWhatsApp() {
  connectionStatus = 'connecting';
  qrDataUrl = null;

  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: true,
    logger,
    markOnlineOnConnect: false,
    browser: ['Kaiso Sushi', 'Chrome', '120.0.0'],
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
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log(`[WhatsApp] Connection closed (code: ${statusCode}), reconnect: ${shouldReconnect}`);
      connectionStatus = 'disconnected';
      qrDataUrl = null;

      if (shouldReconnect) {
        setTimeout(() => startWhatsApp(), 3000);
      }
    }

    if (connection === 'open') {
      connectionStatus = 'connected';
      qrDataUrl = null;
      phoneNumber = sock.user?.id?.split(':')[0] || sock.user?.id;
      console.log(`[WhatsApp] Connected as ${phoneNumber}`);
    }
  });
}

// --- API Endpoints ---

app.get('/status', (req, res) => {
  res.json({
    status: connectionStatus,
    phone: phoneNumber,
    qr: connectionStatus === 'qr_ready' ? qrDataUrl : null,
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
    // Format phone: remove +, spaces, dashes. Add @s.whatsapp.net
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

  // Delete session files
  if (fs.existsSync(AUTH_DIR)) {
    fs.rmSync(AUTH_DIR, { recursive: true, force: true });
  }

  connectionStatus = 'disconnected';
  qrDataUrl = null;
  phoneNumber = null;

  // Restart
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

  setTimeout(() => startWhatsApp(), 500);
  res.json({ success: true, message: 'Reconnecting...' });
});

// Start
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[WhatsApp Service] Running on port ${PORT}`);
  startWhatsApp();
});
