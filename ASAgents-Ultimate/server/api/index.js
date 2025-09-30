// Vercel serverless function entry point
const { createServer } = require('../dist/index.js');

let app;

module.exports = async function handler(req, res) {
  if (!app) {
    app = await createServer();
  }

  return app(req, res);
};
