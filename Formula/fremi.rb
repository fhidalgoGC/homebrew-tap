class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.7"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.7/fremi-darwin-arm64"
      sha256 "9843d9af103a3c2e22e2fd78601aedbb1ab3de30416a6103de88305741e0af9f"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.7/fremi-darwin-x64"
      sha256 "293be82c3816d87e86d4a13b22e05485ec2da2f0e8c35f04c3d0b209b7dd2b5f"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.7/fremi-linux-arm64"
      sha256 "549960bd993387fb1571716f4aa8068af49975554adfe111a48f79ef554e8d4a"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.7/fremi-linux-x64"
      sha256 "ffb08a659b793cddfb34c3ed01f61225d48cb7d125f9cbad9befd90f6b48ede4"
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
        models      → per-skill alias mapping for all 50 fremi skills.
                      Pick from aliases (opus/sonnet/haiku, portable
                      across agents) OR concrete Claude models
                      (claude-opus-4-7, ..., agent-locked).
                      Catalog + aliases are editable per-project so
                      you can add new models as they ship.

      Changes are written back to the .fremi/settings/*.user.yaml file,
      preserving comments and formatting.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
