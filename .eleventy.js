const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  // Markdown config
  const markdownIt = require("markdown-it");
  eleventyConfig.setLibrary("md", markdownIt({ html: true, linkify: true, typographer: true }));

  // Plugins
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  // Filters
  eleventyConfig.addFilter("dateFormat", function (dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  });

  eleventyConfig.addFilter("dateFormatShort", function (dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  eleventyConfig.addFilter("dateISO", function (dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("slugify", function (str) {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("limit", function (arr, n) {
    if (!arr) return [];
    return arr.slice(0, n);
  });

  // Collections
  eleventyConfig.addCollection("exhibitions", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/exhibitions/*.md").sort((a, b) => {
      const dateA = new Date(a.data.startDate || "1970-01-01");
      const dateB = new Date(b.data.startDate || "1970-01-01");
      return dateB - dateA;
    });
  });

  eleventyConfig.addCollection("currentExhibitions", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/exhibitions/*.md")
      .filter((item) => item.data.status === "current")
      .sort((a, b) => new Date(b.data.startDate) - new Date(a.data.startDate));
  });

  eleventyConfig.addCollection("upcomingExhibitions", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/exhibitions/*.md")
      .filter((item) => item.data.status === "upcoming")
      .sort((a, b) => new Date(a.data.startDate) - new Date(b.data.startDate));
  });

  eleventyConfig.addCollection("pastExhibitions", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/exhibitions/*.md")
      .filter((item) => item.data.status === "past")
      .sort((a, b) => new Date(b.data.startDate) - new Date(a.data.startDate));
  });

  eleventyConfig.addCollection("articles", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/articles/*.md")
      .sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
  });

  // Passthrough copies
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/assets/images");

  // Permalinks for content
  eleventyConfig.addExtension("md", {
    permalink: function ({ data }) {
      if (data.slug && data.status) {
        return `/exhibitions/${data.slug}/`;
      }
      if (data.slug && data.category) {
        return `/art-insight/${data.slug}/`;
      }
      return null;
    },
  });

  // Directories
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
