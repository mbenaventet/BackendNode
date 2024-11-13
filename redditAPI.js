// redditRoutes.js
const express = require('express');
const { getRedditOAuthToken, getTopPosts, getTopUsers } = require('./redditLogic');
const router = express.Router();

// Route to fetch and log top posts
router.get('/api/science/top-posts', async (req, res) => {
    try {
        const accessToken = await getRedditOAuthToken();
        const topPosts = await getTopPosts(accessToken);

        // Log rate limit info
        console.log(`Rate Limit: ${topPosts.rate_limit_remaining} remaining, resets in ${topPosts.rate_limit_reset} seconds`);

        res.json(topPosts);
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Error fetching Reddit data', error);
        }       
        
        res.status(500).send('Internal server error');
    }
});

// Route to fetch and log top users with the most posts
router.get('/api/science/top-users', async (req, res) => {
    try {
        const accessToken = await getRedditOAuthToken();
        const topUsers = await getTopUsers(accessToken);
        res.json(topUsers);
    } catch (error) {
        if (process.env.NODE_ENV !== 'test') {
            console.error('Error fetching Reddit data', error);
        }    
        
        res.status(500).send('Internal server error');
    }
});

module.exports = router;
