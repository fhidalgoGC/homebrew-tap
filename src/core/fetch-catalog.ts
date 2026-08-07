import { existsSync, mkdirSync, writeFileSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";

// URL of the live model catalog per agent. Fetched at `fremi install`
// and `fremi update` time so the local editor shows the models that
// are actually available today — no need to bump the fremi binary
// every time Anthropic ships a new model.
const CATALOG_URL_BASE =
  "https://raw.githubusercontent.com/fhidalgoGC/homebrew-tap/main/catalog";

const SUPPORTED_AGENTS = ["claude"] as const;
type SupportedAgent = (typeof SUPPORTED_AGENTS)[number];

export interface CatalogFile {
  updated: string;
  models: string[];
  aliases: Record<string, string>;
}

export interface FetchCatalogReport {
  agent: SupportedAgent;
  destPath: string;
  status: "fetched" | "cached" | "skipped-network-error";
  models_count: number;
}

/**
 * Fetches the live catalog for every supported agent and writes it
 * under `<targetPath>/.fremi/settings/catalog/<agent>.json`. On
 * network failure, keeps the existing cache (if any) or writes an
 * empty catalog with a diagnostic marker so the editor can surface
 * the offline state clearly.
 *
 * Never throws — treats fetch failures as recoverable and reports
 * them via the return value.
 */
export async function fetchAgentCatalogs(
  targetPath: string,
): Promise<FetchCatalogReport[]> {
  const reports: FetchCatalogReport[] = [];
  const catalogDir = resolve(targetPath, ".fremi", "settings", "catalog");
  mkdirSync(catalogDir, { recursive: true });

  for (const agent of SUPPORTED_AGENTS) {
    const destPath = resolve(catalogDir, `${agent}.json`);
    const report = await fetchOne(agent, destPath);
    reports.push(report);
  }
  return reports;
}

async function fetchOne(
  agent: SupportedAgent,
  destPath: string,
): Promise<FetchCatalogReport> {
  const url = `${CATALOG_URL_BASE}/${agent}.json`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
      headers: { "User-Agent": "fremi-cli" },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const json = (await response.json()) as CatalogFile;
    // Sanity-check the shape before persisting.
    if (!Array.isArray(json.models) || typeof json.aliases !== "object") {
      throw new Error("malformed catalog payload");
    }
    writeFileSync(destPath, JSON.stringify(json, null, 2) + "\n");
    return {
      agent,
      destPath,
      status: "fetched",
      models_count: json.models.length,
    };
  } catch {
    // Fell back — either use existing cache or write an empty
    // marker so the editor can display "no models available, run
    // `fremi update` when online".
    if (existsSync(destPath)) {
      try {
        const cached = JSON.parse(readFileSync(destPath, "utf8")) as CatalogFile;
        return {
          agent,
          destPath,
          status: "cached",
          models_count: Array.isArray(cached.models) ? cached.models.length : 0,
        };
      } catch {
        // fall through to empty marker
      }
    }
    const empty: CatalogFile = {
      updated: new Date().toISOString().slice(0, 10),
      models: [],
      aliases: {},
    };
    mkdirSync(dirname(destPath), { recursive: true });
    writeFileSync(destPath, JSON.stringify(empty, null, 2) + "\n");
    return {
      agent,
      destPath,
      status: "skipped-network-error",
      models_count: 0,
    };
  }
}

/**
 * Reads the locally cached catalog for an agent. Returns null when
 * the file is missing or malformed (caller should treat that as
 * "no catalog available — offer to re-run `fremi update`").
 */
export function readAgentCatalog(
  targetPath: string,
  agent: SupportedAgent,
): CatalogFile | null {
  const path = resolve(targetPath, ".fremi", "settings", "catalog", `${agent}.json`);
  if (!existsSync(path)) return null;
  try {
    return JSON.parse(readFileSync(path, "utf8")) as CatalogFile;
  } catch {
    return null;
  }
}
