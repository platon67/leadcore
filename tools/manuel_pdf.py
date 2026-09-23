#!/usr/bin/env python3
"""Leadcore — assemble docs/os/ en un seul PDF à lire.

    pip install markdown pymupdf    # une fois
    python3 tools/manuel_pdf.py     # → docs/os/Leadcore-OS.pdf

Le Markdown de docs/os/ reste la source ; ce PDF n'est qu'un rendu. Après une
modification du manuel, relancer le script plutôt que retoucher le PDF.

Rendu par Chromium via Playwright (paquet npm global, comme les autres outils
de tools/). Fontes de la charte, reprises de site/assets/fonts/.
"""

import datetime
import html
import os
import re
import subprocess
import tempfile

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OS_DIR = os.path.join(ROOT, "docs", "os")
FONTS = os.path.join(ROOT, "site", "assets", "fonts")
OUT = os.path.join(OS_DIR, "Leadcore-OS.pdf")
CHROME = os.environ.get("CHROME", "/opt/pw-browsers/chromium-1194/chrome-linux/chrome")

FILES = [
    "README.md", "00-RECHERCHE.md", "01-MOTEUR-A.md", "02-MOTEUR-B.md",
    "03-STACK.md", "04-N8N.md", "05-DONNEES.md", "06-ECONOMIE.md",
    "07-PANNES.md", "08-CONFORMITE.md", "09-SOP.md", "10-ROADMAP.md",
    "11-AUDIT-V2.md", "12-PROMPTS.md",
]


def file_id(name):
    return "f-" + name.lower().replace(".md", "")


def rewrite_links(md, name):
    """Liens entre fichiers du manuel → ancres internes ; le reste → texte."""
    def repl(m):
        text, target = m.group(1), m.group(2)
        if target.startswith(("http://", "https://", "mailto:")):
            return m.group(0)
        path = target.split("#")[0]
        base = os.path.basename(path)
        if base in FILES:
            return f"[{text}](#{file_id(base)})"
        return text  # fichier hors manuel (schema.sql, simulateur, docs parents)
    return re.sub(r"(?<!!)\[([^\]]+)\]\(([^)\s]+)\)", repl, md)


def section_html(name):
    with open(os.path.join(OS_DIR, name), encoding="utf-8") as f:
        md = f.read()
    # la ligne « Partie de l'Operating System… » n'a pas de sens dans un seul document
    md = re.sub(r"^Partie de l'\[Operating System[^\n]*\n+", "", md, flags=re.M)
    md = rewrite_links(md, name)
    body = markdown.markdown(
        md, extensions=["tables", "fenced_code", "sane_lists", "toc"],
        extension_configs={"toc": {"toc_depth": "2-2"}},
    )
    m = re.search(r"<h1[^>]*>(.*?)</h1>", body, flags=re.S)
    title = re.sub("<[^>]+>", "", m.group(1)) if m else name
    h2 = [re.sub("<[^>]+>", "", t) for t in re.findall(r"<h2[^>]*>(.*?)</h2>", body, flags=re.S)]
    # ids uniques dans le document assemblé
    body = re.sub(r'id="([^"]+)"', lambda x: f'id="{file_id(name)}-{x.group(1)}"', body)
    return title, h2, body


def build_html():
    sections, toc = [], []
    for name in FILES:
        title, h2, body = section_html(name)
        fid = file_id(name)
        if name == "README.md":
            title = "Vue d'ensemble"
            body = re.sub(r"<h1[^>]*>.*?</h1>", "<h1>Vue d'ensemble</h1>", body, count=1, flags=re.S)
        num, _, label = title.partition(" — ")
        label = label or title
        num = num if label != title else ""
        sub = "".join(f"<li>{html.escape(html.unescape(t))}</li>" for t in h2)
        toc.append(
            f'<li><a href="#{fid}"><span class="n">{html.escape(num)}</span>'
            f'<span class="t">{html.escape(html.unescape(label))}</span></a>'
            f'{"<ul>" + sub + "</ul>" if sub and name != "README.md" else ""}</li>'
        )
        sections.append(f'<section class="part" id="{fid}">{body}</section>')

    today = datetime.date.today()
    mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet",
            "août", "septembre", "octobre", "novembre", "décembre"][today.month - 1]
    font = lambda f: "file://" + os.path.join(FONTS, f)
    return f"""<!doctype html>
<html lang="fr"><head><meta charset="utf-8">
<title>Leadcore — Outbound &amp; Delivery OS</title>
<style>
@font-face {{ font-family: Geist; font-weight: 400 800; src: url({font('geist-latin-19f9c925.woff2')}); }}
@font-face {{ font-family: Geist; font-weight: 400 800; src: url({font('geist-latin-ext-824f485b.woff2')}); unicode-range: U+0100-02BA, U+1E00-1EFF, U+2020, U+20A0-20C0, U+2113; }}
@font-face {{ font-family: 'Geist Mono'; font-weight: 400 600; src: url({font('geist-mono-latin-684ad5b5.woff2')}); }}
@font-face {{ font-family: 'Geist Mono'; font-weight: 400 600; src: url({font('geist-mono-latin-ext-1a189eb9.woff2')}); unicode-range: U+0100-02BA, U+1E00-1EFF; }}
@font-face {{ font-family: Lora; font-style: italic; src: url({font('lora-latin-723cc14f.woff2')}); }}

:root {{
  --ink: #0C1413; --text: #1B2623; --muted: #5B6B65; --line: #D5E1DC; --soft: #F3F8F6;
  --accent: #0F7A56; --accent-bg: #E6F4EE; --amber: #8A5A14; --amber-bg: #FBF3E6;
}}
* {{ box-sizing: border-box; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ font-family: Geist, 'DejaVu Sans', sans-serif; font-size: 9.6pt; line-height: 1.55;
        color: var(--text); margin: 0; font-feature-settings: "ss01"; hyphens: auto; }}

/* Couverture */
.cover {{ height: 296mm; background: #0C1413; color: #F2F8F5; padding: 30mm 22mm;
          display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; }}
.cover .brand {{ font-weight: 700; letter-spacing: .02em; font-size: 13pt; display: flex; align-items: center; gap: 10px; }}
.cover .brand::before {{ content: ""; width: 12px; height: 12px; border-radius: 50%; background: #19C78B;
                          box-shadow: 0 0 0 5px rgba(25,199,139,.18); }}
.cover h1 {{ font-size: 40pt; line-height: 1.05; margin: 0 0 8mm; font-weight: 700; letter-spacing: -.02em;
              color: #F2F8F5; border: 0; padding: 0; }}
.cover h1 em {{ font-family: Lora, serif; font-weight: 400; color: #5CEDBA; }}
.cover p.lead {{ font-size: 13pt; line-height: 1.5; color: #A9BDB4; max-width: 140mm; margin: 0; }}
.cover .meta {{ font-size: 9.5pt; color: #7E9289; border-top: 1px solid #26332F; padding-top: 5mm;
                display: flex; justify-content: space-between; }}

/* Sommaire */
.toc {{ page-break-after: always; }}
.toc h1 {{ margin-top: 0; }}
body.only-cover > :not(.cover), body.no-cover > .cover {{ display: none; }}
.reco strong {{ display: inline; }}
.toc > ol {{ list-style: none; padding: 0; margin: 0; columns: 2; column-gap: 10mm; }}
.toc > ol > li {{ break-inside: avoid; margin: 0 0 3.2mm; }}
.toc a {{ text-decoration: none; color: var(--ink); display: flex; gap: 3mm; font-weight: 600; font-size: 9.8pt; }}
.toc .n {{ color: var(--accent); font-family: 'Geist Mono', monospace; min-width: 7mm; }}
.toc ul {{ list-style: none; margin: 1mm 0 0 10mm; padding: 0; color: var(--muted); font-size: 7.3pt; line-height: 1.35; }}

/* Parties */
.part {{ page-break-before: always; }}
h1 {{ font-size: 24pt; line-height: 1.15; color: var(--ink); letter-spacing: -.015em; margin: 0 0 6mm;
      padding-bottom: 4mm; border-bottom: 2px solid var(--accent); font-weight: 700; }}
h2 {{ font-size: 15pt; color: var(--ink); margin: 9mm 0 3mm; letter-spacing: -.01em; font-weight: 700;
      break-after: avoid; }}
h3 {{ font-size: 11.5pt; color: var(--accent); margin: 6mm 0 2mm; font-weight: 650; break-after: avoid; }}
h4 {{ font-size: 10pt; margin: 4mm 0 1.5mm; break-after: avoid; }}
p {{ margin: 0 0 2.6mm; orphans: 3; widows: 3; }}
strong {{ color: var(--ink); font-weight: 650; }}
a {{ color: var(--accent); text-decoration: none; }}
hr {{ border: 0; border-top: 1px solid var(--line); margin: 6mm 0; }}
ul, ol {{ margin: 0 0 3mm; padding-left: 5.5mm; }}
li {{ margin: .6mm 0; }}
code {{ font-family: 'Geist Mono', monospace; font-size: .86em; background: var(--soft);
        padding: .2mm 1mm; border-radius: 3px; color: #10302A; }}

/* Diagrammes et blocs de code */
pre {{ background: var(--soft); border: 1px solid var(--line); border-radius: 6px; padding: 3.5mm 4mm;
       overflow: hidden; break-inside: avoid; margin: 0 0 4mm; line-height: 1.32; }}
pre code {{ background: none; padding: 0; font-size: 7.6pt; color: #16302A; white-space: pre; }}

/* Tableaux */
table {{ width: 100%; border-collapse: collapse; margin: 1mm 0 4.5mm; font-size: 8.1pt; line-height: 1.4; }}
thead {{ display: table-header-group; }}
tr {{ break-inside: avoid; }}
th {{ text-align: left; background: var(--accent-bg); color: #0B4A35; font-weight: 650;
      padding: 1.8mm 2mm; border-bottom: 1.5px solid var(--accent); vertical-align: bottom; }}
td {{ padding: 1.6mm 2mm; border-bottom: 1px solid var(--line); vertical-align: top; }}
tbody tr:nth-child(even) td {{ background: #FAFCFB; }}
th:empty {{ display: none; }}

/* Citations : emails types, encadrés RECOMMANDATION */
blockquote {{ margin: 0 0 4mm; padding: 3mm 4.5mm; border-left: 3px solid var(--accent); background: var(--accent-bg);
              border-radius: 0 6px 6px 0; break-inside: avoid; }}
blockquote p {{ margin: 0 0 1.6mm; }}
blockquote p:last-child {{ margin: 0; }}
blockquote.email {{ background: #fff; border: 1px solid var(--line); border-left: 3px solid var(--accent);
                    font-family: Lora, Georgia, serif; font-style: italic; font-size: 10pt; color: #22302C; }}
blockquote.reco {{ background: var(--amber-bg); border-left-color: #C98A2E; }}
</style></head><body>

<div class="cover">
  <div class="brand">Leadcore</div>
  <div>
    <h1>Outbound &amp; Delivery OS<br><em>le manuel opérationnel</em></h1>
    <p class="lead">Comment Leadcore trouve et signe ses clients, puis construit pour chacun
    une machine outbound qui livre des rendez-vous qualifiés. Recherche, architecture,
    outils, workflows, données, économie, conformité, SOP et roadmap.</p>
  </div>
  <div class="meta"><span>Document interne · {mois} {today.year}</span><span>Version 1</span></div>
</div>

<nav class="toc"><h1>Sommaire</h1><ol>{''.join(toc)}</ol></nav>

{''.join(sections)}
</body></html>"""


PRINT_JS = r"""
const { chromium } = require('playwright');
const [,, htmlPath, coverPath, bodyPath, chrome] = process.argv;
(async () => {
  const b = await chromium.launch({ executablePath: chrome });
  // Largeur utile d'une page A4 à 16 mm de marge : 178 mm ≈ 673 px.
  // Les mesures de débordement se font donc à la largeur imprimée.
  const p = await b.newPage({ viewport: { width: 673, height: 1000 } });
  await p.goto('file://' + htmlPath, { waitUntil: 'load' });
  await p.emulateMedia({ media: 'print' });
  await p.evaluate(async () => {
    await document.fonts.ready;
    for (const q of document.querySelectorAll('blockquote')) {
      const t = q.textContent.trim();
      if (t.startsWith('RECOMMANDATION')) {
        q.classList.add('reco');
        q.querySelectorAll('strong').forEach((s, i) => {
          if (i > 0) s.before(document.createElement('br'));
          const n = s.nextSibling;  // « — » après le libellé
          if (n && n.nodeType === 3) n.textContent = n.textContent.replace(/^\s*—\s*/, ' · ');
        });
      } else if (t.startsWith('Objet') || t.startsWith('Bonjour') || t.startsWith('Vous recevez')) {
        q.classList.add('email');
      }
    }
    document.body.classList.add('no-cover');
    for (const pre of document.querySelectorAll('pre')) {
      const c = pre.querySelector('code') || pre;
      let s = 7.6;
      while (pre.scrollWidth > pre.clientWidth + 1 && s > 4.2) { s -= 0.2; c.style.fontSize = s + 'pt'; }
    }
    for (const t of document.querySelectorAll('table')) {
      const box = t.parentElement.clientWidth;
      let s = 8.1;
      while (t.scrollWidth > box + 1 && s > 5.6) { s -= 0.3; t.style.fontSize = s + 'pt'; }
    }
  });
  await p.pdf({
    path: bodyPath, format: 'A4', printBackground: true,
    margin: { top: '18mm', bottom: '18mm', left: '16mm', right: '16mm' },
    displayHeaderFooter: true,
    headerTemplate: '<span></span>',
    footerTemplate: `<div style="width:100%;font-family:sans-serif;font-size:7pt;color:#7E8E88;
      padding:0 16mm;display:flex;justify-content:space-between">
      <span>Leadcore · Outbound &amp; Delivery OS</span>
      <span class="pageNumber"></span></div>`,
  });
  await p.evaluate(() => { document.body.classList.remove('no-cover'); document.body.classList.add('only-cover'); });
  await p.pdf({ path: coverPath, format: 'A4', printBackground: true, pageRanges: '1',
                margin: { top: '0', bottom: '0', left: '0', right: '0' } });
  await b.close();
})();
"""


def main():
    import pymupdf  # fusion couverture + corps

    page = build_html()
    with tempfile.TemporaryDirectory() as tmp:
        hp, js = os.path.join(tmp, "manuel.html"), os.path.join(tmp, "print.js")
        cover, body = os.path.join(tmp, "cover.pdf"), os.path.join(tmp, "body.pdf")
        with open(hp, "w", encoding="utf-8") as f:
            f.write(page)
        with open(js, "w", encoding="utf-8") as f:
            f.write(PRINT_JS)
        env = dict(os.environ)
        env["NODE_PATH"] = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
        subprocess.run(["node", js, hp, cover, body, CHROME], check=True, env=env)
        doc = pymupdf.open(cover)
        doc.insert_pdf(pymupdf.open(body))
        doc.set_metadata({"title": "Leadcore — Outbound & Delivery OS", "author": "Leadcore"})
        doc.save(OUT, garbage=3, deflate=True)
    print(OUT)


if __name__ == "__main__":
    main()
