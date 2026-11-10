// Defaults for every project page.
// Images are picked up automatically from src/img/projects/ by file name:
//   <slug>.jpg            → cover (slug = name of the .md file)
//   <slug>-2.jpg, -3.jpg… → gallery
// jpg, jpeg, png and webp all work. "cover:" or "gallery:" in a project's front matter win.
import { readdirSync } from "node:fs";

const DIR = new URL("../img/projects/", import.meta.url);
const EXT = /\.(jpe?g|png|webp)$/i;
const files = () => { try { return readdirSync(DIR).filter((f) => EXT.test(f)); } catch { return []; } };
const base = (f) => f.replace(EXT, "");

export default {
  layout: "layouts/project.njk",
  permalink: "/projects/{{ page.fileSlug }}/",
  eleventyComputed: {
    crumbs: (d) => [{ label: "Projects", url: "/projects/" }, { label: d.title }],
    cover: (d) => {
      if (d.cover) return d.cover;
      const f = files().find((f) => base(f) === d.page.fileSlug);
      return f ? `/img/projects/${f}` : undefined;
    },
    gallery: (d) => {
      if (d.gallery) return d.gallery;
      const re = new RegExp(`^${d.page.fileSlug}-(\\d+)$`);
      const g = files().filter((f) => re.test(base(f)))
        .sort((a, b) => base(a).match(re)[1] - base(b).match(re)[1])
        .map((f) => `/img/projects/${f}`);
      return g.length ? g : undefined;
    },
  },
};
