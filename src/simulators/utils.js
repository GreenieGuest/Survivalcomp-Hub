export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}