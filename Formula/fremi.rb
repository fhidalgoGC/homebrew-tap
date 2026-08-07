class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.14"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.14/fremi-darwin-arm64"
      sha256 "6fee747debfa94f48ea5920d068ef8fb106f1d32268c6648a2bde198aa8771b4"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.14/fremi-darwin-x64"
      sha256 "52a31f944460b34a38a109d7164d6deef88aec47ca5e4cc48dce171b309e715d"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.14/fremi-linux-arm64"
      sha256 "a8e2ca64a40028c43a2ae6a53a8e2056205274413145c161a4a500c4ed361ea6"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.14/fremi-linux-x64"
      sha256 "3f43fdcda91e10f483ece90846fec292d50bc65836f243a7608bdb1180ab9508"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      New in v0.4.14:

        /fremi-extra <slug> — scaffolder for the EXTRA layer (Regla 14).
        Calculates the next EX-NN globally, validates the slug, creates
        docs/works/extra/EX-NN_<slug>.md from the canonical template
        with frontmatter (Regla 17).

        Extra now has its own folder in framework/skills/extra/ with
        SKILL.md + config + references — mirroring the pattern used by
        every other category.

        Framework total: 51 skills (was 50).
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
