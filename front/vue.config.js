// const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports          = {
  transpileDependencies: [
    'vue-echarts',
    'resize-detector'
  ],
  css                  : {
    sourceMap    : true,
    loaderOptions: {
      sass: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.sass` 这个文件
        // 注意：在 sass-loader v7 中，这个选项名是 "data"
        additionalData: '@import "~@/assets/variables.scss"'
      },
      scss: {
        // @/ 是 src/ 的别名
        // 所以这里假设你有 `src/variables.sass` 这个文件
        // 注意：在 sass-loader v7 中，这个选项名是 "data"
        additionalData: '@import "~@/assets/variables.scss";'
      }
    }
  },
  devServer            : {
    // disableHostCheck: true,
    port            : 8085
  },
  pages                : {
    index: {
      // # entry for the page
      entry: 'src/main.ts',
      // # the source template
      template: 'public/index.html',
      // # output as dist/index.html
      filename: 'index.html',
      // # when using title option,
      // # template title tag needs to be <title><%= htmlWebpackPlugin.options.title %></title>
      title: 'from vue.config.js'
    }
    // # when using the entry-only string format,
    // # template is inferred to be `public/subpage.html`
    // # and falls back to `public/index.html` if not found.
    // # Output filename is inferred to be `subpage.html`.
    // subpage: 'src/subpage/main.js'
  }
  /* configureWebpack: (config) => {
   console.debug(config);
   console.debug(config.plugins);
   } */
}
