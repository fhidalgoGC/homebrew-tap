class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.2.5"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.5/fremi-darwin-arm64"
      sha256 "872cc6b8155f61fb4b66228457e8649fd25226d95f8e14060cfa2af0731e2b0a"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.5/fremi-darwin-x64"
      sha256 "8b4363d5a93ec3f13aaccac9f1d1a8004be17003ca57ddc33e7c92eeafb52db6"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.5/fremi-linux-arm64"
      sha256 "b26809c05541acf7ee4bde096e0ee6af73d2242816520a2dbb0a20a4b0ff33c1"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.2.5/fremi-linux-x64"
      sha256 "c2df5ddf31c70fc12d6ec613a2930f00579f29e835487cec682b577c0a76c869"
    end
  end

  def install
    # The download is a single pre-compiled binary; rename it to `fremi`.
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi installed. Try:

        fremi install /path/to/project

      Interactive mode (default in a terminal): pick agents by toggling
      each with ENTER; select 'Done' to finalize. Pass --non-interactive
      or -y to skip the prompt.

      Framework content is fetched automatically to ~/.fremi/framework on
      first `fremi install`. Update it later with `fremi update`.
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
