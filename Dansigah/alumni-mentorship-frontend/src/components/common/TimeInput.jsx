import { useId } from "react";

const hourPattern = "(0?[1-9]|1[0-2])";
const minutePattern = "[0-5]?[0-9]";
const normalizeTimePart = (value, pattern) => new RegExp(`^${pattern}$`).test(value) ? value.padStart(2, "0") : value;

export const toApiTime = (hour, minute, period) => {
  hour = normalizeTimePart(hour, hourPattern);
  minute = normalizeTimePart(minute, minutePattern);
  if (!/^(0[1-9]|1[0-2])$/.test(hour) || !/^[0-5][0-9]$/.test(minute) || !["AM", "PM"].includes(period)) {
    throw new Error("Enter an hour from 1 to 12, a minute from 0 to 59, and select AM or PM.");
  }
  return `${String(Number(hour) % 12 + (period === "PM" ? 12 : 0)).padStart(2, "0")}:${minute}:00`;
};


export const fromApiTime = (time) => {
  if (!time) return { hour: "", minute: "", period: "AM" };
  const [hour, minute] = time.slice(0, 5).split(":");
  return { hour: String(Number(hour) % 12 || 12).padStart(2, "0"), minute,
    period: Number(hour) < 12 ? "AM" : "PM" };
};

export default function TimeInput({ value, onChange, required = true }) {
  const id = useId();
  return (
    <>
      <span className="form-label d-block" id={id}>Time</span>
      <div className="d-flex align-items-center gap-1" role="group" aria-labelledby={id}>
        <input className="form-control" type="text" inputMode="numeric" aria-label="Hour" placeholder="Hour"
          required={required} maxLength={2} pattern={hourPattern} list={id + "-hours"} value={value.hour}
          onChange={(e) => onChange("hour", e.target.value)}
          onBlur={(e) => onChange("hour", normalizeTimePart(e.target.value, hourPattern))} />
        <datalist id={id + "-hours"}>
          {Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, "0")).map((hour) =>
            <option key={hour} value={hour}>{hour}</option>)}
        </datalist>
        <span aria-hidden="true">:</span>
        <input className="form-control" type="text" inputMode="numeric" aria-label="Minute" placeholder="Min"
          required={required} maxLength={2} pattern={minutePattern} list={id + "-minutes"} value={value.minute}
          onChange={(e) => onChange("minute", e.target.value)}
          onBlur={(e) => onChange("minute", normalizeTimePart(e.target.value, minutePattern))} />
        <datalist id={id + "-minutes"}>
          {Array.from({ length: 60 }, (_, index) => String(index).padStart(2, "0")).map((minute) =>
            <option key={minute} value={minute}>{minute}</option>)}
        </datalist>
        <select className="form-select" aria-label="AM or PM" required={required} value={value.period}
          onChange={(e) => onChange("period", e.target.value)}>
          <option value="AM">AM</option><option value="PM">PM</option>
        </select>
      </div>
    </>
  );
}
