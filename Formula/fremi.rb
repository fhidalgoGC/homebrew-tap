class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.2"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.2/fremi-darwin-arm64"
      sha256 "098c309cfe524e2209032a12c6d637fbc7c7be9ef037dab62740e099d01471e6"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.2/fremi-darwin-x64"
      sha256 "f52ea559962c680d60238f618422f505b7ceb22abf60b2763f70f60aa373a196"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.2/fremi-linux-arm64"
      sha256 "9270c70e948e5131631466083ef7fc8138cdfb11a0547f8e88044d1d3ef1a93c"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.2/fremi-linux-x64"
      sha256 "00366b087d1422a05490bdcefc5a45c0063ac89c703e81faea69b3b88275f1a7"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Two-layer setup:

        fremi agent install                (prompts about MCP too)
        fremi install <path>               per-project
        fremi setting [path]               interactive: toggle active per
                                           section (agents, methodology,
                                           product, feature, story, enabler)
        fremi mcp                          runs the MCP server

      methodology.user.yaml now sits alongside the layer settings under
      .fremi/settings/ and controls paths, slug rules, and identifier
      prefixes/formats. Edit it directly to change how features (FT-XX)
      or stories (HU-XX) are named.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
