import { readFileSync } from "node:fs";
import path from "node:path";
import metaJson from "@/content/blog/meta.json";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export type BlogInline =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "em"; value: string }
  | { type: "link"; value: string; href: string };

export type BlogBlock =
  | { type: "h1"; text: string }
  | { type: "h2"; text: string }
  | { type: "p"; children: BlogInline[] }
  | { type: "ul"; items: BlogInline[][] }
  | { type: "ol"; items: BlogInline[][] }
  | { type: "video" }
  | { type: "image"; src: string; alt: string }
  | { type: "hr" };

export type BlogMeta = typeof metaJson;

export type BlogIndex = {
  title: string;
  titleAccent: string;
  label: string;
  lede: string[];
  article: BlogMeta["article"] & { dateLabel: string };
};

export type BlogArticle = {
  slug: string;
  title: string;
  seoTitle: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  date: string;
  dateLabel: string;
  author: string;
  category: string;
  path: string;
  video: BlogMeta["video"];
  cta: BlogMeta["cta"];
  blocks: BlogBlock[];
};

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export function getBlogMeta(): BlogMeta {
  return metaJson;
}

export function formatBlogDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number);
  if (!year || !month || !day) return iso;
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

export function rewriteBlogHref(href: string) {
  if (href === "/#book" || href.endsWith("#book")) return "/#contact";
  return href;
}

export function isExternalHref(href: string) {
  return /^https?:\/\//.test(href);
}

function parseInline(text: string): BlogInline[] {
  const out: BlogInline[] = [];
  const token = /\*\*(.+?)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = token.exec(text))) {
    if (match.index > last) {
      out.push({ type: "text", value: text.slice(last, match.index) });
    }
    if (match[1] !== undefined) {
      out.push({ type: "strong", value: match[1] });
    } else if (match[2] !== undefined) {
      out.push({ type: "em", value: match[2] });
    } else {
      out.push({
        type: "link",
        value: match[3],
        href: rewriteBlogHref(match[4]),
      });
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) {
    out.push({ type: "text", value: text.slice(last) });
  }
  return out;
}

function inlinePlain(children: BlogInline[]) {
  return children.map((node) => node.value).join("");
}

function parseMarkdown(raw: string): BlogBlock[] {
  const withVideo = raw.replace(/<!--\s*VIDEO[\s\S]*?-->/g, "\n\n:::video:::\n\n");
  const lines = withVideo.replace(/\r\n/g, "\n").split("\n");
  const blocks: BlogBlock[] = [];
  let i = 0;

  const flushParagraph = (buf: string[]) => {
    const text = buf.join(" ").trim();
    if (text) blocks.push({ type: "p", children: parseInline(text) });
  };

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim() === ":::video:::") {
      blocks.push({ type: "video" });
      i += 1;
      continue;
    }

    const imageMatch = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (imageMatch) {
      blocks.push({ type: "image", alt: imageMatch[1], src: imageMatch[2] });
      i += 1;
      continue;
    }

    if (line.trim() === "---") {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3).trim() });
      i += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2).trim() });
      i += 1;
      continue;
    }

    const ulMatch = line.match(/^[-*] /);
    const olMatch = line.match(/^\d+\. /);
    if (ulMatch || olMatch) {
      const ordered = Boolean(olMatch);
      const items: BlogInline[][] = [];
      const marker = ordered ? /^\d+\. / : /^[-*] /;
      while (i < lines.length && marker.test(lines[i])) {
        items.push(parseInline(lines[i].replace(marker, "").trim()));
        i += 1;
      }
      blocks.push({ type: ordered ? "ol" : "ul", items });
      continue;
    }

    const buf = [line];
    i += 1;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("## ") &&
      !/^[-*] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      lines[i].trim() !== "---" &&
      lines[i].trim() !== ":::video:::" &&
      !/^!\[[^\]]*\]\([^)]+\)$/.test(lines[i].trim())
    ) {
      buf.push(lines[i]);
      i += 1;
    }
    flushParagraph(buf);
  }

  return blocks;
}

function readMarkdown(filename: string) {
  return readFileSync(path.join(BLOG_DIR, filename), "utf8");
}

export function getBlogIndex(): BlogIndex {
  const meta = getBlogMeta();
  const blocks = parseMarkdown(readMarkdown("index.md"));
  const heading =
    blocks.find((block): block is Extract<BlogBlock, { type: "h1" }> => block.type === "h1")
      ?.text ?? "Blog";
  const comma = heading.indexOf(",");
  const title = comma >= 0 ? heading.slice(0, comma + 1) : heading;
  const titleAccent = comma >= 0 ? heading.slice(comma + 1).trim() : "";
  const lede = blocks
    .filter((block): block is Extract<BlogBlock, { type: "p" }> => block.type === "p")
    .slice(0, 2)
    .map((block) => inlinePlain(block.children));

  return {
    title,
    titleAccent,
    label: meta.section.navLabel,
    lede,
    article: {
      ...meta.article,
      dateLabel: formatBlogDate(meta.article.date),
    },
  };
}

export function getBlogSlugs() {
  return [getBlogMeta().article.slug];
}

export function getBlogArticle(slug: string): BlogArticle | null {
  const meta = getBlogMeta();
  if (slug !== meta.article.slug) return null;

  const blocks = parseMarkdown(readMarkdown(`${slug}.md`));

  return {
    slug: meta.article.slug,
    title: meta.article.title,
    seoTitle: meta.article.seoTitle,
    description: meta.article.description,
    ogTitle: meta.article.ogTitle,
    ogDescription: meta.article.ogDescription,
    date: meta.article.date,
    dateLabel: formatBlogDate(meta.article.date),
    author: meta.article.author,
    category: meta.article.category,
    path: meta.article.path,
    video: meta.video,
    cta: {
      ...meta.cta,
      href: rewriteBlogHref(meta.cta.href),
    },
    blocks,
  };
}
