#!/bin/sh
set -e
REPO="Himan-D/hystersis"
echo "Hystersis installer — https://code.hystersis.com"
echo "Resolving latest release for $REPO ..."

# Detect OS/ARCH -> artifact name matching .github/workflows/release.yml in Himan-D/hystersis
OS=$(uname -s)
ARCH=$(uname -m)
case "${OS}-${ARCH}" in
  Darwin-arm64) BINARY="hystersis-macos-arm64" ;;
  Darwin-x86_64) BINARY="hystersis-macos-x64" ;;
  Linux-x86_64) BINARY="hystersis-linux-x64" ;;
  Linux-aarch64|Linux-arm64) BINARY="hystersis-linux-arm64" ;;
  *) echo "Unsupported platform: ${OS}-${ARCH}"; echo "Try: cargo install --git https://github.com/${REPO}"; exit 1 ;;
esac

# Try to get latest tag; handle no releases gracefully
API="https://api.github.com/repos/${REPO}/releases/latest"
VERSION=""
if command -v curl >/dev/null 2>&1; then
  VERSION=$(curl -fsSL "$API" 2>/dev/null | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || true)
elif command -v wget >/dev/null 2>&1; then
  VERSION=$(wget -qO- "$API" 2>/dev/null | grep '"tag_name":' | sed -E 's/.*"([^"]+)".*/\1/' || true)
fi

if [ -z "$VERSION" ]; then
  echo ""
  echo "No published release found yet for ${REPO}."
  echo "Install from source (until first release is published):"
  echo "  cargo install --git https://github.com/${REPO} --package xai-hystersis-pager-bin --bin xai-hystersis-pager"
  echo "  # then: hystersis --help  (binary is xai-hystersis-pager)"
  echo ""
  echo "Or wait for: https://github.com/${REPO}/releases"
  echo "Installer is reachable at https://code.hystersis.com/install.sh — will auto-install once a release exists."
  exit 0
fi

URL="https://github.com/${REPO}/releases/download/${VERSION}/${BINARY}"
DEST="/usr/local/bin/hystersis"
echo "→ Downloading ${BINARY} ${VERSION} ..."
echo "  $URL"

# helper: download with 404-aware error + fallback hint
download_or_fail() {
  _url="$1"
  _dest="$2"
  if command -v curl >/dev/null 2>&1; then
    if ! curl -fL "$_url" -o "$_dest" 2>/tmp/hystersis-curl-err.log; then
      echo ""
      echo "✗ Binary not found: $_url"
      cat /tmp/hystersis-curl-err.log 2>/dev/null || true
      echo ""
      echo "This platform artifact is not yet published for ${VERSION}."
      echo "Available at: https://github.com/${REPO}/releases/tag/${VERSION}"
      echo "Fallback (from source):"
      echo "  cargo install --git https://github.com/${REPO} --package xai-hystersis-pager-bin --bin xai-hystersis-pager"
      echo "  # or wait for next release with all 4 artifacts"
      rm -f "$_dest"
      exit 1
    fi
  else
    wget -qO "$_dest" "$_url" || {
      echo "✗ Download failed: $_url"
      rm -f "$_dest"
      exit 1
    }
  fi
}

# Need write access for /usr/local/bin; fallback to $HOME/.local/bin
if [ -w "/usr/local/bin" ]; then
  download_or_fail "$URL" "$DEST"
  chmod +x "$DEST"
  echo "Installed to $DEST"
  "$DEST" --version 2>/dev/null || hystersis --version 2>/dev/null || true
else
  mkdir -p "$HOME/.local/bin"
  DEST="$HOME/.local/bin/hystersis"
  download_or_fail "$URL" "$DEST"
  chmod +x "$DEST"
  echo "Installed to $DEST (add ~/.local/bin to PATH)"
  "$DEST" --version 2>/dev/null || true
fi
