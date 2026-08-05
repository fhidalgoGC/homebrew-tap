import { resolve, join } from "node:path";
import { existsSync, mkdirSync } from "node:fs";

export interface InitDocsWorksReport {
  action: "created" | "already-exists";
  errors: string[];
}

/**
 * Ensures docs/works/ exists with the standard skeleton:
 *   docs/works/
 *   ├── product/
 *   ├── features/
 *   ├── extra/
 *   └── enablers/
 *
 * Non-destructive: never overwrites existing content. Only creates missing folders.
 */
export async function initDocsWorks(targetPath: string): Promise<InitDocsWorksReport> {
  const docsWorks = resolve(targetPath, "docs", "works");

  const subDirs = ["product", "features", "extra", "enablers"];
  const created: string[] = [];

  for (const sub of subDirs) {
    const path = join(docsWorks, sub);
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      created.push(sub);
    }
  }

  return {
    action: created.length > 0 ? "created" : "already-exists",
    errors: [],
  };
}
