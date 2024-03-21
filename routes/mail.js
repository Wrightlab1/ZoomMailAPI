const express = require('express');
const router = express.Router();
const mailController = require('../controllers/mailController');
const logger = require('../utils/logger');

/**
 * Middleware to validate required parameters.
 * Ensures that the specified parameter exists in the request parameters.
 * If not, it responds with a 400 Bad Request error.
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {Function} next - The next middleware function in the stack.
 */
const validateParams = (req, res, next) => {
    // Extract the 'mailbox' parameter from the request parameters
    const { mailbox } = req.params;
    // Check if 'mailbox' parameter is missing
    if (!mailbox) {
        // Respond with a 400 Bad Request error if 'mailbox' parameter is missing
        logger.logError('Missing Parameter: mailbox');
        return res.status(400).json({ error: 'mailbox parameter is required' });
    }
    // Move to the next middleware if 'mailbox' parameter is present
    next();
};
/**
 * Middleware to validate required body elements based on endpoint.
 * Ensures that the specified required fields are present in the request body.
 * If any required field is missing, it responds with a 400 Bad Request error.
 * @param {Array} requiredFields - An array of strings representing the required field names.
 * @returns {Function} - Returns a middleware function.
 */
const validateBody = (requiredFields) => (req, res, next) => {
    // Extract all keys from the request body
    const bodyFields = Object.keys(req.body);
    // Find missing required fields
    const missingFields = requiredFields.filter(field => !bodyFields.includes(field));
    // If any required field is missing, return a 400 Bad Request response
    if (missingFields.length > 0) {
        logger.logError(`Missing Body Fields: ${missingFields.join(', ')}`);
        return res.status(400).json({ error: `Missing required fields: ${missingFields.join(', ')}` });
    }
    // Move to the next middleware if all required fields are present
    next();
};

/**
 * GET request handler for fetching a user's mailbox profile.
 * Endpoint: /mail/:email/profile
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.get('/:mailbox/profile', async (req, res) => {
    try {
        // Extract email from request parameters
        const mailbox = req.params.mailbox;

        // Call the mailController to fetch the mailbox profile
        const profile = await mailController.getMailboxProfile(mailbox);

        // Respond with the fetched profile
        res.status(200).json(profile);
    } catch (error) {
        // Handle errors
        console.error('Error fetching mailbox profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


/**
 * POST request handler for sending a message.
 * Endpoint: /mail/:mailbox/messages/send
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/:mailbox/messages/send', validateParams, validateBody(['toEmail']), async (req, res) => {
    try {
        // Extract email from request parameters
        const mailbox = req.params.mailbox;
        //extract values from body
        const toEmail = req.body.toEmail
        // Call the mailController function to create send Message
        const response = await mailController.sendMessage(mailbox, toEmail)
        // Respond with the fetched response
        res.status(200).json(response);
    } catch (error) {
        logger.logError(`Error creating message: ${error}`)
    }
})

/**
 * POST request handler for creating message in the trash.
 * Endpoint: /mail/:mailbox/messages/trash
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/:mailbox/messages/trash', validateParams, validateBody(['toEmail']), async (req, res) => {
    try {
        //Extract email from request parameters
        const mailbox = req.params.mailbox;
        //extract values from body
        const toEmail = req.body.toEmail
        // Call the mailController function to create a trash Message
        const response = await mailController.createTrashMessage(mailbox, toEmail)
        // Respond with the fetched response
        res.status(200).json(response);
    } catch (error) {
        logger.logError(`Error creating message: ${error}`)
    }
})
/**
 * POST request handler for creating a draft message.
 * Endpoint: /mail/:mailbox/messages/draft
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/:mailbox/messages/draft', validateParams, validateBody(['toEmail']), async (req, res) => {
    try {
        //Extract email from request parameters
        const mailbox = req.params.mailbox;
        //extract values from body
        const toEmail = req.body.toEmail
        // Call the mailController function to create a draft Message
        const response = await mailController.createDraftMessage(mailbox, toEmail)
        // Respond with the fetched response
        res.status(200).json(response);
    } catch (error) {
        logger.logError(`Error creating message: ${error}`)
    }
})
/**
 * POST request handler for creating a label.
 * Endpoint: /mail/:mailbox/labels
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 */
router.post('/:mailbox/labels', validateParams, validateBody(['labelName']), async (req, res) => {
    try {
        //Extract email from request parameters
        const mailbox = req.params.mailbox;
        //extract values from body
        const labelName = req.body.labelName
        // Call the mailController function to create a draft Message
        const response = await mailController.createLabel(mailbox, labelName)
        // Respond with the fetched response
        res.status(200).json(response);
    } catch (error) {
        logger.logError(`Error creating message: ${error}`)
    }
})

module.exports = router;