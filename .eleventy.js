const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

module.exports = function (eleventyConfig) {
  const markdownIt = require("markdown-it");
  eleventyConfig.setLibrary("md", markdownIt({ html: true, linkify: true, typographer: true }));
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);

  eleventyConfig.addFilter("dateFormat", function (dateStr, format) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    const m = months[d.getMonth()];
    const day = d.getDate();
    const year = d.getFullYear();
    if (format === "MMM D") {
      return m + " " + day;
    }
    if (format === "D, YYYY") {
      return day + ", " + year;
    }
    return m + " " + day + ", " + year;
  });

  eleventyConfig.addFilter("dateFormatShort", function (dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
  });

  eleventyConfig.addFilter("dateISO", function (dateStr) {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split("T")[0];
  });

  eleventyConfig.addFilter("slugify", function (str) {
    if (!str) return "";
    return str.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  });

  eleventyConfig.addFilter("limit", function (arr, n) {
    if (!arr) return [];
    return arr.slice(0, n);
  });

  eleventyConfig.addFilter("find", function (arr, key, value) {
    if (!arr) return null;
    return arr.find(item => item[key] === value) || null;
  });

  // Collections
  eleventyConfig.addCollection("exhibitions", function (collectionApi) {
    return collectionApi.getFilteredByGlob("src/content/exhibitions/*.md")
      .sort((a, b) => new Date(b.data.startDate || "1970") - new Date(a.data.startDate || "1970"));
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

  eleventyConfig.addPassthroughCopy("src/images");
  // Passthrough copies
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/assets/images");
  eleventyConfig.addPassthroughCopy({ "public": "/" });

  // Override permalinks for markdown content files to get clean URLs
  eleventyConfig.addExtension("md", {
    permalink: function ({ page }) {
      const slug = page.filePathStem.split("/").pop();
      if (page.inputPath.includes("/exhibitions/")) {
        return "/exhibitions/" + slug + "/";
      }
      if (page.inputPath.includes("/articles/")) {
        return "/art-insight/" + slug + "/";
      }
      return null;
    },
  });

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
