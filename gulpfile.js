const { src, dest } = require("gulp");
const postcss = require("gulp-postcss");
const through2 = require("through2");
const gulpif = require("gulp-if");

const htmlmin = require("gulp-htmlmin")({
  minifyCSS: true,
  collapseWhitespace: true,
  collapseBooleanAttributes: true,
});

function injectStyle(css) {
  return through2.obj(function (html, _, cb) {
    css.pipe(
      through2.obj(({ contents }) => {
        const style = `<style type="text/css">${contents}</style>`;
        html.contents = Buffer.from(
          "<!-- Generated from https://github.com/neo/tailwind-story -->\n" +
            html.contents.toString().replace(/^(\s*<\/head>)/m, `${style}\n$1`)
        );
        return cb(null, html);
      })
    );
  });
}

function compile(minify) {
  const postcssPlugins = [require("tailwindcss")];
  if (minify) {
    postcssPlugins.push(
      require("@fullhuman/postcss-purgecss")({
        content: ["index.html"],
        defaultExtractor: (content) => content.match(/[A-Za-z0-9-_:/]+/g) || [],
      })
    );
  }
  const css = src("styles.css").pipe(postcss(postcssPlugins));

  return src("index.html")
    .pipe(injectStyle(css))
    .pipe(gulpif(minify, htmlmin))
    .pipe(dest("docs"));
}

exports.build = function () {
  return compile(true);
};

exports.default = function () {
  return compile(false);
};
