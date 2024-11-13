const WebSocket = require('ws');
import { Server } from 'mock-socket'; // Mock-socket library for testing

global.WebSocket = require('mock-socket').WebSocket;

describe('WebSocket Server', () => {
    let wss;
    let client;

    beforeAll(() => {
        // Set up the mock WebSocket server
        wss = new Server('ws://localhost:6001');
    });

    beforeEach((done) => {
        // Set up the client WebSocket connection before each test
        client = new WebSocket('ws://localhost:6001');

        client.onopen = () => {
        done(); // Call done once the connection is open
        };
    });

    afterEach(() => {
        // Close the client after each test
        client.close();
    });

    afterAll(() => {
        // Close the WebSocket server after all tests
        wss.close();
    });

    it('should send data to the client', (done) => {
        // Set a longer timeout for this test
        jest.setTimeout(15000);

        // Listen for the client to receive a message
        client.onmessage = (message) => {
        expect(message.data).toBeDefined(); // Check that the message data is defined
        const data = JSON.parse(message.data);
        expect(data).toHaveProperty('topPosts');
        expect(data).toHaveProperty('topUsers');
        done(); // Call done to signal test completion
        };

        // Simulate sending data from the server to the client
        wss.emit('message', JSON.stringify({ topPosts: [], topUsers: [] }));
    });
});
  


  
