# Anonymous Web with Tor

This project is an anonymous web application built using **Node.js** for the backend and **React.js** for the frontend. It operates through the **Tor network** to ensure user privacy, allowing anonymous browsing with features like IP masking, no browsing history storage, and automatic IP rotation after each session.

## Features

- **Anonymous Browsing**: Browse the web securely and anonymously via the Tor network.
- **IP Masking**: Automatically changes the IP address through Tor to conceal the user's identity.
- **No History Storage**: Does not store or log any browsing activity.
- **Session-based IP Rotation**: Automatically generates a new IP address after each browsing session.
- **Keyword Search**: Enables anonymous keyword-based searches through DuckDuckGo.
- **Real-time IP Display**: Displays the current Tor exit node (public IP address).
- **Automatic Session Reset**: Automatically resets and generates a new identity after a configurable time interval.

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
git clone https://github.com/SHADOW5120/AnonymousWeb_ATTT.git
cd AnonymousWeb_ATTT
```

2. Set up and run the backend:

```bash
cd tor-nodejs
npm install
node torRequest.js
```

3. Set up and run the frontend:

```bash
cd ../tor-reactjs
npm install
npm start
```

## Configuration

Ensure the Tor service is running on port **9050** (default SOCKS5 proxy port) and ControlPort **9051**.

### Backend Configuration

Edit `tor-nodejs/torRequest.js` to modify any environment-specific variables:

```javascript
const torControl = new TorControl({
  password: 'your-tor-password', // Set your Tor Control password
  host: '127.0.0.1',
  port: 9051,
});

const torProxy = new SocksProxyAgent('socks5h://127.0.0.1:9050');
```

Make sure you have configured the `ControlPort` and `HashedControlPassword` in your `torrc` configuration file. To generate a hashed password:

```bash
tor --hash-password your-password
```

Add the output to your `torrc` file:

```
ControlPort 9051
HashedControlPassword 16:<hashed-output>
```

Restart the Tor service after making changes.

### Frontend Configuration

Edit `tor-reactjs/src/App.js` to point to the correct backend:

```javascript
export const API_URL = 'http://localhost:5000';
```

## Usage

1. Ensure the **Tor** service is running by going to the Tor installation folder and executing:

```bash
tor.exe
```

2. Start the backend and frontend as described in the installation steps.

3. Open your browser and navigate to:

```
http://localhost:3000
```

4. Use the provided interface to access the web anonymously and monitor your IP address.

## Security Considerations

- Ensure the system is behind a secure network and that Tor is up-to-date.
- Regularly audit the system for vulnerabilities.
- Avoid exposing your real IP address by only using the Tor-proxied endpoints.
- Limit access to the Tor ControlPort to prevent unauthorized IP manipulation.

## Troubleshooting

1. **Tor is not running**: Ensure Tor is installed and the `tor.exe` process is active.

2. **IP does not change**: Ensure the Tor ControlPort is configured correctly and the password is properly set.

3. **CORS Errors**: Ensure the backend is correctly handling cross-origin requests with appropriate `cors` middleware.

## License

This project is licensed under the MIT License.

## Contribution

Feel free to fork this repository and submit pull requests. Ensure all code complies with privacy and security best practices.

## Acknowledgments

- Tor Project (https://www.torproject.org/)
- DuckDuckGo for anonymous search services

