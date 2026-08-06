class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.2.3"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.3/fremi-darwin-arm64"
      sha256 "1db584472fe71cc1725ed5034804cf977b0082f6dcac76144e6f2715bc6bcdbe"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.3/fremi-darwin-x64"
      sha256 "81707c0a764031a5a2a6190fcc9315c5d38022f77abd5aef51e9918231ca78cb"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.3/fremi-linux-arm64"
      sha256 "278a9ef16f9dcd62d35148c6fa7119d478a4d944a44609e520136ff6870d99e7"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.3/fremi-linux-x64"
      sha256 "82bc4fc15072e45b2afec6f301781bc0a3bae935cfeb050441f8cb5c13f54af9"
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
