import { installSkills, type InstallSkillsReport } from "../../core/install-skills";
import { installRules, type InstallRulesReport } from "../../core/install-rules";
import { installBootstrapHook, type InstallBootstrapHookReport } from "../../core/install-bootstrap-hook";

export interface ClaudeUserInstallReport {
  skills: InstallSkillsReport;
  rules: InstallRulesReport;
  bootstrapHook: InstallBootstrapHookReport;
}

/**
 * Installs fremi at USER level for the Claude Code agent. Writes to
 * ~/.claude/ directly (skills, rules, one bootstrap hook). The 52 skills
 * and 3 rules become globally visible in every project the user opens;
 * the bootstrap hook lets fremi verify install health on every session
 * start.
 *
 * The 11 framework operational hooks (check-flow-preconditions etc.) are
 * deliberately NOT installed at user level in v0.3.0 — they will remain
 * a v0.3.x concern.
 */
export async function installClaudeUserLevel(
  homePath: string,
  frameworkContent: string,
): Promise<ClaudeUserInstallReport> {
  // The install-skills / install-rules functions already build
  // `<targetPath>/.claude/{skills,rules}` — passing the home directory
  // lands them at `~/.claude/{skills,rules}` exactly.
  const skills = await installSkills(homePath, frameworkContent);
  const rules = await installRules(homePath, frameworkContent);
  const bootstrapHook = await installBootstrapHook(homePath);

  return { skills, rules, bootstrapHook };
}
