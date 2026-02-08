export function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomSample(array, n) {
  const result = [];
  const copy = array.slice();

  while (result.length < n && copy.length > 0) {
    const index = randomInt(0, copy.length - 1);
    result.push(copy.splice(index, 1)[0]);
  }

  return result;
}

export function rollPass(stat, threshold) {
    let playerRoll = randomInt(1, stat);
    let boardRoll = randomInt(1, threshold);
    return playerRoll >= boardRoll;
}

export function suffix(n) {
    if (11 <= n % 100 && n % 100 <= 13) {
        return "th";
    } else {
        return {1: "st", 2: "nd", 3: "rd"}[n % 10] || "th";
    }
}

export function average(arr) {
    if (arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return sum / arr.length;
}

// For those annoying and elusive colors

export function isColorHex(input) { // will be converted :)
  const regex = /^#([0-9A-Fa-f]{6})$/;
  return regex.test(input);
}
 
export function isColorRGBA(input) {
  const regex = /^#([0-9A-Fa-f]{8})$/;
  return regex.test(input);
}