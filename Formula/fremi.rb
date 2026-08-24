class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.17"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.17/fremi-darwin-arm64"
      sha256 "19479abc4d49ce3791e1a19c2686e8c84938e76c48e65bbe7ab3b5111e46b04d"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.17/fremi-darwin-x64"
      sha256 "608491163a1da968a8e4ca6da756b2542242aebb4e26b55c729238495541b5c9"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.17/fremi-linux-arm64"
      sha256 "829acb7ec5c367f615ec77ccd1d1963208aeed86ff7606710f2050a931a44f03"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.17/fremi-linux-x64"
      sha256 "c54f17b200bc916c6cf10d85b41529625489b88d4a8df79105581f44be6ca80b"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      What's new in v0.4.17 — framework hooks are wired automatically:

        `fremi install` (via `fremi agent install`) now discovers every hook
        in the framework and registers it in the Claude Code plugin at
        ~/.claude/plugins/cache/fremi/fremi/<version>/hooks/hooks.json

        Each hook declares its own event and matcher in its header, so hooks
        added to any layer, pipeline or reverse-skill are picked up with no
        CLI change. Previously only the SessionStart bootstrap was wired.

      Upgrading from an older version:

        fremi update            # pull the framework content
        fremi agent install     # re-register skills + hooks
        fremi install [path]    # refresh the project (idempotent)

      Framework layout (unchanged since v0.4.16, plus per-domain folders):

        framework/artifacts/<layer>/    product, feature, story, enabler, extra
          ├── workflow.yaml             canonical step sequence
          ├── rules/                    domain rules + applies.yaml per step
          ├── hooks/                    domain hooks
          └── skills/                   the layer's invocable steps

        framework/rules/                cross-domain rules (workflow.md = index)
        framework/hooks/                cross-domain hooks
        framework/pipelines/            pipeline orchestrators
        framework/reverse-engineering/  reverse-* skills
        framework/settings/             global config

      Project layout in .fremi/settings/ is UNCHANGED.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
