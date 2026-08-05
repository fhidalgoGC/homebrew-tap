class Fremi < Formula
  desc "Product Discovery + SDD + BDD + TDD framework CLI for AI coding agents"
  homepage "https://github.com/fhidalgoGC/homebrew-tap"
  version "0.1.0"
  license "MIT"

  depends_on "git"

  on_macos do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.0/fremi-darwin-arm64"
      sha256 "5a43b58520a09d7939a48177a56e26154ea595cd4352efe286b00c6e9c54ceac"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.0/fremi-darwin-x64"
      sha256 "7add54b17fa2d7eb2b3599816ccf7aea26ff7a75a93a7946e01a5e5d952a03b1"
    end
  end

  on_linux do
    on_arm do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.0/fremi-linux-arm64"
      sha256 "3842f080e98f67e7b1269c62d772fd4ef6653ce8a1a08c812bfd8081ebe02e5c"
    end
    on_intel do
      url "https://github.com/fhidalgoGC/homebrew-tap/releases/download/v0.1.0/fremi-linux-x64"
      sha256 "4b0f817ecd68e7980ef7fea7ba2a61b5f008e8ba69e3bc82a9f6df672b6134f2"
    end
  end

  def install
    # The download is a single pre-compiled binary; rename it to `fremi`.
    downloaded = Dir["*"].first
    bin.install downloaded => "fremi"
  end

  def caveats
    <<~EOS
      fremi binary installed. One-time setup — clone the framework content:

        git clone https://github.com/fhidalgoGC/homebrew-tap.git ~/.fremi/framework

      Then:
        fremi version
        fremi install /path/to/project

      Update the framework later with:
        git -C ~/.fremi/framework pull

      (Homebrew's install sandbox prevents writing to $HOME, so the clone
       has to run outside the formula. This is a one-line manual step.)
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
