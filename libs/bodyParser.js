const bodyParser = require('body-parser');
const { json } = require('body-parser');

module.exports = app => {

    app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: false }));
}