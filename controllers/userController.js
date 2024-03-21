const axios = require('axios');
const logger = require("../utils/logger");

const clientId = process.env.CLIENTID;
const clientSecret = process.env.CLIENTSECRET;
const redirectUri = process.env.REDIRECT_URI;

/**
 * Fetch user details from Zoom API.
 * @param {string} accessToken - Access token for authorization.
 * @returns {Promise<Object>} - Promise resolving to the user details.
 */
async function getUser(accessToken) {
    try {
        // Set the URL
        const url = 'https://api.zoom.us/v2/users/me';

        // Set headers for the HTTP request to Zoom API
        const headers = { "Authorization": `Bearer ${accessToken}` };

        // Define and send the request
        const response = await axios.get(url, { headers });

        // Return the response data
        logger.logInfo(`user_info: ${JSON.stringify(response.data)}`)
        return response.data;
    } catch (error) {
        // Log and handle errors
        logger.logError(error);
        throw error; // Rethrow the error for handling in the caller
    }
}

module.exports = { getUser };