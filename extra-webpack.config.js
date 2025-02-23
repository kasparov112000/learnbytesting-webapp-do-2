// ============================================================================
//    Author: Kenneth Perkins
//    Date:   Dec 14, 2021
//    Taken From: http://programmingnotes.org/
//    File:  extra-webpack.config.js
//    Description: Configures loaders for testing environment
// ============================================================================
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$|jsx/,
        type: 'asset'
      },
      {
        test: /\.(png|jpe?g|gif|svg|webp)$/i,
        use: 'null-loader'
      }
    ]
  }
};
