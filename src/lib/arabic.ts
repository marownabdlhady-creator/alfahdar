/* Arabic text normalization for search.

   Everything that goes into the search index and every query the visitor
   types passes through normalizeArabic() first, so "مُكيّف"، "مكيف" and
   "مكــيف" all reduce to the same string and compare equal. The rules
   below cover what people actually type on a phone keyboard: harakat they
   never write, the hamza forms they write inconsistently, ة/ه and ى/ي at
   the end of a word, and the Persian letters some keyboards emit.

   The patterns are written as \u escapes on purpose: a literal Arabic
   range inside a character class reorders on screen and is impossible to
   review. Each one carries the letters it means in a comment. */

/** Harakat, the dagger alef and the Quranic marks around them. */
const DIACRITICS = /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g;
/** Tatweel (ـ), the decorative letter-stretching character. */
const TATWEEL = /\u0640/g;
/** Zero-width and bidi control characters: invisible, but not equal. */
const INVISIBLE = /[\u200B-\u200F\u202A-\u202E\u2066-\u2069\u061C]/g;
/** آ أ إ ٱ ٲ ٳ ٵ — every written form of alef. */
const ALEF = /[\u0622\u0623\u0625\u0671\u0672\u0673\u0675]/g;
/** Arabic-Indic digits ٠-٩, folded onto 0-9 so "٥" finds "5". */
const ARABIC_DIGITS = /[\u0660-\u0669]/g;
/** Anything that is not an Arabic letter, a latin letter or a digit. */
const SEPARATORS = /[^\u0621-\u064Aa-z0-9]+/g;

/** ة→ه، ى→ي، ؤ→و، ئ→ي، Persian ک→ك و ی→ي, and a lone hamza dropped. */
const LETTER_FOLDS: [RegExp, string][] = [
  [/\u0629/g, "\u0647"], // ة → ه
  [/\u0649/g, "\u064A"], // ى → ي
  [/\u0624/g, "\u0648"], // ؤ → و
  [/\u0626/g, "\u064A"], // ئ → ي
  [/\u06A9/g, "\u0643"], // ک → ك (Persian keyboards)
  [/\u06CC/g, "\u064A"], // ی → ي (Persian keyboards)
  [/\u0621/g, ""], // a lone hamza carries no meaning here
];

/** The one function both the index and the query go through. Returns a
    lowercase, diacritic-free, single-spaced string. */
export function normalizeArabic(input: string): string {
  let text = input
    .toLowerCase()
    .replace(DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(INVISIBLE, "")
    .replace(ARABIC_DIGITS, (digit) => String(digit.charCodeAt(0) - 0x0660))
    .replace(ALEF, "\u0627");

  for (const [pattern, replacement] of LETTER_FOLDS) {
    text = text.replace(pattern, replacement);
  }

  return text.replace(SEPARATORS, " ").trim();
}

/** A normalized string, split into words. */
export function tokenize(normalized: string): string[] {
  return normalized.length === 0 ? [] : normalized.split(" ");
}

/** True when `a` and `b` are the same word or one edit apart — one typo's
    worth of tolerance, walked in a single pass rather than through a
    distance matrix. Callers gate this on a minimum length: a single edit
    on a three-letter word matches far too much. */
export function isOneEditApart(a: string, b: string): boolean {
  if (a === b) return true;

  const lengthA = a.length;
  const lengthB = b.length;
  if (Math.abs(lengthA - lengthB) > 1) return false;

  let i = 0;
  let j = 0;
  let edits = 0;

  while (i < lengthA && j < lengthB) {
    if (a[i] === b[j]) {
      i += 1;
      j += 1;
      continue;
    }

    edits += 1;
    if (edits > 1) return false;

    /* A substitution steps both sides; an insertion or a deletion steps
       only the longer one. */
    if (lengthA > lengthB) i += 1;
    else if (lengthB > lengthA) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }

  return edits + (lengthA - i) + (lengthB - j) <= 1;
}
