export default function splitArgs(string: string): string[] {
  const regex = /[^"\s]+|"(?:\\"|[^"])+"/gi;
  const arr: string[] = [];

  do {
    //Each call to exec returns the next regex match as an array
    var match = regex.exec(string);
    if (match != null) {
      //Index 1 in the array is the captured group if it exists
      //Index 0 is the matched text, which we use if no captured group exists
      arr.push(match[1] ? match[1] : match[0]);
    }
  } while (match != null);

  return arr;
}
