process.on('uncaughtException', (error, origin) => {
    console.log('----- Uncaught exception -----')
    console.log(error)
    console.log('----- Exception origin -----')
    console.log(origin)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('----- Unhandled Rejection at -----')
    console.log(promise)
    console.log('----- Reason -----')
    console.log(reason)
})

const axios = require("axios")
const mongoose = require('mongoose')
const express = require("express")
const bodyParser = require('body-parser');
const logger = require('./utils/logger')

const scripts = require('./scripts/generate_data')
const oauth = require('./routes/oauth2.js')
const mail = require('./routes/mail')
const user = require('./routes/user')

const app = express()
const port = process.env.PORT || 3000

//Setup Body Parser
app.use(bodyParser.json());


// INCLUDE ROUTES
app.use('/oauth', oauth)
app.use('/mail', mail)
app.use('/user', user)

//Run Testing Script to generate Data
scripts.generate_data()

//Connect DB
try {
    logger.logInfo(`DB_STRING : ${process.env.DB_STRING}`)
    mongoose.connect(process.env.DB_STRING, { autoIndex: false })
    console.log('MongoDB connected successfully.');
} catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
}


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
    console.log("DB Connected successfully");
});

// Create Server
const server = app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
// Error handling for starting the server
server.on('error', (error) => {
    if (error.syscall !== 'listen') {
        throw error;
    }

    switch (error.code) {
        case 'EACCES':
            console.error(`Port ${port} requires elevated privileges`);
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(`Port ${port} is already in use`);
            process.exit(1);
            break;
        default:
            throw error;
    }
});