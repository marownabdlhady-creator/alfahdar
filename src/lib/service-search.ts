import { isOneEditApart, normalizeArabic, tokenize } from "@/lib/arabic";
import { SERVICE_SYNONYMS } from "@/lib/service-synonyms";
import { SERVICES } from "@/lib/services";

/* The instant service search.

   One flat index, built once at module load from src/lib/services.ts —
   every category plus every sub-service — with the aliases in
   src/lib/service-synonyms.ts attached to the entries they point at. A
   query is normalized, scored against each entry, and the best few come
   back. Everything runs in the browser over ~60 short entries, so it
   costs nothing and needs no network.

   Adding a category or a sub-service to the catalogue indexes it here
   automatically; only the aliases are hand-written. */

export type ServiceSearchResult = {
  /** Stable across renders, so it can key the list and the option ids. */
  id: string;
  /** The sub-service name, or the category title for a category row. */
  label: string;
  /** The parent category, shown under the label. */
  categoryTitle: string;
  /** One short line: the sub-service's own description, or the
      category's summary. */
  hint: string;
  /** The detail page — the primary action. */
  href: string;
  /** The request form, with this category preselected. */
  requestHref: string;
  isCategory: boolean;
};

type IndexEntry = ServiceSearchResult & {
  /** Normalized `label`, and its words. */
  name: string;
  nameTokens: string[];
  /** Normalized aliases from the synonyms map. */
  synonyms: string[];
  /** Normalized catalogue keywords and examples. */
  keywords: string[];
  /** Normalized prose, matched last and worth the least. */
  description: string;
  /** Catalogue order, the tie-breaker between equal scores. */
  rank: number;
};

/* --- Scoring ------------------------------------------------------

   The tiers, in the order the brief asks for: an alias or an exact name
   first, then a name match, then the catalogue's own keywords, then a
   typo, and prose last. A category outranks a sub-service only when both
   matched the same way — a stronger match always wins. */
const SCORE = {
  synonymExact: 130,
  synonymPrefix: 112,
  synonymPartial: 96,
  nameExact: 124,
  namePrefix: 88,
  nameWordPrefix: 78,
  nameContains: 66,
  keywordExact: 72,
  keywordPrefix: 56,
  keywordContains: 46,
  fuzzy: 38,
  description: 20,
} as const;

const CATEGORY_BONUS = 5;

/** Below this, a query is too short to match anything but a prefix. */
const MIN_CONTAINS_LENGTH = 3;
/** Below this, one edit apart is not a typo — it is a different word. */
const MIN_FUZZY_LENGTH = 4;
/** A reversed match ("مكيفات" typed, "مكيف" indexed) needs a real word. */
const MIN_REVERSE_LENGTH = 3;

function normalizeAll(values: string[]) {
  return values.map(normalizeArabic).filter((value) => value.length > 0);
}

/* The words people wrap a request in — "أحتاج", "لو سمحت", "أفضل شركة".
   They carry no service in them, so they are dropped from a multi-word
   query rather than counted against how much of it was matched. The whole
   phrase is still matched as typed first, so a name that contains one of
   these is unaffected. */
const STOPWORDS = new Set(
  normalizeAll([
    "في", "من", "على", "عن", "إلى", "مع", "أو", "ثم", "هل", "لو", "سمحت",
    "أريد", "اريد", "أحتاج", "احتاج", "محتاج", "أبغى", "ابغى", "أبي",
    "عايز", "عاوز", "ممكن", "أفضل", "أحسن", "أرخص", "سعر", "أسعار",
    "تكلفة", "كم", "بكم", "شركة", "مؤسسة", "مكتب", "فني", "عامل",
    "خدمة", "خدمات", "أعمال", "عمل", "بسرعة", "عاجل", "قريب", "عندي",
    "بيتي", "منزلي", "the", "for", "need", "want", "best", "price",
  ]),
);

/** ال — the definite article, stripped from a long enough query word so
    "المواسير" reaches مواسير. The remainder has to be a real word of its
    own — four letters or more — so "الوان" is left as it is. */
const ARTICLE = "ال";
const MIN_ARTICLE_LENGTH = 6;

function withoutArticle(term: string) {
  return term.length >= MIN_ARTICLE_LENGTH && term.startsWith(ARTICLE)
    ? term.slice(ARTICLE.length)
    : term;
}

/* --- The index ---------------------------------------------------- */

const INDEX: IndexEntry[] = [];

for (const service of SERVICES) {
  const requestHref = `/request?service=${service.slug}`;

  INDEX.push({
    id: service.slug,
    label: service.title,
    categoryTitle: service.title,
    hint: service.summary,
    href: service.href,
    requestHref,
    isCategory: true,
    name: normalizeArabic(service.title),
    nameTokens: tokenize(normalizeArabic(service.title)),
    synonyms: [],
    keywords: normalizeAll([
      ...service.examples,
      ...service.keywords,
      service.serviceType,
      service.heading,
    ]),
    description: normalizeArabic(`${service.summary} ${service.description}`),
    rank: INDEX.length,
  });

  for (const sub of service.subServices) {
    INDEX.push({
      id: `${service.slug}-${sub.name}`,
      label: sub.name,
      categoryTitle: service.title,
      hint: sub.description,
      href: service.href,
      requestHref,
      isCategory: false,
      name: normalizeArabic(sub.name),
      nameTokens: tokenize(normalizeArabic(sub.name)),
      synonyms: [],
      keywords: [],
      description: normalizeArabic(sub.description),
      rank: INDEX.length,
    });
  }
}

/* Attach the aliases. A rule that names a sub-service the catalogue no
   longer has falls back to that category's own entry, so a rename never
   silently drops the rule. */
for (const rule of SERVICE_SYNONYMS) {
  const target =
    (rule.subService
      ? INDEX.find(
          (entry) =>
            !entry.isCategory &&
            entry.id === `${rule.category}-${rule.subService}`,
        )
      : undefined) ?? INDEX.find((entry) => entry.id === rule.category);

  target?.synonyms.push(...normalizeAll(rule.keywords));
}

/* --- Matching ------------------------------------------------------ */

/** How well one entry answers one normalized word or phrase, with and
    without a leading definite article. */
function scoreTerm(entry: IndexEntry, term: string): number {
  const direct = scoreExactTerm(entry, term);
  const bare = withoutArticle(term);

  return bare === term ? direct : Math.max(direct, scoreExactTerm(entry, bare));
}

function scoreExactTerm(entry: IndexEntry, term: string): number {
  let score = 0;
  const long = term.length >= MIN_CONTAINS_LENGTH;

  for (const alias of entry.synonyms) {
    if (alias === term) {
      score = Math.max(score, SCORE.synonymExact);
      continue;
    }
    if (alias.startsWith(term)) {
      score = Math.max(score, SCORE.synonymPrefix);
      continue;
    }
    /* The visitor typed more than the alias ("مكيفات" against "مكيف"). */
    if (alias.length >= MIN_REVERSE_LENGTH && term.startsWith(alias)) {
      score = Math.max(score, SCORE.synonymPrefix);
      continue;
    }
    if (long && alias.includes(term)) {
      score = Math.max(score, SCORE.synonymPartial);
    }
  }

  if (entry.name === term) {
    score = Math.max(score, SCORE.nameExact);
  } else if (entry.name.startsWith(term)) {
    score = Math.max(score, SCORE.namePrefix);
  } else if (entry.nameTokens.some((word) => word.startsWith(term))) {
    score = Math.max(score, SCORE.nameWordPrefix);
  } else if (long && entry.name.includes(term)) {
    score = Math.max(score, SCORE.nameContains);
  }

  for (const keyword of entry.keywords) {
    if (keyword === term) {
      score = Math.max(score, SCORE.keywordExact);
      continue;
    }
    if (keyword.startsWith(term)) {
      score = Math.max(score, SCORE.keywordPrefix);
      continue;
    }
    if (long && keyword.includes(term)) {
      score = Math.max(score, SCORE.keywordContains);
    }
  }

  /* One typo's tolerance, and only against whole words: "مكيفلت" still
     finds المكيفات. Skipped once something stronger already matched. */
  if (score === 0 && term.length >= MIN_FUZZY_LENGTH) {
    const near =
      entry.nameTokens.some((word) => isOneEditApart(word, term)) ||
      entry.synonyms.some((alias) => isOneEditApart(alias, term));

    if (near) score = SCORE.fuzzy;
  }

  if (score === 0 && long && entry.description.includes(term)) {
    score = SCORE.description;
  }

  return score;
}

/** How hard a partial match is discounted against a whole-phrase one. */
const WORD_MATCH_DISCOUNT = 0.8;

/** The whole query first. A multi-word query that matched nothing as a
    phrase is then scored word by word, at a discount and weighted by how
    much of the query the entry actually covers — so "تصليح مكيف" reaches
    both صيانة مكيفات and إصلاح الأعطال, and a word the catalogue has never
    heard of ("أحتاج مكيف بسرعة") costs the match some rank instead of
    killing it. */
function scoreEntry(entry: IndexEntry, query: string, words: string[]): number {
  const phrase = scoreTerm(entry, query);
  if (phrase > 0) return phrase + (entry.isCategory ? CATEGORY_BONUS : 0);

  /* One meaningful word is enough: a query can reduce to that after
     the stopwords are dropped ("أحتاج مكيف بسرعة"). */
  if (words.length === 0) return 0;

  let total = 0;
  let matched = 0;

  for (const word of words) {
    const wordScore = scoreTerm(entry, word);
    if (wordScore === 0) continue;
    total += wordScore;
    matched += 1;
  }

  if (matched === 0) return 0;

  /* Squared, so covering the whole query beats covering half of it by
     far more than the averages differ. */
  const coverage = (matched / words.length) ** 2;
  const score = (total / matched) * coverage * WORD_MATCH_DISCOUNT;

  return score + (entry.isCategory ? CATEGORY_BONUS : 0);
}

/** Everything the UI needs, best first. Returns [] for an empty query. */
export function searchServices(
  rawQuery: string,
  limit = 7,
): ServiceSearchResult[] {
  /* A single letter would match half the catalogue; wait for the second. */
  const query = normalizeArabic(rawQuery);
  if (query.length < 2) return [];

  const words = tokenize(query).filter(
    (word) => word.length > 1 && !STOPWORDS.has(word),
  );

  const scored: { entry: IndexEntry; score: number }[] = [];

  for (const entry of INDEX) {
    const score = scoreEntry(entry, query, words);
    if (score > 0) scored.push({ entry, score });
  }

  scored.sort((a, b) =>
    b.score === a.score ? a.entry.rank - b.entry.rank : b.score - a.score,
  );

  return scored.slice(0, limit).map(({ entry }) => ({
    id: entry.id,
    label: entry.label,
    categoryTitle: entry.categoryTitle,
    hint: entry.hint,
    href: entry.href,
    requestHref: entry.requestHref,
    isCategory: entry.isCategory,
  }));
}
