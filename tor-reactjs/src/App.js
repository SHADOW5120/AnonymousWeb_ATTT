import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);

  // Lấy IP hiện tại qua Tor
  const fetchIP = async () => {
    try {
      const response = await axios.get('http://localhost:5000/my-ip');
      setIp(response.data.ip);
    } catch (error) {
      setIp('Không thể lấy IP');
    }
  };

  // Gửi yêu cầu proxy và đổi IP
  const fetchViaTor = async () => {
    if (!url) return alert('Hãy nhập URL!');
    setLoading(true);
    setProxyUrl('');

    try {
      // Tạo URL proxy thông qua backend
      const proxyLink = `http://localhost:5000/proxy?url=${encodeURIComponent(url)}`;
      setProxyUrl(proxyLink);

      // Cập nhật IP mới sau mỗi lần truy cập
      await fetchIP();
    } catch (error) {
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>🌐 Trình duyệt ẩn danh (Tor Proxy)</h1>

      {/* Nhập URL */}
      <input
        type="text"
        placeholder="Nhập URL (vd: https://check.torproject.org)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      {/* Nút Truy cập */}
      <button onClick={fetchViaTor} disabled={loading}>
        {loading ? '🔄 Đang tải...' : '🚀 Truy cập'}
      </button>

      {/* Hiển thị địa chỉ IP */}
      <p>🔍 IP hiện tại: {ip || 'Đang kiểm tra...'}</p>

      {/* Hiển thị trang web trong iframe */}
      {proxyUrl && (
        <div className="iframe-container">
          <iframe
            src={proxyUrl}
            title="Tor Proxy Viewer"
            width="100%"
            height="600px"
          />
        </div>
      )}
    </div>
  );
}

export default App;
