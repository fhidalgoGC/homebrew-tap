class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.19"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.19/fremi-darwin-arm64"
      sha256 "c624c1e9768214bf3a987bdae70b925c4ab43e4194e6fa75eb5ed3646c3db22e"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.19/fremi-darwin-x64"
      sha256 "3792f543ed40abc6180e5e37a578d3dcd7350bd82d3dddddbbc3e8ecb631dd0d"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.19/fremi-linux-arm64"
      sha256 "4d3847db7d79e31165f9ef322db1fb798d509cac7f295e5f77036c7e529360df"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.19/fremi-linux-x64"
      sha256 "d00d91f67582c59c6935b4fb482121276a9eaf845666c49a25f80fd3d1a2b95b"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      What's new in v0.4.19 — a project carries its own fremi:

        `fremi install` now writes .claude/skills/, .claude/rules/ and the
        framework's hooks into the PROJECT, next to CLAUDE.md and .fremi/.
        The skills used to live in the user-level plugin, so every project on
        the machine saw them whether or not it had installed fremi.

        Staying user-level: the MCP server (it answers about fremi itself,
        not about a project) and the SessionStart bootstrap hook (it must run
        where fremi is NOT installed, to say so).

        Fixed: `fremi verify` hung forever when stdin was a pipe nobody
        closed — it is the SessionStart hook, so it was surviving on Claude
        Code's 5s kill.

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
