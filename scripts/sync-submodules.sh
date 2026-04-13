#!/usr/bin/env bash

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"

git -C "$repo_root" submodule sync --recursive
git -C "$repo_root" submodule update --init --jobs 4
