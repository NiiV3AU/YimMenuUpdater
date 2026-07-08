module.exports = async function (eleventyConfig) {
  const { minify } = await import("html-minifier-next");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/6f0bc00266824311aeb5aca42556f1d1.txt");
  eleventyConfig.addPassthroughCopy("functions");
  eleventyConfig.addTransform("htmlmin", function (content) {
    if (this.page.outputPath && this.page.outputPath.endsWith(".html")) {
      try {
        return minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        });
      } catch (e) {
        console.error("Error during minification:", e);
        return content;
      }
    }
    return content;
  });
  return {
    markdownTemplateEngine: "njk",
    dataTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dir: {
      input: "src",
      output: "_site",
      data: "_data",
    },
  };
};
