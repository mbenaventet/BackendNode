require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { getRedditOAuthToken, getTopPosts, getTopUsers } = require('./redditLogic');
const redditAPI = require('./redditAPI'); // Import the API calls
const WebSocket = require('ws');

const app = express();

// Use the reddit API for all related endpoints
app.use(redditAPI);

// Enable CORS for all origins
app.use(cors({
    origin: 'http://localhost:3000', // React app is running on this port
    methods: 'GET',
}));

const PORT = process.env.PORT || 6000;
const wss = new WebSocket.Server({ port: 6001 });

wss.on('connection', (ws) => {
    console.log('Client connected');

    // Periodically fetch and send top posts and top users to clients
    const fetchDataAndSend = async () => {
        try {        
            const accessToken = await getRedditOAuthToken();
            const topPosts = await getTopPosts(accessToken);
            const topUsers = await getTopUsers(accessToken);

            // Ensure that the data is an object with the expected structure
            const data = { topPosts: topPosts || [], topUsers: topUsers || [] };
            
            // Log the data to confirm its structure
            console.log("Sending data:", data);

            ws.send(JSON.stringify(data));
        } catch (error) {
            console.error("Error updating top data:", error);
        }
    };

    // Fetch and send data immediately after the client connects
    fetchDataAndSend();

    // Example interval to fetch and send data every 10 seconds
    const intervalId = setInterval(fetchDataAndSend, 10000);

    ws.on('close', () => {
    console.log('Client disconnected');
    clearInterval(intervalId);
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
