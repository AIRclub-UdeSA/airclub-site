import { test } from "node:test";
import assert from "node:assert/strict";
import { buildGoogleCalendarUrl, buildIcsDataUri, compactArDay } from "./calendar-types";

const allDay = {
  title: "Challenge JAR",
  slug: "jar",
  startsAt: "2026-12-12T03:00:00.000Z", // 00:00 en Buenos Aires
  endsAt: "2026-12-13T02:59:00.000Z", // 23:59
  allDay: true,
};
const decodeIcs = (uri: string) => decodeURIComponent(uri.slice(uri.indexOf(",") + 1));

test("el día de Buenos Aires, no el de UTC", () => {
  assert.equal(compactArDay(new Date("2026-12-13T02:59:00Z")), "20261212");
  assert.equal(compactArDay(new Date("2026-12-13T02:59:00Z"), 1), "20261213");
  assert.equal(compactArDay(new Date("2026-12-31T12:00:00Z"), 1), "20270101");
});

test("un evento de todo el día va a Google Calendar y al .ics sin hora, con el fin no inclusivo", () => {
  const gcal = new URL(buildGoogleCalendarUrl(allDay));
  assert.equal(gcal.searchParams.get("dates"), "20261212/20261213");
  const ics = decodeIcs(buildIcsDataUri(allDay));
  assert.match(ics, /DTSTART;VALUE=DATE:20261212\r?\n/);
  assert.match(ics, /DTEND;VALUE=DATE:20261213\r?\n/);
});

test("uno con horario conserva la hora exacta", () => {
  const timed = { ...allDay, allDay: false, startsAt: "2026-12-12T12:00:00.000Z", endsAt: "2026-12-12T21:00:00.000Z" };
  assert.equal(new URL(buildGoogleCalendarUrl(timed)).searchParams.get("dates"), "20261212T120000Z/20261212T210000Z");
  assert.match(decodeIcs(buildIcsDataUri(timed)), /DTSTART:20261212T120000Z/);
});
