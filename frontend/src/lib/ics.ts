/**
 * Minimal RFC 5545 .ics calendar invite generator.
 *
 * For the borrower portal: when a borrower books a call or 818 schedules a
 * doc-review meeting, attach a .ics to the confirmation email so it lands in
 * Outlook/Gmail/Apple Calendar as a real event with reminders.
 *
 * Scope intentionally narrow:
 *   - Single-event VEVENT
 *   - One organizer (818), one attendee (borrower)
 *   - America/New_York timezone baked in (818 is ET-based)
 *   - REQUEST method (lets recipient accept/decline from their mail client)
 *
 * Out of scope for v1: recurrence, VALARM customization beyond a 15-min
 * default reminder, multi-attendee. Add if/when needed.
 */

const TZID = 'America/New_York';

export interface IcsArgs {
  /** Unique stable ID for the event. Reuse for updates (METHOD:REQUEST + SEQUENCE bump). */
  uid: string;
  /** Sequence number — bump by 1 on each update of the same UID. Default 0. */
  sequence?: number;
  /** Event start (ISO 8601, includes timezone offset — e.g. "2026-05-20T10:00:00-04:00"). */
  start: Date;
  /** Event end. */
  end: Date;
  /** Short subject — appears in calendar tiles. */
  summary: string;
  /** Long-form description, plain text. Use \n for line breaks. */
  description?: string;
  /** Free-text location ("Zoom", "919-993-9194", "Office", etc.) */
  location?: string;
  /** Organizer — typically the 818 person hosting. */
  organizer: { name: string; email: string };
  /** Attendee — the borrower. */
  attendee: { name?: string; email: string };
  /** Last-modified — defaults to now. */
  dtstamp?: Date;
}

/**
 * Format a Date into an ICS "local time + TZID" representation
 * (per RFC 5545 §3.3.5 form #3). Looks like: 20260520T100000
 * The TZID is attached as a property param by the caller.
 */
function formatLocal(d: Date, tz: string): string {
  // Use Intl.DateTimeFormat to get the wall-clock time in the target TZ.
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(d);
  const p: Record<string, string> = {};
  for (const part of parts) {
    if (part.type !== 'literal') p[part.type] = part.value;
  }
  return `${p.year}${p.month}${p.day}T${p.hour}${p.minute}${p.second}`;
}

/** Format a Date as UTC YYYYMMDDTHHMMSSZ for DTSTAMP / CREATED / LAST-MODIFIED. */
function formatUtc(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/** Escape per RFC 5545 §3.3.11 (TEXT type) — backslash, comma, semicolon, newlines. */
function escapeText(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

/**
 * Fold long lines per RFC 5545 §3.1 (75-octet limit). Lines longer than 75
 * bytes get split with CRLF + single space continuation. Naive byte counting
 * (assumes mostly-ASCII content) — good enough for our envelope.
 */
function fold(line: string): string {
  const max = 73; // leave room for CRLF + leading space on continuation
  if (line.length <= max) return line;
  const out: string[] = [];
  let i = 0;
  while (i < line.length) {
    out.push((i === 0 ? '' : ' ') + line.slice(i, i + max));
    i += max;
  }
  return out.join('\r\n');
}

/**
 * Build a complete .ics body (string) ready for email attachment.
 * Encoding note: the result is plain text — callers should attach with
 * `content_type: 'text/calendar; method=REQUEST; charset=UTF-8'`.
 */
export function buildIcsInvite(args: IcsArgs): string {
  const dtstamp = formatUtc(args.dtstamp || new Date());
  const dtstart = formatLocal(args.start, TZID);
  const dtend = formatLocal(args.end, TZID);
  const seq = args.sequence ?? 0;

  const attendeeName = args.attendee.name ? `;CN=${escapeText(args.attendee.name)}` : '';

  // VTIMEZONE block for America/New_York. Hardcoded EST/EDT rules per
  // current US DST policy. Good through 2035+ — revisit if/when DST changes.
  const vtimezone = [
    'BEGIN:VTIMEZONE',
    `TZID:${TZID}`,
    'BEGIN:STANDARD',
    'DTSTART:19701101T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU',
    'TZOFFSETFROM:-0400',
    'TZOFFSETTO:-0500',
    'TZNAME:EST',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700308T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU',
    'TZOFFSETFROM:-0500',
    'TZOFFSETTO:-0400',
    'TZNAME:EDT',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
  ];

  const vevent = [
    'BEGIN:VEVENT',
    `UID:${args.uid}`,
    `SEQUENCE:${seq}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART;TZID=${TZID}:${dtstart}`,
    `DTEND;TZID=${TZID}:${dtend}`,
    fold(`SUMMARY:${escapeText(args.summary)}`),
    args.description ? fold(`DESCRIPTION:${escapeText(args.description)}`) : '',
    args.location ? fold(`LOCATION:${escapeText(args.location)}`) : '',
    fold(`ORGANIZER;CN=${escapeText(args.organizer.name)}:mailto:${args.organizer.email}`),
    fold(`ATTENDEE;ROLE=REQ-PARTICIPANT;PARTSTAT=NEEDS-ACTION;RSVP=TRUE${attendeeName}:mailto:${args.attendee.email}`),
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    // 15-min reminder, mirroring most users' default preference.
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder',
    'TRIGGER:-PT15M',
    'END:VALARM',
    'END:VEVENT',
  ].filter(Boolean);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//818 Capital Partners//Borrower Portal//EN',
    'METHOD:REQUEST',
    'CALSCALE:GREGORIAN',
    ...vtimezone,
    ...vevent,
    'END:VCALENDAR',
  ];

  // RFC 5545 requires CRLF line endings.
  return lines.join('\r\n') + '\r\n';
}

/** Convenience: build a filename for the .ics attachment based on UID. */
export function icsFilename(uid: string): string {
  return `${uid.replace(/[^a-z0-9_-]/gi, '_')}.ics`;
}
