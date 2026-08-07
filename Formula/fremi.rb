class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.6"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.6/fremi-darwin-arm64"
      sha256 "1bdf6b8c4c030351b4453a6a124c2c1841b72e3581189dc06473185cf1769479"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.6/fremi-darwin-x64"
      sha256 "45df5e361c619d16c3db683159900e21062e877bb0dd0690a14a049df246238e"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.6/fremi-linux-arm64"
      sha256 "453522f98d9383ced1820c19372a6fe572e11533511a84af13655163fe596ace"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.6/fremi-linux-x64"
      sha256 "0dd052fde9d240b53644c6669640b18934866c3015da21bbb594b4209840ce68"
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
        models      → per-skill alias mapping for all 50 fremi skills
                      (opus/sonnet/haiku), pre-populated snapshot so
                      opening .fremi/settings/models.user.yaml shows
                      you every skill's model at a glance.

      Changes are written back to the .fremi/settings/*.user.yaml file,
      preserving comments and formatting.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
