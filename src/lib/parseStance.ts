// src/lib/parseStance.ts
export type Stance =
  | "agree"
  | "disagree"
  | "question"
  | "insight"
  | "resource"
  | "prayer";

const RE = /^\s*\[(agree|disagree|question|insight|resource|prayer)\]\s*/i;

/**
 * Extracts an optional stance tag like:
 *   [Disagree] This is why...
 * Returns the normalized stance and the comment body without the tag.
 */
export function parseStance(input: string): { stance: Stance | null; body: string } {
  const m = input.match(RE);
  if (!m) return { stance: null, body: input };
  return { stance: m[1].toLowerCase() as Stance, body: input.slice(m[0].length) };
}
