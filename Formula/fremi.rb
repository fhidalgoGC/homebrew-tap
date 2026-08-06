class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.3.2"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.2/fremi-darwin-arm64"
      sha256 "6c0c2b74cccd69675386b78655bc39a8a27a85ae3d91d849f68c604ca26436be"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.2/fremi-darwin-x64"
      sha256 "dbfe14f09ad983aaaee2aa7a02df80599ce7a2bd0e992923211f44f6c5008493"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.2/fremi-linux-arm64"
      sha256 "eeffe0e00dcc58508c9a7015bf30d8c6027dead30a19e9fb63891022cc656039"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.2/fremi-linux-x64"
      sha256 "a54d1c9a22dc84a90672b6698e081a719c8bb3337eb6209b08fbfbb1d3e8f0f7"
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
                                   ~/.claude/plugins/cache/fremi/ and enables
                                   it in ~/.claude/settings.json.
        fremi install <path>       Per project. Writes docs/works/, .fremi/
                                   config.yaml, CLAUDE.md block.

      `fremi install` auto-runs `fremi agent install` if not done yet.

      Framework content is fetched automatically to ~/.fremi on first use.
      Update later with: fremi update
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
