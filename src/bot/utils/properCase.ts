export default function properCase(string: string): string {
  if (string.includes(" "))
    return string
      .split(" ")
      .map((el) => properCase(el))
      .join(" ");

  return (
    string.substring(0, 1).toUpperCase() + string.substring(1).toLowerCase()
  );
}
