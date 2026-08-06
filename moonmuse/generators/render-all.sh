#!/bin/bash
cd "$(dirname "$0")"
HS=/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell
mkdir -p mm-png/sheets mm-png/phone mm-png/desktop mm-png/wallart
for f in mm-pages/stickersheet-*.html; do
  n=$(basename "$f" .html)
  $HS --no-sandbox --disable-gpu --hide-scrollbars --default-background-color=00000000 --window-size=1100,1320 --screenshot=mm-png/sheets/$n.png "file://$PWD/$f" 2>/dev/null
done
echo "sheets done" >> render.log
for f in mm-pages/wp-*.html; do
  n=$(basename "$f" .html)
  $HS --no-sandbox --disable-gpu --hide-scrollbars --window-size=1290,2796 --screenshot=mm-png/phone/$n.png "file://$PWD/$f" 2>/dev/null
done
echo "phone done" >> render.log
for f in mm-pages/dt-*.html; do
  n=$(basename "$f" .html)
  case "$n" in
    *macbook*) sz=2880,1800;; *windows*) sz=2560,1440;; *ultrawide*) sz=3440,1440;; *ipad*) sz=2048,2732;;
  esac
  $HS --no-sandbox --disable-gpu --hide-scrollbars --window-size=$sz --screenshot=mm-png/desktop/$n.png "file://$PWD/$f" 2>/dev/null
done
echo "desktop done" >> render.log
for f in mm-pages/art-*.html; do
  n=$(basename "$f" .html)
  case "$n" in
    *-2x3) sz=2400,3600;; *-3x4) sz=2700,3600;; *-4x5) sz=2880,3600;; *-A4) sz=2480,3508;; *-A3) sz=2980,4213;;
  esac
  $HS --no-sandbox --disable-gpu --hide-scrollbars --window-size=$sz --screenshot=mm-png/wallart/$n.png "file://$PWD/$f" 2>/dev/null
done
echo "ALL DONE" >> render.log
