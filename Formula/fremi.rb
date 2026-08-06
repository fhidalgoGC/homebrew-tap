class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.4"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-darwin-arm64"
      sha256 "26519e7f5e713f40ffb2714407d5fdbb541ef6dc3a93f3a3dbbac95738fcfc7b"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-darwin-x64"
      sha256 "016b5a0a8dd0569c7df8a5421ca03f55ea98e08e9c31b0728540ae7af722189d"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-linux-arm64"
      sha256 "ab542cb11457b9b5ef6cfef743fcc727be5b3196f702f3221d5de645bd0d7039"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-linux-x64"
      sha256 "30c2da655fe880cbdd7eb5c7187fb849831b9b4ed106090b70d3ec97c7135668"
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
