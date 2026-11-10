// Downloads the public works of an ORCID profile and writes them to
// src/_data/publications-orcid.json.   Usage:  npm run orcid
//
// Hand-made entries live in src/_data/publications-manual.json and are never touched.
// Both lists are merged in src/_data/publications.js (ORCID wins when the same work is in both).

import { writeFile } from "node:fs/promises";

const ORCID = "0000-0003-2761-2384";
const API = `https://pub.orcid.org/v3.0/${ORCID}`;
const OUT = new URL("../src/_data/publications-orcid.json", import.meta.url);

const TYPES = {
  "journal-article": "article",
  "magazine-article": "other",
  "newspaper-article": "other",
  book: "book",
  "edited-book": "book",
  "book-chapter": "chapter",
  "conference-paper": "conference",
  "conference-abstract": "conference",
  "conference-poster": "conference",
  "dissertation-thesis": "thesis",
  dissertation: "thesis",
};

async function get(path) {
  const res = await fetch(API + path, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`ORCID ${path} → HTTP ${res.status}`);
  return res.json();
}

const val = (x) => (x && x.value) || "";

// "Carles Sora-Domenjó" → "Sora-Domenjó, C."
function apa(name) {
  name = name.trim();
  if (!name || name.includes(",")) return name;
  const parts = name.split(/\s+/);
  if (parts.length === 1) return name;
  // Catalan/Spanish double surnames joined by "-" stay together; the first word is the given name
  const given = parts.shift();
  return `${parts.join(" ")}, ${given[0]}.`;
}
function authorList(names) {
  const a = names.map(apa).filter(Boolean);
  if (a.length <= 1) return a.join("");
  return a.slice(0, -1).join(", ") + ", & " + a.at(-1);
}

const summary = await get("/works");
const codes = summary.group.map((g) => g["work-summary"][0]["put-code"]);

const works = [];
for (let i = 0; i < codes.length; i += 100) {
  const bulk = await get(`/works/${codes.slice(i, i + 100).join(",")}`);
  for (const b of bulk.bulk) if (b.work) works.push(b.work);
}

const pubs = works.map((w) => {
  const ids = (w["external-ids"] && w["external-ids"]["external-id"]) || [];
  const doi = ids.find((x) => x["external-id-type"] === "doi");
  const date = w["publication-date"] || {};
  const names = ((w.contributors && w.contributors.contributor) || []).map((c) => val(c["credit-name"]));
  return {
    year: Number(val(date.year)) || null,
    month: Number(val(date.month)) || 0,
    type: TYPES[w.type] || "other",
    authors: authorList(names) || "Sora-Domenjó, C.",
    title: val(w.title && w.title.title),
    venue: val(w["journal-title"]),
    url: doi ? `https://doi.org/${doi["external-id-value"]}` : val(w.url),
    doi: doi ? doi["external-id-value"].toLowerCase() : "",
    source: "orcid",
  };
}).filter((p) => p.title && p.year)
  .sort((a, b) => b.year - a.year || b.month - a.month);

await writeFile(OUT, JSON.stringify(pubs, null, 2) + "\n");
console.log(`ORCID ${ORCID}: ${pubs.length} works written to src/_data/publications-orcid.json`);
