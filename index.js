const express = require('express')
const app = express();

// const bodyParser = require('body-parser');
// const { json } = require('body-parser');


//     app.use(bodyParser.json())
//     app.use(bodyParser.urlencoded({ extended: false }));


const libs = require('./libs')
libs.forEach(lib => require(`./libs/${lib}`)(app))