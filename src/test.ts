import { chromium, webkit, firefox, devices, BrowserContext } from "playwright";
import path from "path";
import type { Dirent } from "fs";
import { readdir } from "fs/promises";
import inquirer from "inquirer";

if (!Array.prototype.last) {
  Array.prototype.last = function () {
    if (!this.length) {
      return undefined;
    }
    return this[this.length - 1];
  };
}

async function getMap(path: string): Promise<string[]> {
  const files = await readdir(path, { withFileTypes: true });
  const paths: string[] = [];
  const getPage = (str: string) => (str === "index" ? "" : str);

  await Promise.all(
    files.map(async (file: Dirent) => {
      if (file.isDirectory())
        return paths.concat(await getMap(`${path}/${file.name}`));

      if (!file.name.match(/\.(tsx|jsx|ts|js)$/i)) return;
      if (file.name.startsWith("_")) return;

      return paths.push(
        `${path.split("/pages/")[1] || ""}/${getPage(
          file.name.split(/\.(jsx|tsx|ts|js)$/i)[0] || ""
        )}`
      );
    })
  );

  return paths;
}

(async () => {
  while (process.uptime() < 1000) {
    let type = await inquirer
      .prompt([
        {
          type: "list",
          loop: true,
          name: "device",
          message: "What device are you emulating?",
          choices: Object.keys(devices).concat("None (Desktop)"),
        },
      ])
      .then((el) => el.device);
    const baseUrl = `localhost:3000`;

    let siteMap = await getMap(path.join(process.cwd(), "./src/pages"));
    const redirects = ["/support", "/invite"];
    siteMap = siteMap.filter((el) => !redirects.includes(el));

    await Promise.all(
      [chromium, webkit, firefox].map(async (browserType) => {
        const browser = await browserType.launch({ headless: false });

        let context: BrowserContext;
        if (type !== "None (Desktop)")
          context = await browser.newContext({ ...devices[type] });
        else context = await browser.newContext();

        for (const el of siteMap) {
          const page = await context.newPage();
          await page.goto(baseUrl.concat(el));
        }
      })
    );
  }
})();
