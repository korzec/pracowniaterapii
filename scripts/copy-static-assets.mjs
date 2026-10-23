import { cp, copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
const directories = [
  "assets",
  "wp-content",
  "wp-includes",
  "feed",
  "comments",
  "wp-json",
  "author/martyna/feed",
  "category/bez-kategorii/feed",
  "category/psychoterapia/feed",
  "category/slider-posts/feed",
  "grupa-wsparcia-co-to-jest-i-jak-dziala/feed",
  "jak-wybrac-dobrego-psychoterapeute/feed",
  "najtrudniejszy-pierwszy-krok/feed",
  "odwaga/feed",
  "witaj-w-pracownii-terapii-i-rozwoju/feed",
  "zasady-terapii-gestalt/feed",
];
const files = [".nojekyll", "robots.txt", "xmlrpc.php"];

for (const directory of directories) {
  await cp(resolve(root, directory), resolve(output, directory), { recursive: true });
}

for (const file of files) {
  const destination = resolve(output, file);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(root, file), destination);
}
