const logger = require("../utils/logger");
const LoremIpsum = require("lorem-ipsum").LoremIpsum
const requestUtil = require('../utils/requestsUtil');

// Configure Lorem Ipsum Generator
// Usage:
// generate a number of words: lorem.generateWords(1);
// generate a number of sentences: lorem.generateSentences(5);
// generate a number of paragraphs: lorem.generateParagraphs(7);

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
})

// Function to create the RAW RFC 2822 compliant message and Base64 encode it
// Subject Line and Body are auto generated lorem ipsum script
function generateEmailMessage(fromEmailAddress, toEmailAddress) {
    logger.logInfo("Generating Email Message in RFC2822 format")
    let message = `From: ${fromEmailAddress}\nTo: ${toEmailAddress}\nSubject: ${lorem.generateWords(5)}\n\n${lorem.generateParagraphs(6)}`
    let encodedMessage = btoa(message)
    return encodedMessage


}

//function to create mail message
async function createMessage(mailbox, toEmail) {
    logger.logInfo("Adding Email Message To Inbox")
    try {
        const url = `/emails/mailboxes/${mailbox}/messages`
        const encodedMessage = generateEmailMessage(mailbox, toEmail)
        const requestBody = { "raw": encodedMessage }
        const action = "post"
        const responseData = await requestUtil.sendRequest(mailbox, action, url, requestBody);
        console.log('Response:', responseData);
        return responseData
    } catch (error) {
        logger.logError(`Error Creating mail message: ${error}`)
    }
}
// Function to Send Mail
async function sendMessage(mailbox, toEmail) {
    logger.logInfo("Sending Mail Message")
    try {
        const url = `/emails/mailboxes/${mailbox}/messages/send`;

        const encodedMessage = generateEmailMessage(mailbox, toEmail)
        const requestBody = { "raw": encodedMessage }



        // Specify the RESTful action (GET, POST, PUT, DELETE)
        const action = 'post';

        const responseData = await requestUtil.sendRequest(mailbox, action, url, requestBody);
        console.log('Response:', responseData);
        return responseData

    } catch (error) {
        console.log(error)
    }
}


//Function to create trash messages
// requires the email address of the mailbox
async function createTrashMessage(mailbox, toEmail) {
    logger.logInfo("Creating a message in the trash folder")
    try {
        const url = `/emails/mailboxes/${mailbox}/messages?deleted=true`
        const action = "post"
        const requestBody = { "raw": generateEmailMessage(mailbox, toEmail) }
        const responseData = await requestUtil.sendRequest(mailbox, action, url, requestBody);
        console.log('Response:', responseData);
        return responseData
    } catch (error) {
        console.log(error)
    }
}

/**
 * Fetches mailbox profile.
 * @returns {Promise<Object>} - Promise resolving to the mailbox profile.
 */
async function getMailboxProfile() {
    logger.logInfo("Getting Mailbox Profile")
    try {
        // Set the URL and action
        const url = '/emails/mailboxes/me/profile';
        const action = 'get';

        // Set an empty request body
        const requestBody = {};

        // Send request to fetch mailbox profile
        const responseData = await requestUtil.sendRequest(mailbox, action, url, requestBody);

        // Log and return the response data
        logger.logInfo(responseData);
        return responseData;
    } catch (error) {
        // Log and handle errors
        logger.logError(error);
        throw error; // Rethrow the error for handling in the caller
    }
}

//Function to create Labels
// requires the email address of the mailbox and the desired label name
//returns the labelId
async function createLabel(mailbox, labelName) {
    logger.logInfo("Creating Label in Mailbox")
    try {
        const url = `/emails/mailboxes/${mailbox}/labels`
        const action = "post"
        const requestBody = { "name": labelName, "parentId": "" }
        const responseData = await requestUtil.sendRequest(mailbox, action, url, requestBody);
        console.log('Response:', responseData);
        return responseData
    } catch (error) {
        console.log(error)
    }
}

//Function to create draft messages
// requires the email address of the mailbox
async function createDraftMessage(mailbox, toEmail) {
    logger.logInfo("Creating Draft email Message")
    try {
        const url = `/emails/mailboxes/${mailbox}/drafts`
        const action = "post"
        const requestBody = { "raw": generateEmailMessage(mailbox, toEmail) }
        const responseData = await requestUtil.sendRequest(mailbox, action, url, requestBody);
        console.log('Response:', responseData);
        return responseData
    } catch (error) {
        console.log(error)
    }
}

module.exports = { getMailboxProfile, sendMessage, createTrashMessage, createDraftMessage, createLabel, createMessage };