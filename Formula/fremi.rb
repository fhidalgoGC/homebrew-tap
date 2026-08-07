class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.8"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.8/fremi-darwin-arm64"
      sha256 "acbf122220ea0f3764fe3e381c99d22596e5893a149ebc1d97aa32e0c7a287da"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.8/fremi-darwin-x64"
      sha256 "3607adde22792c06afe23f243f854788683af10a3427736ac5c1f348015c3f13"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.8/fremi-linux-arm64"
      sha256 "bd27a8fe0a07c59f39896985ec464aa85d5b1696dd4dfb42c89a7f25330e407b"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.8/fremi-linux-x64"
      sha256 "899684bf1958b0533ed24c7cca2c0a81f61a89fe7bdfbe38e673736ed016cf4d"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Interactive settings editor:

        fremi setting [path]      Menu of sections.

        Each layer section (product, feature, story, enabler, ...)
        now offers "🤖  Edit models for this layer" — a scoped view
        of just the sub-skills for that layer, so you don't have to
        scroll through all 50 skills at once.

        methodology → paths / slug rules / identifiers.
        models      → flat top-level editor with all skills + catalog
                      + aliases (still available if you want the full list).
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
