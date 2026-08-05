import { readFileSync } from "node:fs";
import { getFrameworkRoot } from "../core/paths";

export async function runVersion(): Promise<void> {
  const root = getFrameworkRoot();
  const versionFile = `${root}/VERSION`;

  let version: string;
  try {
    version = readFileSync(versionFile, "utf8").trim();
  } catch {
    version = "unknown";
  }

  console.log(`fremi-framework v${version}`);
  console.log(`installed at: ${root}`);
}
