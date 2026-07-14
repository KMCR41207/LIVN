const cors = require('cors');

// Allow all origins in development — keep it simple
module.exports = cors({ origin: true, credentials: true });
