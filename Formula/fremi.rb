class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.3"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.3/fremi-darwin-arm64"
      sha256 "f56875507ddfa4cf40d47ce45a50f841b07d85b5a857cc9f48b339f4019b6835"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.3/fremi-darwin-x64"
      sha256 "11b069e46c291303358a9ab523826eb87fb87b58f389db40495f7f80c4586210"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.3/fremi-linux-arm64"
      sha256 "96792309f52b218da2e0110fa81bc7ade2ddd260241c981864a96ee959b026bd"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.3/fremi-linux-x64"
      sha256 "e1022bf4ea3cd86b222b9e56516840029ff721c37f5f9ff0fd4bbd340d28cbe1"
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
                                  identifiers (prefix + id_format per
                                  type: feature, story, enabler, ...).

      Changes are written back to the .fremi/settings/*.user.yaml file,
      preserving comments and formatting.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
