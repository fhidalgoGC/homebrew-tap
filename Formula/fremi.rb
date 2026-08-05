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

  def post_install
    # Ensure the framework content (skills, hooks, rules, flows) is present
    # at ~/.fremi/framework. The binary looks there at runtime.
    framework_dir = File.expand_path("~/.fremi/framework")
    unless File.exist?(File.join(framework_dir, "VERSION"))
      system "git", "clone", "--quiet",
             "https://github.com/fhidalgoGC/homebrew-tap.git",
             framework_dir
    end
  end

  def caveats
    <<~EOS
      fremi-framework binary installed.
      Framework content lives at:   ~/.fremi/framework
      Update framework content:     git -C ~/.fremi/framework pull
      Try:                          fremi version
                                    fremi install /path/to/project
    EOS
  end

  test do
    assert_match "fremi-framework", shell_output("#{bin}/fremi version")
  end
end
