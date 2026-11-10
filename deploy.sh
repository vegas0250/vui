#!/bin/sh
set -eu
cd "$(dirname "$0")"
[ "$#" -eq 1 ] || { echo 'Usage: ./deploy.sh /path/to/vui-website.tar.gz' >&2; exit 2; }
exec python3 scripts/deploy-website.py "$1"
