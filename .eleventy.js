module.exports = async function (eleventyConfig) {
  const { minify } = await import("html-minifier-next");
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/robots.txt");
  eleventyConfig.addPassthroughCopy("src/llms.txt");
  eleventyConfig.addPassthroughCopy("src/_redirects");
  eleventyConfig.addPassthroughCopy("src/_headers");
  eleventyConfig.addPassthroughCopy("src/0ed7ff33829e408995319533cc1ef53e.txt");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/favicon.ico");
  eleventyConfig.addPassthroughCopy("src/favicon-16x16.png");
  eleventyConfig.addPassthroughCopy("src/favicon-32x32.png");
  eleventyConfig.addPassthroughCopy("src/apple-touch-icon.png");
  eleventyConfig.addPassthroughCopy("src/android-chrome-192x192.png");
  eleventyConfig.addPassthroughCopy("src/android-chrome-512x512.png");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/translations.json");
  eleventyConfig.addPassthroughCopy("functions");
  eleventyConfig.addFilter("withReleaseVersion", function (str, versionTag) {
    if (!str || !versionTag) return str;
    return str.replace(/v\d+\.\d+\.\d+/g, versionTag);
  });
  eleventyConfig.addFilter("stripHtml", function (str) {
    if (!str) return "";
    return String(str).replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
  });
  eleventyConfig.addTransform("htmlmin", async function (content) {
    if (!this.page.outputPath) return content;
    if (this.page.outputPath.endsWith(".html")) {
      try {
        return await minify(content, {
          useShortDoctype: true,
          removeComments: true,
          collapseWhitespace: true,
          collapseAttributeWhitespace: true,
          collapseBooleanAttributes: true,
          collapseNoBreakSpaces: true,
          decodeEntities: true,
          minifyCSS: true,
          minifyJS: true,
          minifyJSON: true,
          minifySVG: true,
          selfCloseForeignElements: true,
          removeRedundantAttributes: true,
          removeDefaultTypeAttributes: true,
          removeEmptyAttributes: true,
          sortClassNames: true,
        });
      } catch (e) {
        console.error("Error during HTML minification:", e);
        return content;
      }
    }
    if (this.page.outputPath.endsWith(".xml")) {
      return content
        .replace(/>\s+</g, "><")
        .replace(/\s{2,}/g, " ")
        .trim();
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
