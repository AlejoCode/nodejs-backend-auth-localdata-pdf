const cors = require('cors')
const corsOptions = {
    origin: true,
  };
module.exports = app => {
    app.use(cors(corsOptions));
}