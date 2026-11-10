// Merges the publications downloaded from ORCID (npm run orcid) with the hand-made list.
// - Same work = same DOI, or same title and same type.
// - For a match, ORCID data is used, but the longer author list is kept.
// - Hand-made entries not in ORCID are kept as they are.
import { readFileSync } from "node:fs";

const load = (f) => JSON.parse(readFileSync(new URL(f, import.meta.url), "utf8"));
const orcid = load("./publications-orcid.json");
const manual = load("./publications-manual.json");

const doiOf = (p) => {
  const m = (p.doi || p.url || "").toLowerCase().match(/10\.\d{4,9}\/\S+/);
  return m ? m[0].replace(/[.)]+$/, "") : "";
};
const key = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[^a-z0-9]/g, "").slice(0, 50);

// Same title, or one title is the beginning of the other (subtitles, punctuation…)
const sameTitle = (a, b) => {
  const [x, y] = [key(a), key(b)];
  return x === y || (Math.min(x.length, y.length) >= 15 && (x.startsWith(y) || y.startsWith(x)));
};

const used = new Set();
const merged = orcid.map((o) => {
  const d = doiOf(o);
  const i = manual.findIndex((m, idx) =>
    !used.has(idx) && ((d && doiOf(m) === d) || (sameTitle(m.title, o.title) && m.type === o.type)));
  if (i === -1) return o;
  used.add(i);
  const m = manual[i];
  return {
    ...o,
    authors: (m.authors || "").length > (o.authors || "").length ? m.authors : o.authors,
    venue: o.venue || m.venue,
    type: m.type === "chapter" || m.type === "book" ? m.type : o.type,
  };
});

const all = [...merged, ...manual.filter((_, i) => !used.has(i))];
all.sort((a, b) => b.year - a.year || (b.month || 0) - (a.month || 0));

export default all;
