/*
 * Turns a CMS page body (rich-text HTML) into structured pieces the public
 * website can lay out as designed sections:
 *
 *   first <h1>                      → page heading
 *   first <p> before any <h2>       → lead paragraph
 *   <h2>                            → starts a section
 *   <ul> whose items start in bold  → feature cards ("**Title** – text")
 *   any other <ul>                  → checklist
 *   first <blockquote>              → testimonial ("Quote" – Who)
 *   everything else                 → rich text, rendered as-is
 *
 * Editors keep writing normal rich text; the site picks the right layout.
 */

export interface FeatureItem {
  title: string;
  text: string;
}

export type CmsBlock =
  | { kind: "features"; items: FeatureItem[] }
  | { kind: "checklist"; items: string[] }
  | { kind: "html"; html: string };

export interface CmsSection {
  title: string | null;
  blocks: CmsBlock[];
}

export interface ParsedPage {
  heading: string | null;
  lead: string | null;
  sections: CmsSection[];
  quote: { text: string; cite: string | null } | null;
}

const LEADING_DASH = /^\s*[–—:-]\s*/;

/** The element holding a list item's text (Tiptap wraps it in a <p>). */
function itemBody(li: Element): Element {
  const first = li.firstElementChild;
  return first?.tagName === "P" ? first : li;
}

function boldLead(li: Element): string | null {
  const body = itemBody(li);
  const strong = body.firstElementChild;
  if (strong?.tagName !== "STRONG") return null;
  const title = strong.textContent?.trim() ?? "";
  const text = body.textContent?.trim() ?? "";
  return title && text.startsWith(title) ? title : null;
}

function parseQuote(raw: string) {
  const match = raw.match(/^([\s\S]*?)\s+[–—-]\s+([^–—]+)$/);
  const text = (match ? match[1] : raw).trim().replace(/^["“”']+|["“”']+$/g, "").trim();
  return { text, cite: match ? match[2].trim() : null };
}

export function capitalize(text: string) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

export function parsePageBody(html: string): ParsedPage {
  const page: ParsedPage = { heading: null, lead: null, sections: [], quote: null };
  if (typeof DOMParser === "undefined") return page;

  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  let current: CmsSection | null = null;
  const section = (): CmsSection => {
    if (current) return current;
    const created: CmsSection = { title: null, blocks: [] };
    page.sections.push(created);
    current = created;
    return created;
  };

  for (const el of Array.from(doc.body.children)) {
    const tag = el.tagName;
    const text = el.textContent?.trim() ?? "";

    if (tag === "H1" && page.heading === null) {
      page.heading = text;
      continue;
    }
    if (tag === "P" && !text && !el.querySelector("img")) continue;
    if (tag === "P" && page.lead === null && page.sections.length === 0) {
      page.lead = text;
      continue;
    }
    if (tag === "H2") {
      current = { title: text, blocks: [] };
      page.sections.push(current);
      continue;
    }
    if (tag === "BLOCKQUOTE" && page.quote === null) {
      page.quote = parseQuote(text);
      continue;
    }
    if (tag === "UL") {
      const items = Array.from(el.children).filter((c) => c.tagName === "LI");
      const titles = items.map(boldLead);
      if (items.length > 0 && titles.every(Boolean)) {
        section().blocks.push({
          kind: "features",
          items: items.map((li, i) => ({
            title: titles[i]!,
            text: capitalize((itemBody(li).textContent ?? "").trim().slice(titles[i]!.length).replace(LEADING_DASH, "").trim()),
          })),
        });
      } else {
        section().blocks.push({
          kind: "checklist",
          items: items.map((li) => li.textContent?.trim() ?? "").filter(Boolean),
        });
      }
      continue;
    }

    const target = section();
    const last = target.blocks[target.blocks.length - 1];
    if (last?.kind === "html") last.html += el.outerHTML;
    else target.blocks.push({ kind: "html", html: el.outerHTML });
  }

  return page;
}

/** Plain-text intro of a section: its first rich-text paragraph, if any. */
export function sectionIntro(section: CmsSection): { intro: string | null; rest: CmsBlock[] } {
  const first = section.blocks[0];
  if (first?.kind !== "html" || typeof DOMParser === "undefined") return { intro: null, rest: section.blocks };
  const doc = new DOMParser().parseFromString(`<body>${first.html}</body>`, "text/html");
  const nodes = Array.from(doc.body.children);
  if (nodes[0]?.tagName !== "P") return { intro: null, rest: section.blocks };
  const intro = nodes[0].textContent?.trim() || null;
  const remaining = nodes.slice(1).map((n) => n.outerHTML).join("");
  return {
    intro,
    rest: remaining ? [{ kind: "html", html: remaining }, ...section.blocks.slice(1)] : section.blocks.slice(1),
  };
}
