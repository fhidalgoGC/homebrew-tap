class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.2.2"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.2/fremi-darwin-arm64"
      sha256 "52ea9011c119c0314aadbdda24750d1342e478cea9479d99ef5d374c265f7c91"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.2/fremi-darwin-x64"
      sha256 "c1e381527ebff074ae4f04a42c2850a63f9de1115f9e8afbc153f12c6b0b9263"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.2/fremi-linux-arm64"
      sha256 "31d29cde9b92e73466d3de268b4b0e7b5bc39049a2ebce431fbbd334fb582cf5"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.2/fremi-linux-x64"
      sha256 "656091668d4f30ac0bf3961f136a8fecc6980e6436cb19d620433cde7cad6020"
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
