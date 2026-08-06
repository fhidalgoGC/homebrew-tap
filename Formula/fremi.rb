class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.4"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-darwin-arm64"
      sha256 "f9e4e9aa06b399a8cd72b099f63c51e2a8078543b618957235e3dad65181ee9e"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-darwin-x64"
      sha256 "35731377aab955160fa063a75c086f080f575f3868f79e270f202be52a0fdd30"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-linux-arm64"
      sha256 "fe47cebc2cf35a48653d30e2f1885c9d641ac4664a9ecfeae272f863f89fc25a"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-linux-x64"
      sha256 "cb38f2234970b0323f07eb3d4234e4a91ce79814872d7dfb768782a18932da17"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Interactive settings editor:

        fremi setting [path]      Menu of sections. Pick methodology
                                  and edit paths, slug rules, or
                                  identifiers. Each field shows the
                                  framework default so you can accept
                                  it with Enter or override it.

      Changes are written back to the .fremi/settings/*.user.yaml file,
      preserving comments and formatting.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
