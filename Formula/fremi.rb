class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.3.3"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.3/fremi-darwin-arm64"
      sha256 "6d59fca52a1a1151cb98bfd7c35f88e4a91aeecfdffac9d3636048483a8594be"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.3/fremi-darwin-x64"
      sha256 "9bc6905fc5d9db2816b3cfe6388f81660c2ff011d2cc6dfb90483d233185db9c"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.3/fremi-linux-arm64"
      sha256 "b65f69f5ffee6041c37a5023c7b1a8ed0a066ea6f0d1f0fbc6ff6f864d85322d"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.3/fremi-linux-x64"
      sha256 "9dec02f43a42e0d7f6fadf5b78fa7758d11d9e4bb141e252498d6e7b67f9a1db"
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
                                   ~/.claude/plugins/cache/fremi/, clones
                                   the marketplace at
                                   ~/.claude/plugins/marketplaces/fremi/,
                                   and enables it in settings.json.
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
