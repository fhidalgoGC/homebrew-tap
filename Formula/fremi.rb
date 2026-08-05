class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.1.1"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.1/fremi-darwin-arm64"
      sha256 "16273ee522c3f47584bf86827e29b5306c37ec988a4c58e136262241a47d84ff"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.1/fremi-darwin-x64"
      sha256 "6bc852bf6f82fa1533a1fe0b15609219c8a7536682716d064964770f34b55af9"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.1/fremi-linux-arm64"
      sha256 "3195bc0be0f8820a7812c537efebdbc1d601aea3ec7e9083b651370b4fb12f10"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.1/fremi-linux-x64"
      sha256 "0501846a8aacc89d2aec35138e23a816d8826cb5e8cacbbee3e2a9419c57aa46"
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
      first `fremi install`. Update it later with:

        git -C ~/.fremi/framework pull
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
