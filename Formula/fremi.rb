class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.4"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-darwin-arm64"
      sha256 "589a2980037f6f155871d40d8e24c0ffef43d1e09287513b5dd213b279017a8c"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-darwin-x64"
      sha256 "79c614c09d19a36141f8731ca92a5d6d724a4e5d10e0e008b467f78695620a5b"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-linux-arm64"
      sha256 "e97e84b8328325333a68e21e057659f1a935ddcc28c3a7b57cce1f4bca0d10f5"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.4/fremi-linux-x64"
      sha256 "b319047974a65b9f709043d86b267fba2a45c4210f548de306c5e3deb76f04a5"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Interactive settings editor:

        fremi setting [path]      Menu of sections. Pick methodology
                                  and edit paths, slug rules, or
                                  identifiers. Each field shows the
                                  framework default so you can accept
                                  it with Enter or override it.

      Changes are written back to the .fremi/settings/*.user.yaml file,
      preserving comments and formatting.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
