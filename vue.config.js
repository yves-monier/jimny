module.exports = {
    pluginOptions: {
        electronBuilder: {
            nodeIntegration: true
        }
    },
    configureWebpack: {
        devtool: 'source-map'
    },
    // css: {
    //     loaderOptions: {
    //         sass: {
    //             additionalData: `
    //           @import "@/scss/global.scss";
    //         `
    //         }
    //     }
    // }
}