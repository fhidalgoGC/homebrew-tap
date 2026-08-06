class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.1.5"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.5/fremi-darwin-arm64"
      sha256 "3b148145ca16027782829b9275534175b6ed832c27ec73ffa2a767b7671b4b62"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.5/fremi-darwin-x64"
      sha256 "2f1d8af139421e7d2d68b3576883167cf7a8de62b703427eb321121961b753b7"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.5/fremi-linux-arm64"
      sha256 "4649524f652dfde9746faa729a33a0ff6fc54c6ab7cbec87cfe56b6064c6c700"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.5/fremi-linux-x64"
      sha256 "27403e5e34ea008454b23fdc3fba276616afad1a2ebeb1dd8988971d2933a837"
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
