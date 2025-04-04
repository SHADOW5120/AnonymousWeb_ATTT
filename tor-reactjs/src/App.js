import React, { useState } from "react";
import axios from "axios";

function App() {
    const [url, setUrl] = useState("");
    const [response, setResponse] = useState("");
    
    const fetchProxy = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/proxy?url=${encodeURIComponent(url)}`);
            setResponse(res.data);
        } catch (error) {
            setResponse("Error fetching URL.");
        }
    };

    const changeIP = async () => {
        try {
            await axios.get("http://localhost:5000/new-ip");
            alert("IP changed successfully!");
        } catch {
            alert("Failed to change IP.");
        }
    };

    return (
        <div>
            <h1>Anonymous Tor Browser</h1>
            <input
                type="text"
                placeholder="Enter URL..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
            />
            <button onClick={fetchProxy}>Browse</button>
            <button onClick={changeIP}>Change IP</button>
            <div>
                <h2>Response:</h2>
                <pre>{response}</pre>
            </div>
        </div>
    );
}

export default App;
