class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.4.16"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.16/fremi-darwin-arm64"
      sha256 "6081407ef21c1dbf8e65732a871c141b9166b14e183f1c2478a921e69fb89e9a"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.16/fremi-darwin-x64"
      sha256 "a91414716580027abd0b52087f216ab679d9811d90af60d707730f225cd2c3db"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.16/fremi-linux-arm64"
      sha256 "4de8a07257e26d2a14be61022c79a679b692d5345384ed9ac7a289f080cad6d1"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.4.16/fremi-linux-x64"
      sha256 "31ea74d9b2f3b94a4152f88ccfaaa725a6be4562fe553d3698b5a768d087439d"
    end
  end

  def install
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed.

      Framework layout aligned to SAFe (v0.4.16):

        framework/artifacts/          SAFe artifact layers
          ├── product/
          ├── feature/
          ├── story/
          ├── enabler/
          └── extra/

        framework/skills/             Utility skills (NOT artifacts)
          ├── tools/
          └── sync-check/

        framework/reverse-engineering/  Reverse-* skills (unchanged)
        framework/pipelines/            Pipeline orchestrators (unchanged)
        framework/settings/             Global config (unchanged)

      Project layout in .fremi/settings/ is UNCHANGED. The install
      mapping keeps every user file at the same top-level or per-layer
      folder as before; only the framework's own organization moved.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
