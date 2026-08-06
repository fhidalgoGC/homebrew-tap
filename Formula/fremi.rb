class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.1"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.1/fremi-darwin-arm64"
      sha256 "542f79a0bb1adfb7c143d344b68a339c5f742cc9aa6ee479b359a0f6329588a8"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.1/fremi-darwin-x64"
      sha256 "411cc3e93a9bc01e04893e828573a7af1ef6ecd1e9e5942dec4bb5b11c270a3d"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.1/fremi-linux-arm64"
      sha256 "a2cff504fc9cf92d735734996407318aff3283c303ca492877ed52edaa85611b"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.1/fremi-linux-x64"
      sha256 "805c78c076be1d206f4313dce6ab8805de45d1d65f087623f0148bec0b5ce0b2"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Two-layer setup:

        fremi agent install                Once per machine. Asks whether
                                           to include the MCP server. Use
                                           --with-mcp / --no-mcp to skip
                                           the prompt.
        fremi install <path>               Per project.
        fremi setting [path]               Interactive TUI (toggle active).
        fremi mcp                          Runs the MCP server (invoked by
                                           Claude Code).

      MCP tools exposed:
        - mcp__fremi__project_status
        - mcp__fremi__list_features
        - mcp__fremi__list_stories
        - mcp__fremi__list_enablers

      Update the framework later with: fremi update
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
