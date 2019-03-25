export function timeIntegerToString(a) {
  let date = new Date(a * 1000);
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let delim = (hours >= 12)? "AM" : "PM";

  if (hours > 12) {
    hours = hours - 12;
  }

  return String(hours) + ":" + String(minutes).padStart(2, '0') + " " + delim;
}
