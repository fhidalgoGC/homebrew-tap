class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.0"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.0/fremi-darwin-arm64"
      sha256 "10736632d83ad0f4d77fc0d69ea1aa5ff6f729bc3a1d66b542a4e34fda1caf45"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.0/fremi-darwin-x64"
      sha256 "279aa50f2d16fbc2a9603c185b4d2c891628dfada3cc2df0b2749513295168d0"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.0/fremi-linux-arm64"
      sha256 "b619505617b9c1d20026b6eec78e3339b5cb60b63ecd661064901ddfbb6be1b7"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.0/fremi-linux-x64"
      sha256 "ac275a5d9a872b137ee8d355e8612b64b8caa749348dda66a98f1d97d71cf8a2"
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
                                   the marketplace, and registers the MCP
                                   server (~/.claude/mcp/fremi.json).
        fremi install <path>       Per project. Writes docs/works/, .fremi/
                                   config.yaml with enabled: true, plus
                                   .fremi/settings/ overrides.
        fremi setting [path]       Interactive TUI to toggle active per
                                   section under .fremi/settings/.
        fremi mcp                  Runs the MCP server (invoked by Claude
                                   Code, not manually).

      MCP tools exposed:
        - mcp__fremi__project_status
        - mcp__fremi__list_features
        - mcp__fremi__list_stories
        - mcp__fremi__list_enablers

      Fremi skills only auto-activate when .fremi/config.yaml has
      enabled: true. Update the framework later with: fremi update
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
