module.exports = {
    pluginOptions: {
        electronBuilder: {
            // nodeIntegration: true,
            preload: "src/preload.js",
            builderOptions: {
                extraResources: ['src', 'src/res/'],
                extraFiles: [
                    {
                      "from": "./data/",
                      "to": "./data/",
                      "filter": ["**/*"]
                    }
                  ]
            },
            // mainProcessFile: "src/background.js",
            // rendererProcessFile: "src/main.js",
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