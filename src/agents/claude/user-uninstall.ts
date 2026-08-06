import { uninstallSkills, type UninstallSkillsReport } from "../../core/uninstall-skills";
import { uninstallRules, type UninstallRulesReport } from "../../core/uninstall-rules";
import { uninstallBootstrapHook } from "../../core/install-bootstrap-hook";

export interface ClaudeUserUninstallReport {
  skills: UninstallSkillsReport;
  rules: UninstallRulesReport;
  bootstrapHook: { removed: number; errors: string[] };
}

/**
 * Symmetric counterpart of installClaudeUserLevel — removes everything
 * fremi placed under ~/.claude/. Leaves the ~/.claude/ directory itself
 * alone even if it becomes empty (other tools might live there).
 */
export async function uninstallClaudeUserLevel(
  homePath: string,
  frameworkContent: string,
): Promise<ClaudeUserUninstallReport> {
  const skills = await uninstallSkills(homePath, frameworkContent);
  const rules = await uninstallRules(homePath, frameworkContent);
  const bootstrapHook = await uninstallBootstrapHook(homePath);

  return { skills, rules, bootstrapHook };
}
