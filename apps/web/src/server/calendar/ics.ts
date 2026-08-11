// Generate a minimal RFC 5545 .ics file for an interview invitation.
// Works in Apple Calendar, Google Calendar, Outlook.

type IcsInput = {
  uid: string;
  title: string;
  description: string;
  location: string;
  start: Date;
  durationMinutes: number;
  organizer: { name: string; email: string };
  attendees: Array<{ name: string; email: string }>;
};

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toIcsDate(d: Date): string {
  // Format: YYYYMMDDTHHMMSSZ (UTC)
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

function escapeIcs(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export function generateIcs(input: IcsInput): string {
  const end = new Date(input.start.getTime() + input.durationMinutes * 60_000);
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HirePilot//Interview//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${input.uid}@hirepilot.dev`,
    `DTSTAMP:${toIcsDate(new Date())}`,
    `DTSTART:${toIcsDate(input.start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${escapeIcs(input.title)}`,
    `DESCRIPTION:${escapeIcs(input.description)}`,
    `LOCATION:${escapeIcs(input.location)}`,
    `ORGANIZER;CN=${escapeIcs(input.organizer.name)}:mailto:${input.organizer.email}`,
    ...input.attendees.map((a) => `ATTENDEE;CN=${escapeIcs(a.name)};RSVP=TRUE:mailto:${a.email}`),
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n');
}
