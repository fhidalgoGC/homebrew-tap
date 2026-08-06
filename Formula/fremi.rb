class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.3.5"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.5/fremi-darwin-arm64"
      sha256 "5d4c5180a7b3e345a6c61e1df9342d1e2336cb29d0e5ad52284a7cfbf3aa1ece"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.5/fremi-darwin-x64"
      sha256 "cd7cd8fb5a051021ec36083fb5c22a45b70343e8fcc738e83c56f3eb07c43ce1"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.5/fremi-linux-arm64"
      sha256 "7b9fc50d3879111326907693002c00fccb5b9977e16d3a04f083d66505a3be1d"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.5/fremi-linux-x64"
      sha256 "dba1419570284d8996a395425a2800cd7adb336cfcca88a44c3c662f9965f77b"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Two-layer setup:

        fremi agent install        Once per machine. Materialises fremi as
                                   a Claude Code plugin under
                                   ~/.claude/plugins/cache/fremi/.
        fremi install <path>       Per project. Writes docs/works/, .fremi/
                                   config.yaml with `enabled: true`, plus
                                   .fremi/settings/ with per-layer overrides.
        fremi setting [path]       Interactive TUI to toggle `active`
                                   per section under .fremi/settings/.

      Fremi skills only auto-activate when .fremi/config.yaml has
      enabled: true. Otherwise the SessionStart hook injects an
      INACTIVE notice.

      Update the framework later with: fremi update
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
