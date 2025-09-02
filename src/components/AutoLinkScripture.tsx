// src/components/AutoLinkScripture.tsx
import React from "react";

// A practical (not perfect) matcher for many common Bible book names + refs.
// Examples it matches: "John 3:16", "1 John 4:7–8", "Gen 1:1-3", "Rev 21:1"
const BOOK = String.raw`(?:(?:1|2|3)\s*)?(?:Genesis|Gen|Exodus|Exod|Leviticus|Lev|Numbers|Num|Deuteronomy|Deut|Dt|Joshua|Josh|Judges|Judg|Ruth|1\s*Samuel|2\s*Samuel|1\s*Kings|2\s*Kings|1\s*Chronicles|2\s*Chronicles|Ezra|Nehemiah|Neh|Esther|Job|Psalms?|Ps|Proverbs?|Prov|Ecclesiastes|Ecc|Song(?:\s+of\s+(?:Songs|Solomon))?|Isaiah|Isa|Jeremiah|Jer|Lamentations|Lam|Ezekiel|Ezek|Daniel|Dan|Hosea|Hos|Joel|Amos|Obadiah|Obad|Jonah|Micah|Nahum|Nah|Habakkuk|Hab|Zephaniah|Zeph|Haggai|Hag|Zechariah|Zech|Malachi|Mal|Matthew|Matt|Mt|Mark|Mk|Luke|Lk|John|Jn|Acts|Romans|Rom|1\s*Corinthians|2\s*Corinthians|Galatians|Gal|Ephesians|Eph|Philippians|Phil|Colossians|Col|1\s*Thessalonians|2\s*Thessalonians|1\s*Timothy|2\s*Timothy|Titus|Philemon|Hebrews|Heb|James|Jas|1\s*Peter|2\s*Peter|1\s*John|2\s*John|3\s*John|Jude|Revelation|Rev)`;
const CHAP_VER = String.raw`\s+\d{1,3}(?::\d{1,3}(?:[–-]\d{1,3})?)?`;
const RANGE2 = String.raw`(?:\s*[–-]\s*\d{1,3}(?::\d{1,3})?)?`; // John 3:16–18 or John 3:16–4:1 (simple)
const REF_REGEX = new RegExp(`${BOOK}${CHAP_VER}${RANGE2}`, "gi");

function toGatewayUrl(ref: string) {
  // Normalize whitespace for URL; default to KJV
  const q = ref.replace(/\s+/g, " ").trim();
  return `https://www.biblegateway.com/passage/?search=${encodeURIComponent(q)}&version=KJV`;
}

export default function AutoLinkScripture({
  text,
  className = "whitespace-pre-wrap",
}: {
  text: string;
  className?: string;
}) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;

  for (const m of text.matchAll(REF_REGEX)) {
    const match = m[0];
    const start = m.index ?? 0;
    const end = start + match.length;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }
    parts.push(
      <a
        key={`${start}-${end}-${match}`}
        href={toGatewayUrl(match)}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:no-underline"
      >
        {match}
      </a>
    );
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <p className={className}>{parts}</p>;
}
