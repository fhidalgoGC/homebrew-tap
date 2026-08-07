class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.12"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.12/fremi-darwin-arm64"
      sha256 "e7d612590e8899c0162049b2823540b716c734814e36f9d97477e50fae94e718"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.12/fremi-darwin-x64"
      sha256 "9cccaf9aac64ce0bfbf3fbe70c5937fa1417932908e9868b2eaf559f099abe00"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.12/fremi-linux-arm64"
      sha256 "1128ded1f27c322f664c87de4b496faabcb55c2183b8350a5a8e3c402ca4cce2"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.12/fremi-linux-x64"
      sha256 "64a851d8a5f3c848dcfc6b441796f0bf5ff91538c76a55798296a86b8e29d5e1"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      Framework organization (v0.4.12):
        - Configs specific to a single skill now live next to that
          skill's SKILL.md file. Bug configs moved from
          framework/settings/ to framework/skills/<layer>/skills/bug/.
        - Transversal configs (agents, methodology, models, config
          master, reverse, extra) stay in framework/settings/.

      Project's .fremi/settings/ folder layout is unchanged — bug
      user configs still land at .fremi/settings/config.bug.<scope>.user.yaml
      as before. The install mapping flattens nested framework paths
      so the project stays discoverable by `fremi setting`.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
