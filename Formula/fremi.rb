class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.20"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.20/fremi-darwin-arm64"
      sha256 "cff8b111d1b82df8b554b6285b7c53b0f1d18293d54b3e53599af57c9cc1f4c9"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.20/fremi-darwin-x64"
      sha256 "23be07f3be268b5d6ced4ac29e06e9b871aa806cad203b7f35bf6c1c7dc52ab7"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.20/fremi-linux-arm64"
      sha256 "a0f8ba92724a1155d88a7fc3034371c18b0673eb046f3ac66680b96c05afbb32"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.20/fremi-linux-x64"
      sha256 "db12c6d8ad600ff0c46d23c72433dc8b2c4bfc8131313995fcb4b4050415740c"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      What's new in v0.4.20 — upgrading cleans up after old versions:

        Before the plugin layout, fremi symlinked every skill into
        ~/.claude/skills/ and every rule into ~/.claude/rules/. That code is
        long gone, so nothing removed them either — the links just rode along
        through every upgrade, mostly dangling.

        `fremi agent install` and `fremi agent uninstall` now sweep them. Only
        symlinks named fremi-* or pointing inside a framework/ tree are
        touched; your own skills and rules stay put.

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
