# Anonymous Web with Tor

This project is an anonymous web application built using **Node.js** for the backend and **React.js** for the frontend. It operates through the **Tor network** to ensure user privacy, allowing anonymous browsing with features like IP masking, no browsing history storage, and automatic IP rotation after each session.

## Features

- **Anonymous Browsing**: Access the web while maintaining privacy through the Tor network.
- **IP Masking**: Automatically changes IP addresses via Tor to hide user identity.
- **No History Storage**: Does not log or store any user activity.
- **Session-based IP Rotation**: Automatically generates a new IP address after each browsing session.
- **Keyword Search**: Enables users to search anonymously with customizable keywords.
- **Real-time IP Display**: View the current IP address being used through Tor.

## Technology Stack

### Backend (Node.js)
- Express.js (Routing & API handling)
- Axios (HTTP requests via Tor proxy)
- Socks Proxy Agent (Tor SOCKS5 proxy integration)
- Tor Control (IP rotation via Tor ControlPort)

### Frontend (React.js)
- React Router (Navigation)
- Axios (API requests)
- Tailwind CSS (Styling)

## Prerequisites

Ensure you have the following installed on your system:

- Node.js (>= v18.x.x)
- npm (>= v9.x.x)
- Tor (installed and running on your system)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/anonymous-web.git
cd anonymous-web
```

2. Set up and run the backend:

```bash
cd tor-nodejs
npm install
node torRequest.js
```

3. Set up and run the frontend:

```bash
cd tor-reactjs
npm install
npm start
```

## Configuration

Ensure that the Tor service is running on port **9050** (default SOCKS5 proxy port) and ControlPort **9051**.

### Backend Configuration

Edit `backend/server.js` to modify any environment-specific variables:

```javascript
const torControl = new TorControl({
  password: 'your-tor-password', // Set your Tor Control password
  host: '127.0.0.1',
  port: 9051,
});

const torProxy = new SocksProxyAgent('socks5h://127.0.0.1:9050');
```

### Frontend Configuration

Edit `frontend/src/config.js` to point to the correct backend:

```javascript
export const API_URL = 'http://localhost:5000';
```

## Usage

1. Ensure the **Tor** service is running:

```bash
sudo service tor start
```

2. Start the backend and frontend as described in the installation steps.

3. Open your browser and navigate to:

```
http://localhost:3000
```

4. Use the search functionality to anonymously query the web.

## Security Considerations

- Ensure the system is behind a secure network and that Tor is up-to-date.
- Regularly audit the system for vulnerabilities.
- Avoid exposing your real IP address by only using the Tor-proxied endpoints.

## License

This project is licensed under the MIT License.

## Contribution

Feel free to fork this repository and submit pull requests. Ensure all code complies with privacy and security best practices.

