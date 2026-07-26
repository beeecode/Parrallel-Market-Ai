/** Returns the current time as an ISO-8601 string. */
function nowIso() {
  return new Date().toISOString();
}

/** Adds the given number of milliseconds to a date (or now, if omitted). */
function addMilliseconds(ms, from = new Date()) {
  return new Date(from.getTime() + ms);
}

/** Whether `date` is in the past relative to now. */
function isPast(date) {
  return date.getTime() < Date.now();
}

module.exports = { nowIso, addMilliseconds, isPast };
