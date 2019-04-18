module.exports = {
  server: {
    "baseDir": ["./src", "./build/contracts"],
    middleware: {
      // overrides the second middleware default with new settings
      1: require('connect-history-api-fallback')({ 
        index: '/index.html',
        verbose: true,
        rewrites: [
          { from: /\/0x.*/, to: '/app.html' }
        ] })
    }
  }
};

