# carlesora.com

Web personal de Carles Sora-Domenjó. Està feta amb [Eleventy](https://www.11ty.dev/) i es publica a GitHub Pages.

## On és cada cosa

| Vull canviar… | Fitxer |
|---|---|
| Nom, enllaços del peu (Scholar, ORCID…), CV, menú | `src/_data/site.json` |
| Text de la portada i l'About | `src/index.njk` |
| Un projecte | `src/projects/<nom>.md` |
| Publicacions | `npm run orcid` + `src/_data/publications-manual.json` |
| Docència | `src/_data/teaching.json` |
| Una notícia | `src/news/<data>-<nom>.md` |
| Colors, tipografia, mides | `src/assets/sora.css` (a dalt de tot) |
| Imatges | `src/img/projects/` i `src/img/news/` |

Les plantilles (el disseny) són a `src/_includes/`. Normalment no cal tocar-les.

## Afegir un projecte

Crea `src/projects/nom-del-projecte.md`. El nom del fitxer serà l'adreça: `/projects/nom-del-projecte/`.

```markdown
---
title: Nom del projecte
year: 2026
period: "2026–2027"         # opcional: es mostra en lloc de l'any
type: research            # research | transfer | art | design | curation  (per al filtre)
category: Interactive installation
summary: Una frase que resumeixi el projecte.
cover: /img/projects/nom-del-projecte.jpg
gallery:
  - /img/projects/nom-del-projecte-2.jpg
video: { vimeo: "123456" }           # o { youtube: "AbCdEf" }
facts:
  - { label: Role, value: Director }
  - { label: Venue, value: "CCCB, Barcelona" }
links:
  - { label: Website, url: "https://…" }
credits:
  - { role: Creative coding, name: Carles Sora }
related:
  - { title: "Article o notícia de premsa", url: "https://…" }
---
Text del projecte en Markdown. Pots fer **negretes**, *cursives*, [enllaços](https://…) i llistes.
```

Tots els camps són opcionals tret de `title`, `year` i `type`. Els projectes s'ordenen sols per any.

### Imatges dels projectes

No cal escriure `cover` ni `gallery`: deixa les imatges a `src/img/projects/` amb el mateix nom que el fitxer `.md` del projecte i el web les agafa sol.

- `ciutat-i-joc.jpg` → imatge principal de `ciutat-i-joc.md`
- `ciutat-i-joc-2.jpg`, `ciutat-i-joc-3.jpg`… → galeria

Serveixen `.jpg`, `.png` i `.webp`. Millor horitzontals, d'uns 1600 px d'ample i menys de 500 KB.

A les graelles de projectes (portada i /projects/) només es mostra la meitat de les imatges, triades a l'atzar cada vegada que algú entra o recarrega; la resta surten amb les línies. Ho fa `src/assets/sora.js` (bloc «Project grids»). A la pàgina de cada projecte la imatge surt sempre.

## Afegir una notícia

Crea `src/news/2026-11-titol-curt.md`:

```markdown
---
title: Títol de la notícia
date: 2026-11-10
tag: Talk
summary: Una línia per al llistat de notícies.
cover: /img/news/imatge.jpg
---
Text de la notícia.
```

## Publicacions

Les publicacions surten de dos llocs:

- **ORCID** ([0000-0003-2761-2384](https://orcid.org/0000-0003-2761-2384)). Quan afegeixis publicacions al teu ORCID, executa:

  ```bash
  npm run orcid
  ```

  Això reescriu `src/_data/publications-orcid.json`. No editis aquest fitxer a mà, perquè es torna a generar cada vegada. Si tenies `npm start` en marxa, atura'l (Ctrl+C) i torna'l a engegar per veure-les.
- **A mà**, a `src/_data/publications-manual.json`, per a tot el que no tinguis a ORCID: comunicacions, capítols, assaigs…

Quan es genera el web, les dues llistes s'ajunten (`src/_data/publications.js`). Si una publicació és a totes dues (mateix DOI, o mateix títol i tipus), surt una sola vegada, amb les dades d'ORCID i la llista d'autors més completa.

Per afegir una publicació a mà, afegeix un bloc a `publications-manual.json`:

```json
{
  "year": 2026,
  "type": "article",
  "authors": "Sora, C., & Co-author, A.",
  "title": "Títol de l'article",
  "venue": "Nom de la revista, 12(3), 1–20",
  "url": "https://doi.org/…"
}
```

`type` pot ser: `book`, `article`, `chapter`, `conference`, `thesis` o `other`.

### Índex H i cites

Google Scholar no deixa llegir les dades automàticament, així que s'actualitzen a mà a `src/_data/site.json`, al bloc `metrics`:

```json
"metrics": {
  "source": "Google Scholar",
  "updated": "Nov 2026",
  "items": [
    { "label": "h-index", "value": "12" },
    { "label": "i10-index", "value": "15" },
    { "label": "Citations", "value": "480" }
  ]
}
```

Surten en una línia petita al final de la pàgina Publications i a la portada. Si l'h-index és buit, no surt res. L'enllaç "Google Scholar" és el de `links`.

## Editar des de la web de GitHub (sense instal·lar res)

1. Obre el repositori a github.com/carlesora i entra al fitxer que vulguis canviar.
2. Clica el llapis (✏️), fes el canvi i clica **Commit changes**.
3. En un o dos minuts el web s'actualitza sol. Pots seguir el procés a la pestanya **Actions**.

Per pujar una imatge: entra a `src/img/projects/`, clica **Add file → Upload files**.

## Treballar al Mac

```bash
npm install      # només el primer cop
npm start        # vista prèvia a http://localhost:8080
```

## Publicació (es fa una sola vegada)

1. Crea un repositori a GitHub (per exemple `carlesora/carlesora.com`) i puja-hi aquesta carpeta.
2. A **Settings → Pages → Build and deployment**, tria **Source: GitHub Actions**.
3. El web quedarà a `https://carlesora.github.io/carlesora.com/`. Cada canvi a la branca `main` el torna a publicar sol (`.github/workflows/deploy.yml`).

### Domini propi (carlesora.com)

1. A **Settings → Pages → Custom domain**, escriu `carlesora.com` i desa.
2. Al proveïdor del domini, canvia el DNS:
   - Quatre registres `A` per a `carlesora.com`: `185.199.108.153`, `185.199.109.153`, `185.199.110.153` i `185.199.111.153`.
   - Un registre `CNAME` per a `www` que apunti a `carlesora.github.io`.
3. Quan GitHub hagi validat el domini, marca **Enforce HTTPS**.

> ⚠️ Si tens el correu a @carlesora.com al mateix proveïdor, **no esborris els registres MX**, o deixarà de funcionar.

## Pendents de revisar

- [ ] AI&MUSIC: falta el text i una imatge (`src/projects/ai-music.md`).
- [ ] Anys a confirmar: *L'Escala* (he posat 2013) i *Madonna de los deseos* (he posat 2008).
- [ ] Docència posterior a 2019 (les publicacions ja venen d’ORCID). Revisar també els congressos posteriors a 2019, que no són a ORCID.
- [ ] Enllaç de LinkedIn i el PDF del CV (a `site.json`).
- [ ] Projectes sense imatge (surten amb línies): posar-ne a `src/img/projects/<nom>.jpg`. Revisar els textos dels projectes nous.
- [ ] *PrometZeus* (2004), al CV però encara no al web.
- [ ] Correu de contacte: ara és el del document antic (carles@csora.org).
