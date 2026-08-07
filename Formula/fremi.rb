class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.9"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.9/fremi-darwin-arm64"
      sha256 "7c84a2e27d6bff9866151865d349bafa8d7fb7a9042c21675d87e043146ee4b7"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.9/fremi-darwin-x64"
      sha256 "b253d9069269d7ae3d2427fc58f48d5f104623ddb554fbca0a1f4ebd7dea59de"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.9/fremi-linux-arm64"
      sha256 "ca2f305ab08fdc5191ccc260e6620a4195e3e26dbfbf4182afafcb0f0c98f5f2"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.9/fremi-linux-x64"
      sha256 "f7e619cf706ed5f8bc8cc3c294021cb38266306e2e3c75e592252cd4f4fb88b9"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Interactive settings editor:

        fremi setting [path]

        agents  → 🎯 Edit default model  (project-wide fallback, used
                                          when a skill has no explicit
                                          override)
                → subagent overrides (per Claude Code subagent)

        <layer> → 🤖 Edit models for this layer  (product / feature /
                  story / enabler — scoped to that layer's sub-skills)

        methodology → paths / slug / identifiers (with digit wizard).

      The top-level `models` section is hidden now — everything is
      edited from either `agents` (default) or the layer sections
      (per-skill scoped by context).
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
