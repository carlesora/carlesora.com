import { HtmlBasePlugin } from "@11ty/eleventy";

export default function (eleventyConfig) {
  // Rewrites absolute links ("/projects/") when the site lives in a sub-path
  // (e.g. carlesora.github.io/carlesora.com/ before the custom domain is set).
  eleventyConfig.addPlugin(HtmlBasePlugin);

  // Files copied as-is
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/img");

  // ---------- Collections ----------
  // Projects: newest first (by "year" in each project's front matter)
  eleventyConfig.addCollection("projects", (api) =>
    api.getFilteredByGlob("src/projects/*.md").sort((a, b) => (b.data.year || 0) - (a.data.year || 0))
  );
  // News: newest first (by "date")
  eleventyConfig.addCollection("news", (api) =>
    api.getFilteredByGlob("src/news/*.md").sort((a, b) => b.date - a.date)
  );

  // ---------- Filters ----------
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  eleventyConfig.addFilter("monthYear", (d) => `${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`);
  eleventyConfig.addFilter("isoDate", (d) => d.toISOString().slice(0, 10));
  eleventyConfig.addFilter("limit", (arr, n) => (arr || []).slice(0, n));

  // Publications grouped by year, newest year first → [{year, items}]
  eleventyConfig.addFilter("byYear", (pubs) => {
    const groups = new Map();
    for (const p of pubs) {
      if (!groups.has(p.year)) groups.set(p.year, []);
      groups.get(p.year).push(p);
    }
    return [...groups.entries()].sort((a, b) => b[0] - a[0]).map(([year, items]) => ({ year, items }));
  });
  // Unique values of a key, keeping first-seen order (used for filter buttons)
  eleventyConfig.addFilter("countType", (arr, t) => (arr || []).filter((x) => x.type === t).length);
  eleventyConfig.addFilter("uniq", (arr, key) => [...new Set((arr || []).map((x) => (key ? x[key] : x)))]);

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
