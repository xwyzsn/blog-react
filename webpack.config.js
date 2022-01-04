const { getThemeVariables } = require('antd/dist/theme');
module.exports = {
    rules: [{
        test: /\.less$/,
        use: [{
            loader: 'style-loader',
        }, {
            loader: 'css-loader', // translates CSS into CommonJS
        }, {
            loader: 'less-loader',
            options:{
                lessOptions:{
                    modifyVars:getThemeVariables({
                        dark: true
                    }),
                    javascriptEnabled: true,
                }
            }

            // compiles Less to CSS
        }],
    }],
};
