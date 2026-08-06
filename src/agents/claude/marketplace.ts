import { resolve, dirname } from "node:path";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";
import { execSync } from "node:child_process";

// Handles the "marketplace" side of Claude Code plugin distribution.
// Engram uses this pattern: alongside the plugin cache at
// ~/.claude/plugins/cache/<plugin>/<plugin>/<version>/ there is a
// marketplace clone at ~/.claude/plugins/marketplaces/<marketplace-name>/
// that Claude Code uses for update discovery and README display.
//
// For fremi the marketplace name is "fremi" and its source is our
// homebrew-tap repo. A shallow git clone keeps the on-disk cost small.

const MARKETPLACE_NAME = "fremi";
const MARKETPLACE_REPO_URL = "https://github.com/fhidalgoGC/homebrew-tap.git";
const MARKETPLACE_REPO_SHORT = "fhidalgoGC/homebrew-tap";

export interface MarketplaceInstallReport {
  marketplaceDir: string;
  cloned: boolean;
  updatedExisting: boolean;
  registeredInKnown: boolean;
  addedToSettings: boolean;
  errors: string[];
}

export function installFremiMarketplace(homePath: string): MarketplaceInstallReport {
  const report: MarketplaceInstallReport = {
    marketplaceDir: "",
    cloned: false,
    updatedExisting: false,
    registeredInKnown: false,
    addedToSettings: false,
    errors: [],
  };

  const marketplaceDir = getMarketplaceDir(homePath);
  report.marketplaceDir = marketplaceDir;

  try {
    ensureMarketplaceClone(marketplaceDir, report);
    registerInKnownMarketplaces(homePath, marketplaceDir);
    report.registeredInKnown = true;
    addToExtraKnownMarketplaces(homePath);
    report.addedToSettings = true;
  } catch (err) {
    report.errors.push((err as Error).message);
  }

  return report;
}

export function uninstallFremiMarketplace(homePath: string): {
  removedDir: boolean;
  removedFromKnown: boolean;
  removedFromSettings: boolean;
  errors: string[];
} {
  const result = {
    removedDir: false,
    removedFromKnown: false,
    removedFromSettings: false,
    errors: [] as string[],
  };

  const marketplaceDir = getMarketplaceDir(homePath);
  if (existsSync(marketplaceDir)) {
    try {
      rmSync(marketplaceDir, { recursive: true, force: true });
      result.removedDir = true;
    } catch (err) {
      result.errors.push(`Failed to remove ${marketplaceDir}: ${(err as Error).message}`);
    }
  }

  // Drop from known_marketplaces.json
  const knownPath = resolve(homePath, ".claude", "plugins", "known_marketplaces.json");
  if (existsSync(knownPath)) {
    try {
      const known = JSON.parse(readFileSync(knownPath, "utf8")) as Record<string, unknown>;
      if (known[MARKETPLACE_NAME]) {
        delete known[MARKETPLACE_NAME];
        writeFileSync(knownPath, JSON.stringify(known, null, 2) + "\n");
        result.removedFromKnown = true;
      }
    } catch (err) {
      result.errors.push(`Failed to update ${knownPath}: ${(err as Error).message}`);
    }
  }

  // Drop from settings.json.extraKnownMarketplaces
  const settingsPath = resolve(homePath, ".claude", "settings.json");
  if (existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as Record<string, unknown>;
      const marketplaces = (settings.extraKnownMarketplaces ?? {}) as Record<string, unknown>;
      if (marketplaces[MARKETPLACE_NAME]) {
        delete marketplaces[MARKETPLACE_NAME];
        if (Object.keys(marketplaces).length === 0) {
          delete settings.extraKnownMarketplaces;
        } else {
          settings.extraKnownMarketplaces = marketplaces;
        }
        writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
        result.removedFromSettings = true;
      }
    } catch (err) {
      result.errors.push(`Failed to update ${settingsPath}: ${(err as Error).message}`);
    }
  }

  return result;
}

function getMarketplaceDir(homePath: string): string {
  return resolve(homePath, ".claude", "plugins", "marketplaces", MARKETPLACE_NAME);
}

function ensureMarketplaceClone(marketplaceDir: string, report: MarketplaceInstallReport): void {
  if (existsSync(marketplaceDir) && existsSync(resolve(marketplaceDir, ".git"))) {
    // Refresh the existing clone with git pull. Best-effort: silence
    // any errors so a stale marketplace doesn't block the install.
    try {
      execSync(`git -C "${marketplaceDir}" pull --ff-only --quiet`, { stdio: "ignore" });
      report.updatedExisting = true;
    } catch {
      // ignore — offline / network issues shouldn't block the install
    }
    return;
  }

  // Fresh shallow clone.
  mkdirSync(dirname(marketplaceDir), { recursive: true });
  execSync(
    `git clone --depth 1 --quiet "${MARKETPLACE_REPO_URL}" "${marketplaceDir}"`,
    { stdio: "inherit" },
  );
  report.cloned = true;
}

function registerInKnownMarketplaces(homePath: string, marketplaceDir: string): void {
  const path = resolve(homePath, ".claude", "plugins", "known_marketplaces.json");
  mkdirSync(dirname(path), { recursive: true });

  let known: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      known = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      known = {};
    }
  }

  known[MARKETPLACE_NAME] = {
    source: {
      source: "github",
      repo: MARKETPLACE_REPO_SHORT,
    },
    installLocation: marketplaceDir,
    lastUpdated: new Date().toISOString(),
  };

  writeFileSync(path, JSON.stringify(known, null, 2) + "\n");
}

function addToExtraKnownMarketplaces(homePath: string): void {
  const path = resolve(homePath, ".claude", "settings.json");
  mkdirSync(dirname(path), { recursive: true });

  let settings: Record<string, unknown> = {};
  if (existsSync(path)) {
    try {
      settings = JSON.parse(readFileSync(path, "utf8"));
    } catch {
      settings = {};
    }
  }

  const marketplaces = (settings.extraKnownMarketplaces ?? {}) as Record<string, unknown>;
  marketplaces[MARKETPLACE_NAME] = {
    source: {
      repo: MARKETPLACE_REPO_SHORT,
      source: "github",
    },
  };
  settings.extraKnownMarketplaces = marketplaces;

  writeFileSync(path, JSON.stringify(settings, null, 2) + "\n");
}
