const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use('/', createProxyMiddleware({
    target: 'https://backend-nodejs-auth-data-pdf.herokuapp.com',
    changeOrigin: true,
    secure: false,
    headers: {
      'Access-Control-Allow-Origin': '*'
    }
  }));
};