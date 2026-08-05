class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.1.3"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.3/fremi-darwin-arm64"
      sha256 "d6db937b7bea74be948f5736d940ba62a970932bafad218bef5454428e51ef34"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.3/fremi-darwin-x64"
      sha256 "261b2f06fad2f0a2e440c29576d0cb1edb140876f978c2aeadc2ed0eac5583f4"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.3/fremi-linux-arm64"
      sha256 "dd8bcb8876c2f18546c0798e8fbdcc16d16ffead78b393307e905c4c9e319512"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.3/fremi-linux-x64"
      sha256 "c422ffe668504ab1e0a06b3e67a1bdde940dfd4786892ff144c9bba5c45fdf7e"
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
