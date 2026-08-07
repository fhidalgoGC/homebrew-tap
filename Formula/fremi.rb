class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.10"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.10/fremi-darwin-arm64"
      sha256 "be9cfd082c896fcdef0876687f8755e140ec48e0cd6241a521654832764802dc"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.10/fremi-darwin-x64"
      sha256 "7a4e48bb51883382533b221a2e403d728455328f6bcb29962b6edfaa9665520b"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.10/fremi-linux-arm64"
      sha256 "023bb456c32139658d8aaa6012fabcc1288df58f259560309e59975eb46106f0"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.10/fremi-linux-x64"
      sha256 "b5ecfeaa5fe132a4422a0e1fe2c99d39d18f7a4e585566b5b35067f1812ea3ef"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      Model catalogs are NO LONGER shipped in YAML — `fremi install`
      fetches the live catalog from GitHub at install time and caches
      it at .fremi/settings/catalog/<agent>.json. When Anthropic ships
      a new model, users pick it up on the next `fremi install` without
      a fremi release bump.

      Interactive settings editor:

        fremi setting [path]

        agents  → 🎯 Edit default model  (project-wide fallback)
        <layer> → 🤖 Edit models for this layer  (scoped per layer)
        methodology → paths / slug / identifiers.

      The model picker collapses aliases + a "✏ Choose specific model..."
      expansion — no more duplicate rows.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
