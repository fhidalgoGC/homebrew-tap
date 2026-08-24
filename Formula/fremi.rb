class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.18"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.18/fremi-darwin-arm64"
      sha256 "932251eb5a4bcd857c0885dfb0d30f39949244eb227993eba50591e3f45fc6fa"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.18/fremi-darwin-x64"
      sha256 "e0c8750f417975fc7c1ddbe6e155cc2662ed1d554659302c2cddaa131d0bcd85"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.18/fremi-linux-arm64"
      sha256 "808e983f8a79eed0049b6dcf544c8e924253643251321eca977c931712d62b34"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.18/fremi-linux-x64"
      sha256 "e3bc64f36489c38eb12f9341c085437a5ca592740926f3c6f81fb02dcbe88de6"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      What's new in v0.4.18 — uninstall leaves no trace:

        `fremi uninstall --purge` removes the whole .fremi/ tree, not just
        config.user.yaml. `fremi uninstall --with-user` (alias --all) chains
        the user-level cleanup, so one command removes fremi for EVERY
        project. docs/works/ is never touched.

        Fixed: the MCP server entry now points at the fremi binary that is
        actually running, instead of always resolving `which fremi`.

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
