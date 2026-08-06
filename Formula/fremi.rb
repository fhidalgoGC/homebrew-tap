class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.2.4"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.4/fremi-darwin-arm64"
      sha256 "12181e2327097c89cb0175326e5335b568692ef20d0004e4c23720cf644b55f1"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.4/fremi-darwin-x64"
      sha256 "2e250369271c8fbb1e984f23d98202d08c80f5b5e702ef99ab28a129bde6c598"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.4/fremi-linux-arm64"
      sha256 "1e425f70059317f3424a0bffb9ee6cd0b7e9607e4dce8d8854b72a83fcde239b"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.4/fremi-linux-x64"
      sha256 "51de46346f8c703deb373e9c676b12dbb55812e57d71d8fa13a0595f252d088e"
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

      Interactive mode (default in a terminal): asks which agent(s) to
      install for. Pass --non-interactive or -y to skip the prompt.

      Framework content is fetched automatically to ~/.fremi/framework on
      first `fremi install`. Update it later with `fremi update`.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
