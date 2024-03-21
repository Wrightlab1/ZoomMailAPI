const logger = require("../utils/logger");
const axios = require('axios')
const userController = require('./userController')
const User = require('../schemas/userSchema')

const clientId = process.env.CLIENTID
const clientSecret = process.env.CLIENTSECRET
const redirect_uri = process.env.REDIRECT_URI



//Function to fetch token from Zoom API
async function getToken(code) {
    // Encode client ID and client secret for authentication
    const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    console.log(`encodedAuth is ${encodedAuth}`);

    // Set headers for the HTTP request to Zoom API
    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        'Authorization': `Basic ${encodedAuth}`
    };

    // Define the request body with authorization code, redirect URI, and grant type
    const body = {
        "code": code,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code"
    };

    try {
        // Send a POST request to Zoom API to exchange authorization code for tokens
        const response = await axios.post("https://zoom.us/oauth/token", body, { headers });

        // Extract access token and refresh token from the response data
        const access_token = response.data['access_token'];
        const refresh_token = response.data['refresh_token'];

        // Log the retrieved tokens
        logger.logInfo(`access_token: ${access_token}, refresh_token: ${refresh_token}`);

        // Fetch user mailbox to get zmail address
        const mailboxHeaders = {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${access_token}`
        };

        try {
            const mailboxResponse = await axios.get("https://api.zoom.us/v2/emails/mailboxes/me/profile", {
                headers: mailboxHeaders
            });

            const zmailAddress = mailboxResponse.data['emailAddress'];
            logger.logInfo(`zmailAddress: ${zmailAddress}`);

            // Save tokens and zmailAddress to the database
            saveTokensToDatabase(zmailAddress, access_token, refresh_token);
        } catch (error) {
            // Log and handle errors from the mailbox request
            const errorMessage = { "message": "ERROR FETCHING MAILBOX", "error": error };
            logger.logError(errorMessage);
            console.error(error);
        }
    } catch (error) {
        // Log and handle errors from the token request
        const errorMessage = { "message": "ERROR FETCHING TOKEN", "error": error };
        logger.logError(errorMessage);
        console.error(error);
    }
}


// Function to check if token is expired
function isTokenExpired(token) {
    logger.logInfo(`Checking Expiry for ${token}`);
    if (!token) {
        return true; // If token is falsy, consider it expired
    }
    const decodedToken = parseJWT(token);
    if (!decodedToken || !decodedToken.exp) {
        return true; // If token is not a valid JWT or doesn't have an expiration time, consider it expired
    }
    const currentTimestamp = Math.floor(Date.now() / 1000);
    logger.logInfo(`Token Expiration Time: ${decodedToken.exp}`);
    logger.logInfo(`Current Timestamp: ${currentTimestamp}`);
    return decodedToken.exp <= currentTimestamp; // Compare expiration time with current timestamp
}

//Helper Function to parseJWT
function parseJWT(token) {
    //console.log(`Token to decode is ${token}`)
    try {
        if (typeof token === 'undefined' || token === null) {
            console.log('Token is undefined or null');
            return null;
        }

        if (typeof token !== 'string') {
            token = String(token); // Convert token to string
        }

        const payloadBase64 = token.split('.')[1];
        const decodedPayload = Buffer.from(payloadBase64, 'base64').toString('utf8');
        return JSON.parse(decodedPayload);
    } catch (error) {
        console.log('Error parsing JWT token:', error);
        return null;
    }
}



// Async function to refresh the token
async function refreshToken(refresh_token) {
    try {
        logger.logInfo(`Fetching new Access Token using refresh_token: ${refresh_token}`);

        const encodedAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
        const headers = { "Content-Type": "application/x-www-form-urlencoded", 'Authorization': `Basic ${encodedAuth}` };
        const body = { "grant_type": "refresh_token", "refresh_token": refresh_token };
        logger.logInfo(`headers: ${JSON.stringify(headers)}, body: ${JSON.stringify(body)}`);

        // Send a POST request to refresh the token
        const response = await axios.post("https://zoom.us/oauth/token", body, { headers });

        // Extract the new access token and refresh token from the response
        const access_token = response.data['access_token'];
        const new_refresh_token = response.data['refresh_token'];
        logger.logInfo(`access_token: ${access_token}, refresh_token: ${new_refresh_token}`);
        //get the userId
        const userData = await userController.getUser(access_token)
        const userId = userData.id
        // Update tokens in the database
        await updateTokensInDatabase(userId, access_token, new_refresh_token);

        // Return the new tokens
        return { access_token, new_refresh_token };
    } catch (error) {
        // Log and handle errors
        const errorMessage = { "ERROR": JSON.stringify(error.response.data) };
        logger.logError(errorMessage);
        throw error; // Rethrow the error to propagate it further
    }
}

/**
 * Function to write tokens to the database.
 * @param {string} zmailAddress - The Zmail address of the user.
 * @param {string} access_token - The access token.
 * @param {string} refresh_token - The refresh token.
 */
async function saveTokensToDatabase(zmailAddress, access_token, refresh_token) {
    try {
        // Check if the user already exists in the database
        const userExistsResult = await userExists(zmailAddress);

        if (userExistsResult) {
            // If user exists, log it and update tokens in the database
            logger.logInfo(`User with Zmail address ${zmailAddress} already exists in the database.`);
            await updateTokensInDatabase(zmailAddress, access_token, refresh_token);
        } else {
            // If user does not exist, create a new user instance and save it to the database
            // Fetch user details using the access token
            const userResponse = await userController.getUser(access_token);
            const userId = userResponse.id;
            const emailAddress = userResponse.email;
            logger.logInfo(`${userId}, ${emailAddress}`); // Check if userId and emailAddress are obtained successfully

            // Create a new User instance
            const userInstance = new User({
                user_id: userId,
                user_email: emailAddress,
                user_zmail: zmailAddress,
                access_token: access_token,
                refresh_token: refresh_token,
            });

            // Save the user instance to the database
            await userInstance.save();

            logger.logInfo('User and tokens saved to the database successfully.');
        }
    } catch (error) {
        // Log and handle errors
        const errorMessage = { "message": "Error saving tokens to the database:", "ERROR": error };
        logger.logError(errorMessage);
        console.error('Error saving tokens to the database:', error.message);
        // Handle the error appropriately, e.g., log it or send a response indicating failure
    }
}

// Function to update access token and refresh token in the database
async function updateTokensInDatabase(userId, access_token, refresh_token) {
    try {
        // Find the user by user ID
        const user = await User.findOne({ user_id: userId });

        // If user not found, log an error and return
        if (!user) {
            logger.logError(`User with ID ${userId} not found in the database.`);
            return;
        }

        // Update the access token and refresh token
        user.access_token = access_token;
        user.refresh_token = refresh_token;

        // Save the updated user instance to the database
        await user.save();

        logger.logInfo('Tokens updated in the database successfully.');
    } catch (error) {
        // Log and handle errors
        const errorMessage = { "message": "Error updating tokens in the database:", "ERROR": error };
        logger.logError(errorMessage);
        console.error('Error updating tokens in the database:', error.message);
        // Handle the error appropriately, e.g., log it or send a response indicating failure
    }
}

/**
 * Function to check if a user exists in the database based on user_zmail.
 * @param {string} userZmail - The Zmail address of the user to check.
 * @returns {Promise<boolean>} - A promise that resolves with true if the user exists, otherwise false.
 */
async function userExists(userZmail) {
    try {
        // Check if a user with the given Zmail address exists in the database
        const user = await User.findOne({ user_zmail: userZmail });

        // If user is found, return true; otherwise, return false
        return !!user;
    } catch (error) {
        // Log and handle errors
        console.error('Error checking user existence:', error.message);
        return false; // Return false in case of error
    }
}

// Function to get the latest token from the database
// Parameters:
//   - searchValue: The value to search for (e.g., user_id, user_email, user_zmail)
//   - searchKey: The key to use for searching (e.g., 'user_id', 'user_email', 'user_zmail')
// Function to get the latest tokens from the DB based on the specified key-value pair
async function getTokensFromDatabase(key, value) {
    try {
        // Find the latest tokens based on the provided key-value pair and sort by creation time
        const tokens = await User.findOne({ [key]: value }).sort({ createdAt: -1 }).limit(1);

        // Check if tokens are found
        if (!tokens) {
            // Handle case where no tokens are found
            console.error('No tokens found in the database.');
            return null;
        }

        // Return an object containing the access token and refresh token
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token
        };
    } catch (error) {
        // Log and handle errors
        const errorMessage = `{'message': 'Error fetching tokens from the database', 'key': ${key}, 'value': ${value}, 'ERROR': ${error} }`;
        logger.logError(errorMessage);
        console.error('Error fetching tokens from the database:', error.message);
        // Return null or handle the error appropriately
        return null;
    }
}


// Async function to return the access token based on the specified key-value pair
async function returnToken(key, value) {
    try {
        // Get the latest tokens based on the provided key-value pair
        const tokens = await getTokensFromDatabase(key, value);

        // Check if tokens are found
        if (!tokens) {
            // Handle case where no tokens are found
            return null;
        }

        // Check if the access token is expired
        const isExpired = isTokenExpired(tokens.access_token);

        if (isExpired) {
            // If the access token is expired, refresh it using the refresh token
            logger.logInfo("Token Expired. Refreshing Token")
            const newToken = await refreshToken(tokens.refresh_token);
            const data = { "access_token": newToken }
            return newToken;
        } else {
            // If the access token is not expired, return it
            logger.logInfo(`Token not Expired. Using access_token ${tokens.access_token}`)
            return tokens.access_token;
        }
    } catch (error) {
        // Log and handle errors
        const errorMessage = { "message": "Error getting token from the database:", "ERROR": error };
        logger.logError(errorMessage);
        console.error('Error getting token from the database:', error.message);
        // Return null or handle the error appropriately
        return null;
    }
}


module.exports = { getToken, returnToken };