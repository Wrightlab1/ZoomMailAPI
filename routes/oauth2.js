const express = require('express');
const router = express.Router();
const oauth2Controller = require('../controllers/oauth2Controller');

/**
 * GET request handler for OAuth application authorization code.
 * Endpoint: /oauth2
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/', async (req, res) => {
    try {
        // Extract authorization code from query parameters
        const code = req.query.code;

        // Call the oauth2Controller to fetch token using the authorization code
        const token = await oauth2Controller.getToken(code);

        // Log the retrieved token
        console.log(token);

        // Respond with the retrieved token
        res.status(200).json({ token });
    } catch (error) {
        // Handle errors
        console.error('Error fetching token:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;