class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.1.4"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.4/fremi-darwin-arm64"
      sha256 "e23bb2e116dc834d80f7e1373c8034e5448bb4d7c1691479c02302079f369715"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.4/fremi-darwin-x64"
      sha256 "0e3e45d6f9cafa62cf6c7722c73380bff43531491df1d17792037ba635ffab85"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.4/fremi-linux-arm64"
      sha256 "f68245448d418a0e334fed6b5264b28ec860dddc909b4ca4ff5db3dbffd53383"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.4/fremi-linux-x64"
      sha256 "2e3dc8852d5eb3576f0ca265f9507af2013e5658d6bb980b79dfd9a78f45843f"
    end
  end

  def install
    # The download is a single pre-compiled binary; rename it to `fremi`.
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Try:

        fremi install /path/to/project

      Framework content is fetched automatically to ~/.fremi/framework on
      first `fremi install`. Update it later with `fremi update`.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
