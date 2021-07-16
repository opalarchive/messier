export default function convertHex(hex: string) {
  return Number(`0x${hex[0] === "#" ? hex.slice(1) : hex}`);
}
