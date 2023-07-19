const path = require("path")
const HtmlBundlerPlugin = require("html-bundler-webpack-plugin")
const Nunjucks = require("nunjucks")
const glob = require("glob-all")
const varGlobal = require("./src/data/_global.json")

const pathPages = path.join(__dirname, "src/views/pages/")
const entry = glob.sync(path.join(pathPages, "/**/*.html")).reduce((entry, file) => {
  const filepath = path.relative(__dirname, file)
  const filename = path.relative(pathPages, file).replace(/\.html$/, "")
  entry[filename] = {
    import: filepath,
    data: `src/data/${filename}.json`,
  }
  return entry
}, {})

module.exports = (env, argv) => {
  // console.log(env, argv)
  const isProd = argv.mode === "production"
  const config = {
    mode: "development",
    devtool: "source-map",
    stats: "minimal",
    output: {
      path: path.join(__dirname, "dist"),
    },
    // enable HMR with live reload
    devServer: {
      static: {
        directory: path.join(__dirname, "dist"),
      },
      watchFiles: {
        paths: ["src/**/*.*"],
        options: { usePolling: true },
      },
      compress: true,
      open: true,
    },
    resolve: {
      // use aliases used in sources instead of relative paths like ../../
      alias: {
        "@script": path.resolve(__dirname, "src/assets/js/"),
        "@style": path.resolve(__dirname, "src/assets/scss/"),
        "@img": path.resolve(__dirname, "src/assets/img/"),
      },
    },
    plugins: [
      new HtmlBundlerPlugin({
        entry: entry,
        // entry: "src/views/pages",
        js: {
          // output filename of extracted JS from source script loaded in HTML via `<script>` tag
          // filename: "assets/js/[name].js",
          filename: (pathData) => {
            let filename = pathData.chunk.name.replace(/\..*$/, "")
            filename = isProd ? `${filename}.min.js` : `${filename}.js`
            // console.log("js", pathData.filename, typeof pathData.filename, pathData.filename ? true : false)

            return `assets/js/${filename}`
          },
        },
        css: {
          // output filename of extracted CSS from source style loaded in HTML via `<link>` tag
          // filename: "assets/css/[name].css",
          filename: (pathData) => {
            // console.log("css", pathData.filename, typeof pathData.filename, pathData.filename ? true : false)
            let filename = pathData.filename.split("\\").pop()
            filename = isProd ? filename.replace(/\.scss$/, ".min.css") : filename.replace(/\.scss$/, ".css")

            return `assets/css/${filename}`
          },
        },
        loaderOptions: {
          // resolve files specified in non-standard attributes 'data-src', 'data-srcset'
          // sources: [{ tag: "img", attributes: ["data-src", "data-srcset"] }],

          // preprocessor: "nunjucks", // enable Nunjucks compiler
          preprocessor: (template, { data }) => {
            const njk = Nunjucks.configure(path.join(__dirname, "src/views/"))
            njk.addGlobal("global", varGlobal)

            return njk.renderString(template, data)
          }, // enable Nunjucks compiler
          // preprocessorOptions: {...},
        },
        minify: {
          collapseWhitespace: false,
          collapseBooleanAttributes: true,
          removeEmptyAttributes: true,
          removeComments: true,
        },
      }),
    ],
    module: {
      rules: [
        // styles
        {
          test: /\.(css|scss|sass)$/,
          use: [
            {
              // Interprets `@import` and `url()` like `import/require()` and will resolve them
              loader: "css-loader",
            },
            {
              // Loader for webpack to process CSS with PostCSS
              loader: "postcss-loader",
              options: {
                postcssOptions: {
                  plugins: () => [autoprefixer],
                },
              },
            },
            {
              // Loads a SASS/SCSS file and compiles it to CSS
              loader: "sass-loader",
            },
          ],
        },
        {
          test: /\.(jpe?g|png|webp|gif|svg|ico)$/,
          type: "asset/resource",
          generator: {
            // filename: "assets/img/[name][ext]",
            filename: (pathData) => pathData.filename.replace("src/", ""),
          },
        },
        // images (load from `img` directory only)
        // {
        //   test: /[\\/]img[\\/].+(png|jpe?g|svg|webp|gif|ico)$/,
        //   oneOf: [
        //     // inline image using `?inline` query
        //     {
        //       resourceQuery: /inline/,
        //       type: "asset/inline",
        //     },
        //     // auto inline by image size
        //     {
        //       type: "asset",
        //       parser: {
        //         dataUrlCondition: {
        //           maxSize: 1024,
        //         },
        //       },
        //       generator: {
        //         filename: "assets/img/[name][ext]",
        //       },
        //     },
        //   ],
        // },
      ],
    },
    performance: {
      hints: false, // don't show the size limit warning when a bundle is bigger than 250 KB
    },
  }

  return config
}
