# User Level OAuth Zoom Mail API Testing

This is a node.js Express server that acts ass a backend API and Testing Script for use with the Zoom Mail API. 

## To get started CLone the repo:
`put repo here`

## Setup
Once cloned, navigate to the USER_LEVEL_OAUTH directory:

`$ cd USER_LEVEL_OAUTH`

Install the dependencies

`$ npm install`

### Creating the Zoom OAuth app
Open the Zoom app Marketplace as an owner or admin.
Create a user level OAuth app. retain the clientId and Client Secret for use in the .env file
[Creating an OAuth app](https://developers.zoom.us/docs/integrations/create/)

### MongoDB setup
This application utilized mongoDB to store the users authentication information. You will need to create a acollection and a database user with read and write access. Once you have this you will need to note your mongoDB connection string for use in the .env file

### .env Setup
Create and environment file to store your API Key and Secret
`touch .env`

Add the following code to the `.env` file and update the appropriate values

```
BASE_URL = "https://api.zoom.us/v2"
CLIENTID = ""
CLIENTSECRET = ""
#redirect URI for OAUTH2
REDIRECT_URI = "https://ngrokAddress/oauth"
#SETUP node environment
NODE_ENV = "development"
# Port to run express server
PORT = "8000"
# Winston Log Level
LOG_LEVEL = "error"
# mongoDB connection string 
DB_STRING = "mongodb+srv://<user>:<pass>s@cluster0.jmzhm.mongodb.net/"
# set this value to true to use the generate_data script in the scripts folder
TEST_SCRIPT = false
```
Setting TEST_SCRIPT to true will run the script in `./scripts/generate_data.js`
This script will create dummy data for the specified users mailbox. 
**You MUST run the server at least once before using the script so that auth credentials can be generated**

Save and Close `.env`

Start the Server
`npm run start`

Install and run ngrok
`ngrok http {port}`
[Getting Started with nkrok](https://ngrok.com/docs/getting-started/)

Once the server has been configred and started succesfully and ngrok is running. Navigate to your OAuth app on the Zoom marketplace and install it. This should begin the OAuth process and grant credential

## Usage

### Making Requests
You can send Get, Post, Patch, and Delete requests to the endpoints listed. If any path parameters are required you must provide them. The path of each mail endpoint requires the zmail address of the authenticated user.

### Endpoints

## Mail
|Endpoint             |Method|URL                         |Path     |Body       |
|---------------------|------|----------------------------|---------|-----------|
|Send Mail Message    | POST | `/:mailbox/messages/send`  |`mailbox`|`toEmail`  |
|Create Draft Message | POST | `/:mailbox/messages/draft` |`mailbox`|`toEmail`  |
|Create Trash Message | POST | `/:mailbox/messages/trash` |`mailbox`|`toEmail`  |
|Create Label         | POST | `/:mailbox/labels`         |`mailbox`|`labelName`|


