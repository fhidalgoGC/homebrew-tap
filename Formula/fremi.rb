class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.13"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.13/fremi-darwin-arm64"
      sha256 "bf5aabfb3021e3997ec766477a814ee6a05b869ce309a5e08f42a99083b6abf0"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.13/fremi-darwin-x64"
      sha256 "4ac2ac6c59ad6e6319bea563c21cc5ee430fbd526337fe9f99c0a20d7bc1f3e1"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.13/fremi-linux-arm64"
      sha256 "64a1d317c4a94dc87bd852a574e1f2d9472f48f6e022a049863d488989b11dba"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.13/fremi-linux-x64"
      sha256 "7c0ace597eb581401f36cbad6c0322d17ba66a6a5024417b337fd4306dc6b2f0"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      New in v0.4.13:

        fremi setting → <layer> now offers TWO editors per layer:

          🤖  Edit models for this layer
                which model each sub-skill runs on
                (opus / sonnet / haiku / concrete model ID)

          🎭  Edit step agents (main / subagent / agent)
                which agent TYPE executes each step of the layer's
                flow. Reads valid options + reasoning from the
                core config; steps with only one option are
                surfaced as read-only.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
