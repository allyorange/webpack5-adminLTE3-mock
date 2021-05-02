const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const htmlWebpackPlugins = [];
fs.readdirSync(path.join(__dirname, 'src', 'pug')).forEach(file => {
  /\.pug$/i.test(file) && htmlWebpackPlugins.push(new HtmlWebpackPlugin({
    filename: file.replace('.pug', '.html'),
    template: path.join(__dirname, 'src', 'pug', file),
    scriptLoading: 'defer',
  }));
});

module.exports = (env, argv) => ({
  entry: './src/javascript/app.js',
  output: {
    path: path.resolve(__dirname, 'public'),
    filename: argv.mode === 'development' ? '[contenthash].js' : '[contenthash].bundle.js',
  },
  devtool: 'source-map',
  devServer: {
    contentBase: './public',
    port: 3000,
    host: '0.0.0.0',
    after(app, server, compiler) {
      if (server.options.host !== '0.0.0.0') {
        return;
      }
      const os = require('os');
      const ifaces = os.networkInterfaces();
      console.log("[webpack-dev-server] Access URLs:\n -------------------------------------");
      console.log("       Local: http://0.0.0.0:" + server.options.port);
      Object.keys(ifaces).forEach(function (ifname) {
        ifaces[ifname].forEach(function (iface) {
          if ('IPv4' !== iface.family || iface.internal !== false) {
            // skip over internal (i.e. 127.0.0.1) and non-ipv4 addresses
            return;
          }
          console.log("    External: http://" + iface.address + ":" + server.options.port);
        });
      });
      console.log(" -------------------------------------\n");
    }
  },
  module: {
    rules: [
      {
        test: /\.pug$/i,
        use: [
          {
            loader: 'pug-loader',
            options: {
              pretty: true,
            },
          },
        ],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/i,
        use: [
          {
            loader: 'file-loader',
            options: argv.mode === 'development' ? {
              name: '[path][name].[ext]',
            } : {
                name: '[contenthash].[ext]',
                outputPath: 'assets/images',
              },
          },
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader'
          },
          {
            loader: 'sass-loader'
          }
        ]
      },
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: argv.mode === 'development' ? '[contenthash].css' : '[contenthash].bundle.css',
    }),
  ].concat(htmlWebpackPlugins)
});
