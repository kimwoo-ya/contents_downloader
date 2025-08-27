const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/be/api', // OK
    createProxyMiddleware({
      target: 'http://127.0.0.1:3333',
      changeOrigin: true,
      secure: false,
      credentials: true,
      pathRewrite: {
        '^/be/api': '/api'
      }
    })
  );

  app.use(
    '/ws',
    createProxyMiddleware({
      target: 'http://localhost:3333',
      changeOrigin: true,
      ws: true
    })
  );
};
