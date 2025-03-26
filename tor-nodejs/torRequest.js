const express = require('express');
const axios = require('axios');
const cors = require('cors');
const crypto = require('crypto');
const { SocksProxyAgent } = require('socks-proxy-agent');
const TorControl = require('tor-control');
const https = require('https');

const app = express();
const port = 5000;

app.use(cors());

// Cấu hình Tor ControlPort
const torControl = new TorControl({
  password: 'Hung12345', // Thay bằng mật khẩu của bạn
  host: '127.0.0.1',
  port: 9051,
});

// Tạo proxy Tor mặc định
const torProxy = new SocksProxyAgent('socks5h://127.0.0.1:9050');

// Mã hóa dữ liệu bằng AES-256
const secretKey = crypto.randomBytes(32).toString('hex');
const encrypt = (text) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

// Hàm đổi IP thông qua Tor (hạn chế mỗi 10 giây)
let lastChangeTime = 0;
const changeIP = () => {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    if (now - lastChangeTime < 10000) return resolve(); // Giới hạn 10 giây mỗi lần đổi

    torControl.signalNewnym((err) => {
      if (err) reject(`❌ Lỗi đổi IP: ${err}`);
      else {
        console.log('🔄 Đã yêu cầu đổi IP.');
        lastChangeTime = now;
        resolve();
      }
    });
  });
};

// Chặn domain theo dõi
const blockedDomains = ['google-analytics.com', 'facebook.com', 'ads.com'];
const isBlocked = (url) => blockedDomains.some((domain) => url.includes(domain));

// API: Truy cập nặc danh qua proxy
app.get('/proxy', async (req, res) => {
  const { url, type } = req.query;
  if (!url) return res.status(400).json({ error: 'Thiếu URL' });
  if (isBlocked(url)) return res.status(403).json({ error: '🔒 Domain bị chặn' });

  const agent = type === 'https' ? new https.Agent({ rejectUnauthorized: false }) : torProxy;

  try {
    const response = await axios.get(url, { httpsAgent: agent, responseType: 'arraybuffer' });
    await changeIP(); // Đổi IP sau mỗi request
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: `❌ Lỗi proxy: ${error.message}` });
  }
});

// API: Tìm kiếm ẩn danh qua DuckDuckGo
app.get('/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: 'Thiếu từ khóa tìm kiếm' });

  try {
    const response = await axios.get(`https://lite.duckduckgo.com/lite?q=${encodeURIComponent(query)}`, {
      httpsAgent: torProxy,
      headers: { 'User-Agent': '' }, // Không gửi thông tin trình duyệt
    });
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: `❌ Lỗi tìm kiếm: ${error.message}` });
  }
});

// API: Kiểm tra IP hiện tại
app.get('/my-ip', async (req, res) => {
  try {
    const response = await axios.get('https://api64.ipify.org?format=json', {
      httpsAgent: torProxy,
    });
    res.json({ ip: response.data.ip });
  } catch (error) {
    res.status(500).json({ error: `❌ Không thể lấy IP: ${error.message}` });
  }
});

// API: Reset phiên duyệt (xóa dữ liệu)
app.post('/reset-session', async (req, res) => {
  try {
    await changeIP();
    console.log('🔄 Phiên duyệt đã được reset.');
    res.json({ message: '✅ Phiên duyệt mới đã được thiết lập' });
  } catch (error) {
    res.status(500).json({ error: `❌ Lỗi reset phiên: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`🚀 Backend đang chạy tại: http://localhost:${port}`);
});
