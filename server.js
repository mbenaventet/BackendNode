require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// Enable CORS for all origins
app.use(cors({
    origin: 'http://localhost:3000', // React app is running on this port
    methods: 'GET',
}));
const PORT = 6000;

// Reddit OAuth2 token URL
const REDDIT_OAUTH_URL = 'https://www.reddit.com/api/v1/access_token';

// Function to get an OAuth token
async function getRedditOAuthToken() {
    const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = process.env;

    const auth = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
    const response = await axios.post(REDDIT_OAUTH_URL, null, {
        headers: {
            'Authorization': `Basic ${auth}`,
            'User-Agent': 'RedditStatsApp/1.0',
        },
        params: {
            grant_type: 'client_credentials',
        },
    });
    return response.data.access_token;
}

// Function to get top posts in the science subreddit with rate limit handling
async function getTopPosts(accessToken) {
    try {
        // Send request to Reddit API
        const response = await axios.get('https://oauth.reddit.com/r/science/top', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'User-Agent': 'RedditStatsApp/1.0',
            },
            params: {
                t: 'day', // Top posts for the day
                limit: 10, // Limit to top 10 posts
            },
        });

        // Extract rate limit information from the headers
        const rateLimitRemaining = response.headers['x-ratelimit-remaining'];
        const rateLimitReset = response.headers['x-ratelimit-reset'];

        // Log rate limit information
        console.log(`Rate limit remaining: ${rateLimitRemaining}, resets in: ${rateLimitReset} seconds`);

        // Check if rate limit is exhausted
        if (rateLimitRemaining <= 0) {
            // Calculate the time to wait before making the next request
            const resetTime = (rateLimitReset - Math.floor(Date.now() / 1000)) * 1000; // Convert to milliseconds
            console.log(`Rate limit exceeded. Waiting for ${resetTime / 1000} seconds...`);
            // Wait for the rate limit to reset
            await new Promise(resolve => setTimeout(resolve, resetTime));
        }

        // Return the top posts
        return response.data.data.children;

    } catch (error) {
        console.error('Error fetching Reddit data', error);
        throw error;
    }
}

// Route to fetch and log top posts
app.get('/api/science/top-posts', async (req, res) => {
    try {
        const accessToken = await getRedditOAuthToken();
        const topPosts = await getTopPosts(accessToken);

        // Log rate limit info
        console.log(`Rate Limit: ${topPosts.rate_limit_remaining} remaining, resets in ${topPosts.rate_limit_reset} seconds`);

        res.json(topPosts);
    } catch (error) {
        console.error('Error fetching Reddit data', error);
        res.status(500).send('Internal server error');
    }
});

// Function to count users with the most posts
async function getTopUsers(accessToken) {
    try {
        // Get the top posts from Reddit
        const posts = await getTopPosts(accessToken);

        // Create a dictionary to count posts by user
        const userPostCount = {};

        // Loop through the posts and count the authors (users)
        posts.forEach(post => {
            const author = post.data.author;
            userPostCount[author] = (userPostCount[author] || 0) + 1;
        });

        // Sort the users by the number of posts (in descending order)
        const sortedUsers = Object.entries(userPostCount)
            .map(([user, count]) => ({ user, count }))
            .sort((a, b) => b.count - a.count);

        // Log top users with most posts
        console.log("Top Users with Most Posts:");
        sortedUsers.slice(0, 10).forEach(user => {
            console.log(`${user.user}: ${user.count} posts`);
        });

        return sortedUsers.slice(0, 10); // Return top 10 users with the most posts
    } catch (error) {
        console.error('Error fetching Reddit data', error);
        throw error;
    }
}

// Route to fetch and log top users with the most posts
app.get('/api/science/top-users', async (req, res) => {
    try {
        const accessToken = await getRedditOAuthToken();
        const topUsers = await getTopUsers(accessToken);
        res.json(topUsers);
    } catch (error) {
        console.error('Error fetching Reddit data', error);
        res.status(500).send('Internal server error');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
