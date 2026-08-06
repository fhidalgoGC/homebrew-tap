class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.3.1"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.1/fremi-darwin-arm64"
      sha256 "650c796fa9ac8d4e10f4eb41412fcaaa0a44b10aa67b5fec680245b84336ee74"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.1/fremi-darwin-x64"
      sha256 "eaf414559a50375ab4115a3b492afdd649eabf54023536b812997989f6d59ec9"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.1/fremi-linux-arm64"
      sha256 "c178fffb30f18e2f1d720391cffd657c2918248e07997e629623829e768974d4"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.1/fremi-linux-x64"
      sha256 "61d8cb2dcbf9595570f84d68b7ca0a3f8add2e164ddd04243c6bdcefcfbb4ea1"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Two-layer setup:

        fremi agent install        (once per machine — installs skills, rules,
                                    and a SessionStart verify hook to ~/.claude/)
        fremi install <path>       (per project — writes docs/works/, .fremi/
                                    config.yaml, CLAUDE.md block)

      `fremi install` auto-runs `fremi agent install` if the machine hasn't
      been set up yet, so you can also run just:

        fremi install

      Framework content is fetched automatically to ~/.fremi on first use.
      Update later with: fremi update
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
