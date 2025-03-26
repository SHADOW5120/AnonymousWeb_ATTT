import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [url, setUrl] = useState('');
  const [proxyUrl, setProxyUrl] = useState('');
  const [ip, setIp] = useState('');
  const [loading, setLoading] = useState(false);
  const [proxyType, setProxyType] = useState('socks5');

  const fetchIP = async () => {
    try {
      const response = await axios.get('http://localhost:5000/my-ip');
      setIp(response.data.ip);
    } catch {
      setIp('Không thể lấy IP');
    }
  };

  const fetchViaProxy = async () => {
    if (!url) return alert('Hãy nhập URL!');
    setLoading(true);
    setProxyUrl('');

    try {
      const proxyLink = `http://localhost:5000/proxy?url=${encodeURIComponent(url)}&type=${proxyType}`;
      setProxyUrl(proxyLink);
      await fetchIP();
    } catch (error) {
      alert(`❌ Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIP();
    const interval = setInterval(() => {
      axios.post('http://localhost:5000/reset-session')
        .then(() => console.log('🔄 Reset phiên duyệt.'))
        .catch(err => console.error('❌ Lỗi reset phiên:', err));
    }, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="App">
      <h1>🌐 Trình duyệt ẩn danh (Tor Proxy)</h1>

      <input
        type="text"
        placeholder="Nhập URL (https://check.torproject.org)"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <select onChange={(e) => setProxyType(e.target.value)}>
        <option value="socks5">SOCKS5</option>
        <option value="https">HTTPS</option>
      </select>

      <button onClick={fetchViaProxy} disabled={loading}>
        {loading ? '🔄 Đang tải...' : '🚀 Truy cập'}
      </button>

      <p>🔍 IP hiện tại: {ip || 'Đang kiểm tra...'}</p>

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
