export function timeIntegerToString(a) {
  let date = new Date(a * 1000);
  let hours = date.getUTCHours();
  let minutes = date.getUTCMinutes();
  let delim = (hours >= 12)? "PM" : "AM";

  if (hours > 12) {
    hours = hours - 12;
  }

  if (hours === 0) {
    hours = 12;
  }

  return String(hours) + ":" + String(minutes).padStart(2, '0') + " " + delim;
}

export function findClosest(x, arr) {
    var indexArr = arr.map(function(k) { return Math.abs(k - x) })
    var min = Math.min.apply(Math, indexArr)
    return arr[indexArr.indexOf(min)]
  }
