class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.11"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.11/fremi-darwin-arm64"
      sha256 "81f8168006d69533263219300c53c7c5c3b218c5c292bedcaf692ab863e6575d"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.11/fremi-darwin-x64"
      sha256 "57301ecfb8093037f9e0a590d553923910f3166a089dc25f02958a50447683e0"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.11/fremi-linux-arm64"
      sha256 "8e32c9c55cae7ad91c92dd33f1a3906955fde1397fa5776fe45513c23353838a"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.11/fremi-linux-x64"
      sha256 "f2571fed084b25bc4cb46b863805e6e75360199d35d9e8afe422b9cbb9ac09ec"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      Naming convention (v0.4.11):
        - framework/settings/  → every file is *.core.yaml (structural)
                                 + *.user.yaml (optional per-project override)
        - .fremi/settings/     → project's *.user.yaml files (all in one place)
                                 including the new config.user.yaml
                                 (previously .fremi/config.yaml — auto-migrated
                                 on `fremi install`).

      Interactive editor:

        fremi setting [path]

        agents  → 🎯 Edit default model
        <layer> → 🤖 Edit models for this layer
        methodology → paths / slug / identifiers.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
