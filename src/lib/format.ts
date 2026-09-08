/* Dashboard formatting. Gregorian calendar and Latin digits: the owner
   reads these next to phone numbers and reference numbers, and mixed
   numeral systems in one table are hard to scan. The timezone is pinned
   so the server render and any later client render agree. */

const LOCALE = "ar-SA-u-ca-gregory-nu-latn";
const TIME_ZONE = "Asia/Riyadh";

const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "long",
  timeZone: TIME_ZONE,
});

/** e.g. "٨ سبتمبر ٢٠٢٦, ‏9:04 ص" with Latin digits. */
export function formatDateTime(value: Date) {
  return dateTimeFormatter.format(value);
}

/** Date only — used for preferredDate, which carries no meaningful time. */
export function formatDate(value: Date) {
  return dateFormatter.format(value);
}
