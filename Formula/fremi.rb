class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.15"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.15/fremi-darwin-arm64"
      sha256 "1aaaaad60eccb4684776493f3b9b4442384c147a2b3d5c9241d8024b96744b4c"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.15/fremi-darwin-x64"
      sha256 "09b2e48d2c279742b5f5f35b0a1671fd72e9cc65936287f06147cc19490f6d41"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.15/fremi-linux-arm64"
      sha256 "142085c99653a531cd70047a9f4a917bd8037c5f00884b2d086a3670f6e1afd6"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.15/fremi-linux-x64"
      sha256 "886662400b87d54659bb7a8326fb66877bcf7ac689166838632e1df46ea5ad24"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      Removed in v0.4.15:
        - framework/installs/ folder deleted entirely.
        - /fremi-install-framework slash-command retired — its symlink
          is auto-cleaned on the next `fremi install`.
        - The CLI `fremi install` is now the ONE bootstrap path.

      Rule 24 (framework-installed guard) has no exceptions anymore:
      every skill requires the CLI to have run first. Reverse skills
      too — no more chicken-and-egg confusion.

      Framework total: 50 skills (was 51).
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
