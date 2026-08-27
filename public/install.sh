#!/bin/sh
set -e
echo "Hystersis installer — https://code.hystersis.com"
echo "Fetching latest release..."
# Replace with real release URL after you publish binaries to GitHub Releases
# Example:
# REPO="Himan-D/code"
# VERSION=$(curl -fsSL https://api.github.com/repos/$REPO/releases/latest | grep '"tag_name":' | sed -E 's/.*"(v[^"]+)".*/\1/')
# OS=$(uname -s | tr '[:upper:]' '[:lower:]')
# ARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/;s/arm64/arm64/')
# URL="https://github.com/$REPO/releases/download/${VERSION}/hystersis-${OS}-${ARCH}.tar.gz"
# curl -fsSL "$URL" | tar -xz -C /usr/local/bin
# chmod +x /usr/local/bin/hystersis
# hystersis --version
echo "If you see this, the installer is reachable at code.hystersis.com/install.sh"
echo "Add your real binary distribution here."
