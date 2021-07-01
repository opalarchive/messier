export default function convertHex(color: string) {
  return parseInt(color.replace(/#/g, "0x"));
}
