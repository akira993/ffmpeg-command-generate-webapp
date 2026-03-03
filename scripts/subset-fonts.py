#!/usr/bin/env python3
"""
Noto Sans JP / Inter サブセット化スクリプト

使い方:
  1. pip install fonttools brotli
  2. scripts/font-sources/ にソースフォント (.ttf) を配置:
     - NotoSansJP-Regular.ttf, NotoSansJP-Bold.ttf
     - Inter-Regular.ttf, Inter-Bold.ttf
  3. python scripts/subset-fonts.py

Google Fonts GitHub からダウンロード:
  JP: https://github.com/google/fonts/tree/main/ofl/notosansjp
  EN: https://github.com/google/fonts/tree/main/ofl/inter
     (Variable TTF をダウンロード後、fonttools varLib.instancer で
      wght=400 / wght=700 の静的インスタンスを生成)
"""

import json
import os
import re
import subprocess
import sys

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(SCRIPT_DIR)
SRC_DIR = os.path.join(SCRIPT_DIR, "font-sources")
OUT_DIR = os.path.join(PROJECT_ROOT, "static", "fonts")

# ウェイト定義
WEIGHTS = ["Regular", "Bold"]

# --- JP サブセット用 Unicode 範囲 ---
JP_UNICODE_RANGES = ",".join([
    "U+0020-007E",      # Basic Latin (ASCII)
    "U+00A5",           # Yen sign
    "U+00B7",           # Middle dot
    "U+2010-2027",      # General Punctuation (dashes, quotes, bullets)
    "U+2030-203E",      # Per mille, prime, overline
    "U+2190-2199",      # Arrows
    "U+2212",           # Minus sign
    "U+2260",           # Not equal
    "U+2264-2265",      # Less/greater than or equal
    "U+3000-303F",      # CJK Symbols and Punctuation
    "U+3040-309F",      # Hiragana
    "U+30A0-30FF",      # Katakana
    "U+31F0-31FF",      # Katakana Phonetic Extensions
    "U+FF01-FF60",      # Fullwidth Forms
    "U+FF65-FF9F",      # Halfwidth Katakana
    "U+FFE0-FFE6",      # Fullwidth cent, pound, etc.
])

# --- EN サブセット用 Unicode 範囲 ---
EN_UNICODE_RANGES = ",".join([
    "U+0020-007E",      # Basic Latin
    "U+00A0-00FF",      # Latin-1 Supplement
    "U+0100-017F",      # Latin Extended-A
    "U+2013-2014",      # En/Em dashes
    "U+2018-201F",      # Smart quotes
    "U+2026",           # Ellipsis
    "U+20AC",           # Euro sign
    "U+00A5",           # Yen sign
])


def extract_jp_chars_from_app():
    """アプリ内の日本語テキストから漢字を抽出"""
    chars = set()

    # ja.json
    ja_path = os.path.join(PROJECT_ROOT, "src", "lib", "i18n", "ja.json")
    if os.path.exists(ja_path):
        with open(ja_path, "r", encoding="utf-8") as f:
            text = f.read()
            # CJK Unified Ideographs (漢字) を抽出
            chars.update(c for c in text if "\u4e00" <= c <= "\u9fff")

    # Svelte ファイルから日本語テキストを抽出
    svelte_dirs = [
        os.path.join(PROJECT_ROOT, "src", "routes", "privacy"),
        os.path.join(PROJECT_ROOT, "src", "routes", "about-ffmpeg"),
    ]
    for d in svelte_dirs:
        if not os.path.isdir(d):
            continue
        for fname in os.listdir(d):
            if fname.endswith(".svelte"):
                fpath = os.path.join(d, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    text = f.read()
                    chars.update(c for c in text if "\u4e00" <= c <= "\u9fff")

    return chars


def load_joyo_kanji():
    """jp-chars.txt から常用漢字リストを読み込み"""
    path = os.path.join(SCRIPT_DIR, "jp-chars.txt")
    if not os.path.exists(path):
        print(f"ERROR: {path} が見つかりません", file=sys.stderr)
        sys.exit(1)
    with open(path, "r", encoding="utf-8") as f:
        text = f.read()
    return set(c for c in text if "\u4e00" <= c <= "\u9fff")


def write_text_file(chars, path):
    """サブセット用テキストファイルを書き出し"""
    with open(path, "w", encoding="utf-8") as f:
        f.write("".join(sorted(chars)))


def subset_font(input_path, output_path, unicodes, text_file=None):
    """pyftsubset でフォントをサブセット化"""
    cmd = [
        "pyftsubset",
        input_path,
        f"--output-file={output_path}",
        "--flavor=woff2",
        "--layout-features=*",
        "--desubroutinize",
        "--no-hinting",
        f"--unicodes={unicodes}",
    ]
    if text_file:
        cmd.append(f"--text-file={text_file}")

    print(f"  Subsetting: {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
    subprocess.run(cmd, check=True)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Output: {size_kb:.1f} KB")


def main():
    # 1. 漢字セットの準備
    print("=== 漢字セットの準備 ===")
    joyo = load_joyo_kanji()
    app_chars = extract_jp_chars_from_app()
    extra = app_chars - joyo
    if extra:
        print(f"  常用漢字外の文字 ({len(extra)} 字): {''.join(sorted(extra))}")
    all_kanji = joyo | app_chars
    print(f"  常用漢字: {len(joyo)} 字")
    print(f"  アプリ固有: {len(app_chars)} 字")
    print(f"  合計漢字: {len(all_kanji)} 字")

    # 漢字をテキストファイルに書き出し（pyftsubset --text-file 用）
    kanji_text_path = os.path.join(SCRIPT_DIR, "_kanji_subset.txt")
    write_text_file(all_kanji, kanji_text_path)

    # 2. 出力ディレクトリ作成
    jp_out = os.path.join(OUT_DIR, "noto-sans-jp")
    en_out = os.path.join(OUT_DIR, "inter")
    os.makedirs(jp_out, exist_ok=True)
    os.makedirs(en_out, exist_ok=True)

    # 3. Noto Sans JP サブセット
    print("\n=== Noto Sans JP ===")
    for weight in WEIGHTS:
        src = os.path.join(SRC_DIR, f"NotoSansJP-{weight}.ttf")
        if not os.path.exists(src):
            print(f"  SKIP: {src} が見つかりません", file=sys.stderr)
            continue
        out = os.path.join(jp_out, f"NotoSansJP-{weight}.woff2")
        subset_font(src, out, JP_UNICODE_RANGES, text_file=kanji_text_path)

    # 4. Inter サブセット
    print("\n=== Inter ===")
    for weight in WEIGHTS:
        src = os.path.join(SRC_DIR, f"Inter-{weight}.ttf")
        if not os.path.exists(src):
            print(f"  SKIP: {src} が見つかりません", file=sys.stderr)
            continue
        out = os.path.join(en_out, f"Inter-{weight}.woff2")
        subset_font(src, out, EN_UNICODE_RANGES)

    # 5. クリーンアップ
    os.remove(kanji_text_path)

    print("\n=== 完了 ===")
    print("static/fonts/ に woff2 ファイルが生成されました。")


if __name__ == "__main__":
    main()
