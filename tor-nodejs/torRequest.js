const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { SocksProxyAgent } = require('socks-proxy-agent');
const TorControl = require('tor-control');

const app = express();
const port = 5000;

app.use(cors());

// Cấu hình Tor ControlPort
const torControl = new TorControl({
  password: 'Hung12345', // Thay bằng mật khẩu của bạn
  host: '127.0.0.1',
  port: 9051,
});

// Tạo proxy thông qua Tor
const torProxy = new SocksProxyAgent('socks5h://127.0.0.1:9050');

// Hàm đổi IP thông qua Tor
const changeIP = () => {
  return new Promise((resolve, reject) => {
    torControl.signalNewnym((err) => {
      if (err) reject(`❌ Lỗi khi đổi IP: ${err}`);
      else {
        console.log('🔄 Đã yêu cầu đổi IP mới.');
        resolve();
      }
    });
  });
};

// API: Lấy nội dung trang web thông qua Tor
app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Thiếu URL' });

  try {
    const response = await axios.get(url, {
      httpsAgent: torProxy,
      responseType: 'arraybuffer', // Đảm bảo giữ nguyên trang web
    });

    // Đổi IP mới sau mỗi lần truy cập
    await changeIP();

    // Gửi lại toàn bộ trang web
    res.set('Content-Type', response.headers['content-type']);
    res.send(response.data);
  } catch (error) {
    res.status(500).json({ error: `❌ Lỗi truy cập: ${error.message}` });
  }
});

// API: Kiểm tra địa chỉ IP hiện tại
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

app.listen(port, () => {
  console.log(`🚀 Backend đang chạy tại: http://localhost:${port}`);
});
