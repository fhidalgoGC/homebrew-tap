class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.5"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.5/fremi-darwin-arm64"
      sha256 "698d249a1e8bab3811a546617e9f401bff1f3de0bcf85fb4b65f63f6cdb90422"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.5/fremi-darwin-x64"
      sha256 "c90fc3b4f686a01fe916aa9b9520249e9fa2927673ea754886d6feaeb8ed4c68"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.5/fremi-linux-arm64"
      sha256 "925727491226f7255ea3cdd435531d29351414d9636ad17b2cf4614818ac3518"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.5/fremi-linux-x64"
      sha256 "a4662bbac20aa828aa128f5f3a69bc2ce8c8a05b8efaf72f22dad9ff601137ca"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Interactive settings editor:

        fremi setting [path]      Menu of sections. Pick methodology,
                                  models, or any other section.

        methodology → paths / slug rules / identifiers (with defaults
                      + digit wizard for id_format).
        models      → per-skill alias mapping (opus/sonnet/haiku),
                      resolved per agent tool at runtime.

      Changes are written back to the .fremi/settings/*.user.yaml file,
      preserving comments and formatting.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
