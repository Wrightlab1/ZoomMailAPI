mailController = require('../controllers/mailController')
const LoremIpsum = require("lorem-ipsum").LoremIpsum



//Configure script
const num_sent_messages = 10
const num_inbox = 25
const num_labels = 5
const num_trash = 10
const num_draft = 10

const mailbox = "zoomdevtest@zmail.com"
const toEmail = "zoomdev@wearewright.com"





// Function to create test data in mailbox account
async function generate_data() {
    // Check if TEST_SCRIPT environment variable is set to true
    if (process.env.TEST_SCRIPT !== 'true') {
        console.log('Test script is disabled. Aborting data generation.');
        return;
    }

    var messages_sent = 0;
    while (messages_sent < num_sent_messages) {
        console.log("Sending Mail Message")
        response = await mailController.sendMessage(mailbox, toEmail);
        messages_sent += 1;
    }

    var labels = 0;
    while (labels < num_labels) {
        console.log("Creating Label")
        var labelName = generateRandomString(12);
        response = await mailController.createLabel(mailbox, labelName);
        labels += 1;
    }

    var trash = 0;
    while (trash < num_trash) {
        console.log("Creating Trash Email")
        response = await mailController.createTrashMessage(mailbox, toEmail);
        trash += 1;
    }

    var draft = 0;
    while (draft < num_draft) {
        console.log("Creting Draft Message")
        response = await mailController.createDraftMessage(mailbox, toEmail);
        draft += 1;
    }

    var inbox = 0;
    while (inbox < num_inbox) {
        console.log("Creting Inbox Messages")
        response = await mailController.createMessage(mailbox, toEmail);
        inbox += 1;
    }
}

function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }

    return randomString;
}

module.exports = { generate_data }