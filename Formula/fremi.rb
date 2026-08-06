class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.3.4"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.4/fremi-darwin-arm64"
      sha256 "6a930886f84be41a13193838f1073411e563733325c40d70e6c1a386f56c7ec6"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.4/fremi-darwin-x64"
      sha256 "bdb78e6ec0a2f844efd2095709ba6f36c1fbc1797cba18aa3a470b06ff324d66"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.4/fremi-linux-arm64"
      sha256 "1731f196250cb6c65d274f3ef5c47d1c5c90dad09e012b9fe94f814f5c4364f7"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.3.4/fremi-linux-x64"
      sha256 "618994896aad5b22246b833498a3da50e53e30db9ba5d0886f44850bfec6ff9a"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Two-layer setup:

        fremi agent install        Once per machine. Materialises fremi as
                                   a Claude Code plugin under
                                   ~/.claude/plugins/cache/fremi/, clones
                                   the marketplace at
                                   ~/.claude/plugins/marketplaces/fremi/,
                                   and enables it in settings.json.
        fremi install <path>       Per project. Writes docs/works/, .fremi/
                                   config.yaml (with `enabled: true`),
                                   CLAUDE.md block.

      Fremi skills only auto-activate in a project when BOTH:
        - .fremi/config.yaml exists at the project root
        - the file contains `enabled: true` at the top level
      Otherwise Claude Code will see the skills but not invoke them,
      thanks to a SessionStart hook (`fremi verify`) that injects an
      INACTIVE notice into the model's context.

      Framework content is fetched automatically to ~/.fremi on first use.
      Update later with: fremi update
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
