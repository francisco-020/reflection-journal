// src/components/RenderEntryBody.tsx
import React from "react";

// Scripture matcher (same spirit as AutoLinkScripture)
const BOOK = String.raw`(?:(?:1|2|3)\s*)?(?:Genesis|Gen|Exodus|Exod|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Dt|Joshua|Josh|Judges|Judg|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|1\s*Chronicles|2\s*Chronicles|Ezra|Nehemiah|Neh|Esther|Job|Psalms?|Ps|Proverbs?|Prov|Ecclesiastes|Ecc|Song(?:\s+of\s+(?:Songs|Solomon))?|Isaiah|Isa|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Daniel|Dan|Hosea|Hos|Joel|Amos|Obadiah|Obad|Jonah|Micah|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|Matthew|Matt|Mt|Mark|Mk|Luke|Lk|John|Jn|Acts|Romans|Rom|1\s*Corinthians|2\s*Corinthians|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|Heb|James|Jas|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation|Rev)`;
const CHAP_VER = String.raw`\s+\d{1,3}(?::\d{1,3}(?:[–-]\d{1,3})?)?`;
const RANGE2 = String.raw`(?:\s*[–-]\s*\d{1,3}(?::\d{1,3})?)?`;
const REF_REGEX = new RegExp(`${BOOK}${CHAP_VER}${RANGE2}`, "gi");
function toGatewayUrl(ref: string) {
  const q = ref.replace(/\s+/g, " ").trim();
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(q)}&version=KJV`;
}

// inline: **bold** + Scripture links
function renderInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const m of text.matchAll(REF_REGEX)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > last) parts.push(...boldify(text.slice(last, start)));
    parts.push(
      <a
        key={`ref-${start}-${end}`}
        href={toGatewayUrl(m[0])}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:no-underline"
      >
        {m[0]}
      </a>
    );
    last = end;
  }
  if (last < text.length) parts.push(...boldify(text.slice(last)));
  return parts;
}

// very small **bold** parser
const BOLD_RE = /\*\*(.+?)\*\*/g;
function boldify(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(BOLD_RE)) {
    const start = m.index ?? 0;
    const end = start + m[0].length;
    if (start > last) out.push(text.slice(last, start));
    out.push(<strong key={`b-${start}-${end}`}>{m[1]}</strong>);
    last = end;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export default function RenderEntryBody({ text }: { text: string }) {
  // Split by lines to detect simple structure
  const lines = (text ?? "").split(/\r?\n/);

  const blocks: React.ReactNode[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Headings: "Why I agree:" / "Why I wrestle:"
    if (/^\s*why i agree:/i.test(line)) {
      blocks.push(
        <h3 key={`h-${i}`} className="mt-6 text-lg font-semibold text-slate-900">
          Why I agree
        </h3>
      );
      i++;
      continue;
    }
    if (/^\s*why i wrestle:/i.test(line)) {
      blocks.push(
        <h3 key={`h-${i}`} className="mt-6 text-lg font-semibold text-slate-900">
          Why I wrestle
        </h3>
      );
      i++;
      continue;
    }

    // Bullet list: consecutive lines starting with "- " or "* "
    if (/^\s*[-*]\s+/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const itemText = lines[i].replace(/^\s*[-*]\s+/, "");
        items.push(
          <li key={`li-${i}`} className="leading-relaxed">
            {renderInline(itemText)}
          </li>
        );
        i++;
      }
      blocks.push(
        <ul key={`ul-${i}`} className="my-2 list-disc pl-6 text-slate-800">
          {items}
        </ul>
      );
      continue;
    }

    // Blank line => spacer
    if (!line.trim()) {
      blocks.push(<div key={`sp-${i}`} className="h-2" />);
      i++;
      continue;
    }

    // Normal paragraph
    blocks.push(
      <p key={`p-${i}`} className="whitespace-pre-wrap leading-relaxed text-slate-800">
        {renderInline(line)}
      </p>
    );
    i++;
  }

  return <div className="prose prose-slate max-w-none">{blocks}</div>;
}
