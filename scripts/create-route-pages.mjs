import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
const pages = JSON.parse(await readFile(resolve(root, "src/content/pages.json"), "utf8"));
const template = await readFile(resolve(output, "index.html"), "utf8");

for (const page of pages) {
  if (page.path === "/") continue;
  const directory = resolve(output, page.path.slice(1));
  await mkdir(directory, { recursive: true });
  const relativeAssets = "../".repeat(page.path.split("/").filter(Boolean).length);
  const pageTemplate = template.replace(
    /<title>.*?<\/title>/,
    `<title>${page.title.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</title>`,
  ).replaceAll("./assets/", `${relativeAssets}assets/`);
  await writeFile(resolve(directory, "index.html"), pageTemplate);
}
