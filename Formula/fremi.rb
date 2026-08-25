class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.21"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.21/fremi-darwin-arm64"
      sha256 "8bac2922386f215f6d20b4dc27491d33763dd557355e0aba58884ca5ab35105f"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.21/fremi-darwin-x64"
      sha256 "d8308257c82744f1d3e31f00ae82f6138f23c23111649c66e05029a95849e815"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.21/fremi-linux-arm64"
      sha256 "58715238f37b23c39b2aacef9e849ee4225588ede486e800c906a7d08841fc46"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.21/fremi-linux-x64"
      sha256 "fa7698f2ddb3c3e03efe6c3a1d269ab68c7ee4f7ceaa6917d9a05d8ec2e8a74a"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      What's new in v0.4.21 — the home directory gets cleaned up:

        `fremi update` now re-applies the sparse-checkout patterns before
        pulling. They were missing a leading slash, which in --no-cone mode
        matches at any depth, so ~/.fremi grew a plugin/ tree holding nothing
        but stray READMEs. The patterns live inside the clone, so this is
        what makes the fix reach installs that already exist.

        `fremi agent install` prunes previous plugin versions — the install
        path carries the version, so every upgrade used to leave the old tree
        behind.

      v0.4.20 — upgrading cleans up after old versions:

        Skills and rules that pre-plugin releases symlinked into
        ~/.claude/skills and ~/.claude/rules are swept by `fremi agent
        install` and `fremi agent uninstall`. Only symlinks named fremi-* or
        pointing inside a framework/ tree are touched.

      v0.4.19 — a project carries its own fremi:

        `fremi install` writes .claude/skills/, .claude/rules/ and the
        framework's hooks into the PROJECT. Staying user-level: the MCP
        server and the SessionStart bootstrap hook.

      Upgrading from an older version:

        fremi update            # pull the framework content
        fremi agent install     # re-register skills + hooks
        fremi install [path]    # refresh the project (idempotent)

      Framework layout (unchanged since v0.4.16, plus per-domain folders):

        framework/artifacts/<layer>/    product, feature, story, enabler, extra
          ├── workflow.yaml             canonical step sequence
          ├── rules/                    domain rules + applies.yaml per step
          ├── hooks/                    domain hooks
          └── skills/                   the layer's invocable steps

        framework/rules/                cross-domain rules (workflow.md = index)
        framework/hooks/                cross-domain hooks
        framework/pipelines/            pipeline orchestrators
        framework/reverse-engineering/  reverse-* skills
        framework/settings/             global config

      Project layout in .fremi/settings/ is UNCHANGED.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
