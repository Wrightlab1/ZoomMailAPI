const axios = require('axios');
const oauth2_controller = require('../controllers/oauth2Controller');
const logger = require("../utils/logger");



/**
 * Sends an HTTP request to the specified URL with the given action and optional body.
 * @param {string} action - The HTTP action (GET, POST, PUT, DELETE, PATCH).
 * @param {string} url - The URL to send the request to.
 * @param {Object} [body] - Optional. The body of the request (for POST, PUT, and PATCH requests).
 * @returns {Promise<Object>} - A promise that resolves with the response data.
 * @throws {Object} - Throws an error if the request fails.
 */
async function sendRequest(mailbox, action, url, body) {
    var token = await oauth2_controller.returnToken('user_zmail', mailbox);
    // Check if token is an object
    if (typeof token === 'object') {
        // Log that the token is an object
        logger.logInfo('Token is an object.');

        // Convert the token to JSON string
        token = JSON.stringify(token.access_token);
    }
    logger.logInfo(`Token in request is: ${token}`)
    const endpoint = process.env.BASE_URL + url;
    let headers = {
        'Content-Type': 'application/json',
        'authorization': `Bearer ${token}`
    };
    const message = JSON.stringify({ "url": endpoint, "action": action, "headers": headers, "body": body, "token": token });
    logger.logInfo(message);
    try {
        let response;

        switch (action.toUpperCase()) {
            case 'GET':
                response = await axios.get(endpoint, { headers });
                break;
            case 'POST':
                response = await axios.post(endpoint, body, { headers });
                break;
            case 'PUT':
                response = await axios.put(endpoint, body, { headers });
                break;
            case 'DELETE':
                response = await axios.delete(endpoint, body, { headers });
                break;
            case 'PATCH':
                response = await axios.patch(endpoint, body, { headers });
                break;
            default:
                throw new Error('Invalid RESTful action. Supported actions: GET, POST, PUT, PATCH, DELETE');
        }
        logger.logInfo(JSON.stringify(response.data))
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            const errorMessage = { "message": `HTTP error: ${error.response.status}`, "error": JSON.stringify(error.response.data) };
            logger.logError(errorMessage);
            throw error.response.data; // You can throw the error response to handle it in the caller
        } else if (error.request) {
            // The request was made but no response was received
            const errorMessage = { "message": "No response received from server", "error": error.request };
            logger.logError(errorMessage);
            throw error.request;
        } else {
            // Something happened in setting up the request that triggered an error
            const errorMessage = { "message": "Error setting up the request", "error": error.message };
            logger.logError(errorMessage);
            throw error;
        }
    }
}

module.exports = { sendRequest };
