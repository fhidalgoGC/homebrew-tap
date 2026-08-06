class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.1.6"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.6/fremi-darwin-arm64"
      sha256 "296a4dd4d2aacb77314030bcc5c74ac778de287d29177080f2355fc844734d44"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.6/fremi-darwin-x64"
      sha256 "3442ecdda7907cfb1d0d5d41ff519437ee3f6d2736cd3cb620030186c343a65c"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.6/fremi-linux-arm64"
      sha256 "3be9a0db60600a513212007352cb745a3b719f837174921088a0ffe11082c9cb"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.6/fremi-linux-x64"
      sha256 "9349565729603ac148c59d37753acdcff5252e9f392897a37fa9220e0a6fbfb1"
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
