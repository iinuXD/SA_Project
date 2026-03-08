from icalendar import Calendar
from typing import Tuple, List, Dict, Any
import re
from datetime import datetime, timezone, timedelta

THAI_TZ = timezone(timedelta(hours=7))


DAY_MAP = {
    "MO": "MO", "TU": "TU", "WE": "WE",
    "TH": "TH", "FR": "FR", "SA": "SA", "SU": "SU",
}

WEEKDAY_FROM_DATE = {0: "MO", 1: "TU", 2: "WE", 3: "TH", 4: "FR", 5: "SA", 6: "SU"}


def parse_ics(content: bytes) -> Tuple[str, str, List[Dict[str, Any]]]:
    """Parse .ics bytes → (semester, academic_year, sessions)"""
    cal = Calendar.from_ical(content)
    sessions = []
    semester = ""
    academic_year = ""

    for component in cal.walk():
        if component.name != "VEVENT":
            continue

        summary = str(component.get("SUMMARY", "")).strip()
        location = str(component.get("LOCATION", "")).strip()
        description = str(component.get("DESCRIPTION", "")).strip()

        # Skip exam events
        if "สอบปลายภาค" in summary or "สอบกลางภาค" in summary:
            continue

        dtstart = component.get("DTSTART")
        dtend = component.get("DTEND")

        if not dtstart or not dtstart.dt:
            continue

        start_dt = dtstart.dt
        end_dt = dtend.dt if dtend else None

        # Handle date vs datetime
        if isinstance(start_dt, datetime):
            if start_dt.tzinfo is not None:
                start_dt = start_dt.astimezone(THAI_TZ)
            if end_dt and isinstance(end_dt, datetime) and end_dt.tzinfo is not None:
                end_dt = end_dt.astimezone(THAI_TZ)
            start_time = start_dt.strftime("%H:%M")
            end_time = end_dt.strftime("%H:%M") if end_dt and isinstance(end_dt, datetime) else start_time
        else:
            start_time = "08:00"
            end_time = "10:00"

        # Get day of week from RRULE or from DTSTART
        rrule = component.get("RRULE")
        day_of_week = ""
        if rrule:
            byday = rrule.get("BYDAY", [])
            if byday:
                day_of_week = str(byday[0]).upper()[:2]
        if not day_of_week:
            if isinstance(start_dt, datetime):
                day_of_week = WEEKDAY_FROM_DATE[start_dt.weekday()]
            else:
                day_of_week = WEEKDAY_FROM_DATE[start_dt.weekday()]

        # Try to extract semester/year from description
        if not semester and description:
            match = re.search(r"(\d)/(\d{4})", description)
            if match:
                semester = match.group(1)
                academic_year = match.group(2)

        sessions.append({
            "subjectName": summary or "Unknown Subject",
            "startTime": start_time,
            "endTime": end_time,
            "dayOfWeek": day_of_week,
            "roomName": location,
        })

    # Deduplicate: keep one entry per unique (subject, day, startTime, endTime, room)
    seen = set()
    unique_sessions = []
    for s in sessions:
        key = (s["subjectName"], s["dayOfWeek"], s["startTime"], s["endTime"], s["roomName"])
        if key not in seen:
            seen.add(key)
            unique_sessions.append(s)
    sessions = unique_sessions

    if not semester:
        now = datetime.now()
        month = now.month
        semester = "1" if 6 <= month <= 10 else "2"
        academic_year = str(now.year + 543)  # Buddhist Era

    return semester, academic_year, sessions
