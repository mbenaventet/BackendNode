const WebSocket = require('ws');
const { getRedditOAuthToken, getTopPosts, getTopUsers } = require('./redditLogic');

const WS_PORT = process.env.WS_PORT || 6001;

const initializeWebSocketServer = () => {
    const wss = new WebSocket.Server({ port: WS_PORT });

    wss.on('connection', (ws) => {
        console.log('Client connected to WebSocket server');

        // Define the function to fetch and send data
        const fetchDataAndSend = async () => {
            try {
                const accessToken = await getRedditOAuthToken();
                const topPosts = await getTopPosts(accessToken);
                const topUsers = await getTopUsers(accessToken);

                const data = { topPosts: topPosts || [], topUsers: topUsers || [] };
                ws.send(JSON.stringify(data));
                console.log("Sent data to client:", data);
            } catch (error) {
                console.error("Error fetching or sending data:", error);
            }
        };

        // Fetch and send data immediately and then at intervals
        fetchDataAndSend();
        const intervalId = setInterval(fetchDataAndSend, 10000);

        ws.on('close', () => {
            console.log('Client disconnected');
            clearInterval(intervalId);
        });
    });

    console.log(`WebSocket server is running on port ${WS_PORT}`);
};

module.exports = { initializeWebSocketServer };
