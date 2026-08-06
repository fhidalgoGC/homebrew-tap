import { resolve, dirname } from "node:path";
import {
  existsSync,
  readFileSync,
  writeFileSync,
  rmSync,
} from "node:fs";

const PLUGIN_NAME = "fremi";

export interface PluginUninstallReport {
  pluginRootRemoved: boolean;
  registryUpdated: boolean;
  settingsUpdated: boolean;
  errors: string[];
}

/**
 * Reverses installClaudePlugin. Removes the plugin cache dir, drops the
 * entry from installed_plugins.json, and clears enabledPlugins.fremi@fremi
 * from ~/.claude/settings.json.
 */
export async function uninstallClaudePlugin(homePath: string): Promise<PluginUninstallReport> {
  const report: PluginUninstallReport = {
    pluginRootRemoved: false,
    registryUpdated: false,
    settingsUpdated: false,
    errors: [],
  };

  // 1. Remove plugin cache dir (all versions of fremi).
  const cacheRoot = resolve(homePath, ".claude", "plugins", "cache", PLUGIN_NAME);
  if (existsSync(cacheRoot)) {
    try {
      rmSync(cacheRoot, { recursive: true, force: true });
      report.pluginRootRemoved = true;
    } catch (err) {
      report.errors.push(`Failed to remove ${cacheRoot}: ${(err as Error).message}`);
    }
  }

  // 2. Drop from installed_plugins.json.
  const registryPath = resolve(homePath, ".claude", "plugins", "installed_plugins.json");
  if (existsSync(registryPath)) {
    try {
      const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
        version?: number;
        plugins?: Record<string, unknown>;
      };
      if (registry.plugins) {
        delete registry.plugins[`${PLUGIN_NAME}@${PLUGIN_NAME}`];
      }
      writeFileSync(registryPath, JSON.stringify(registry, null, 2) + "\n");
      report.registryUpdated = true;
    } catch (err) {
      report.errors.push(`Failed to update ${registryPath}: ${(err as Error).message}`);
    }
  }

  // 3. Clear enabledPlugins.fremi@fremi from settings.json.
  const settingsPath = resolve(homePath, ".claude", "settings.json");
  if (existsSync(settingsPath)) {
    try {
      const settings = JSON.parse(readFileSync(settingsPath, "utf8")) as Record<string, unknown>;
      const enabled = (settings.enabledPlugins ?? {}) as Record<string, boolean>;
      delete enabled[`${PLUGIN_NAME}@${PLUGIN_NAME}`];
      if (Object.keys(enabled).length === 0) {
        delete settings.enabledPlugins;
      } else {
        settings.enabledPlugins = enabled;
      }
      writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + "\n");
      report.settingsUpdated = true;
    } catch (err) {
      report.errors.push(`Failed to update ${settingsPath}: ${(err as Error).message}`);
    }
  }

  return report;
}
