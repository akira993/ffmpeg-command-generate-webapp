#!/usr/bin/env python3
"""
Noto Sans JP / Inter サブセット化スクリプト

使い方:
  1. pip install fonttools brotli
  2. scripts/font-sources/ にソースフォント (.ttf) を配置:
     - NotoSansJP-Regular.ttf, NotoSansJP-Bold.ttf
       (Google Fonts GitHub から静的ウェイト版をダウンロード)
     - Inter-Regular.ttf, Inter-Bold.ttf
       (Variable TTF をダウンロード後、fonttools varLib.instancer で
        wght=400 / wght=700 の静的インスタンスを生成)
  3. python scripts/subset-fonts.py

Google Fonts GitHub からダウンロード:
  JP: https://github.com/google/fonts/tree/main/ofl/notosansjp
  EN: https://github.com/google/fonts/tree/main/ofl/inter

最適化方針:
  - Inter: 静的ウェイト + Latin 文字セットのみ
  - 両方: 不要テーブル (gasp, STAT, vhea, vmtx) を削除して軽量化

Noto Sans JP の各ウェイトを基本と追加に分ける。基本には ASCII の全範囲と、ja.json および about-ffmpeg・privacy 以外の Svelte ファイルで使う漢字、かな、記号を含める。追加には基本に含まれないかなと記号、および about-ffmpeg と privacy だけで使う漢字を含める。

翻訳やページを追加したら、このスクリプトを再実行し、表示された unicode-range を src/app.css の Noto Sans JP の各定義に反映する。--check を指定すると、ファイルに書き込まず CSS の値を照合する。--output-dir で出力先を指定できる。
"""

import argparse
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
EXTENDED_ROUTES = {"about-ffmpeg", "privacy"}
ASCII_RANGE = "U+0020-007E"

# --- JP サブセット用 Unicode 範囲 ---
JP_UNICODE_RANGES = ",".join([
    ASCII_RANGE,       # Basic Latin (ASCII)
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

# 出力後に削除する不要テーブル
TABLES_TO_DROP = ["gasp", "STAT", "vhea", "vmtx"]


def extract_jp_chars_from_app():
    """アプリ内のテキストを基本と追加のページから集める"""
    base_chars = set()
    extended_chars = set()
    src_dir = os.path.join(PROJECT_ROOT, "src")
    routes_dir = os.path.join(src_dir, "routes")

    # ja.json
    ja_path = os.path.join(PROJECT_ROOT, "src", "lib", "i18n", "ja.json")
    if os.path.exists(ja_path):
        with open(ja_path, "r", encoding="utf-8") as f:
            base_chars.update(f.read())

    # Svelte ファイルから日本語テキストを抽出
    for directory, _, filenames in os.walk(src_dir):
        route = os.path.relpath(directory, routes_dir).split(os.sep, 1)[0]
        chars = extended_chars if route in EXTENDED_ROUTES else base_chars
        for fname in filenames:
            if fname.endswith(".svelte"):
                fpath = os.path.join(directory, fname)
                with open(fpath, "r", encoding="utf-8") as f:
                    text = f.read()
                    text = re.sub(r"<!--.*?-->|/\*.*?\*/|(?<!\S)//[^\r\n]*", "", text, flags=re.DOTALL)
                    chars.update(text)

    return base_chars, extended_chars


def expand_ranges(ranges):
    chars = set()
    for value in ranges.split(","):
        start, _, end = value.removeprefix("U+").partition("-")
        chars.update(chr(point) for point in range(int(start, 16), int(end or start, 16) + 1))
    return chars


def unicode_ranges(chars):
    spans = []
    for point in sorted(map(ord, chars)):
        if spans and point == spans[-1][1] + 1:
            spans[-1][1] = point
        else:
            spans.append([point, point])
    return ",".join(
        f"U+{start:04X}" if start == end else f"U+{start:04X}-{end:04X}"
        for start, end in spans
    )


def subset_font(input_path, output_path, unicodes):
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

    # 不要テーブルを削除
    for table in TABLES_TO_DROP:
        cmd.append(f"--drop-tables+={table}")

    print(f"  Subsetting: {os.path.basename(input_path)} -> {os.path.basename(output_path)}")
    subprocess.run(cmd, check=True)

    size_kb = os.path.getsize(output_path) / 1024
    print(f"  Output: {size_kb:.1f} KB")


def check_css(ranges_by_font):
    css_path = os.path.join(PROJECT_ROOT, "src", "app.css")
    with open(css_path, encoding="utf-8") as f:
        faces = re.findall(r"@font-face\s*\{([^}]+)\}", f.read())

    valid = True
    for name, expected in ranges_by_font.items():
        url = f"/fonts/noto-sans-jp/{name}.woff2"
        matching_faces = [face for face in faces if url in face]
        actual_ranges = [
            re.sub(r"\s+", "", value).upper()
            for face in matching_faces
            for value in re.findall(r"\bunicode-range\s*:\s*([^;]+);", face)
        ]
        if len(matching_faces) != 1 or actual_ranges != [expected]:
            print(f"src/app.css: {name}.woff2 の unicode-range が一致しません", file=sys.stderr)
            valid = False
    return valid


def main():
    parser = argparse.ArgumentParser(description="Noto Sans JP と Inter の woff2 を生成します")
    parser.add_argument("--output-dir", default=OUT_DIR, help="フォントの出力先")
    parser.add_argument("--check", action="store_true", help="生成せずに CSS の unicode-range を照合します")
    args = parser.parse_args()

    base_text, extended_text = extract_jp_chars_from_app()
    ascii_chars = expand_ranges(ASCII_RANGE)
    jp_chars = expand_ranges(JP_UNICODE_RANGES)
    base_kanji = {char for char in base_text if "\u4e00" <= char <= "\u9fff"}
    extended_kanji = {char for char in extended_text - base_kanji if "\u4e00" <= char <= "\u9fff"}
    base_symbols = (jp_chars - ascii_chars) & base_text
    extended_symbols = jp_chars - ascii_chars - base_symbols

    base_ranges = unicode_ranges(ascii_chars | base_symbols | base_kanji)
    extended_ranges = unicode_ranges(extended_symbols | extended_kanji)
    print(f"基本: ASCII {len(ascii_chars)} 字、かな・記号 {len(base_symbols)} 字、漢字 {len(base_kanji)} 字")
    print(f"追加: ASCII 0 字、かな・記号 {len(extended_symbols)} 字、漢字 {len(extended_kanji)} 字")
    print(f"基本の unicode-range: {base_ranges}")
    print(f"追加の unicode-range: {extended_ranges}")

    jp_ranges = {
        f"NotoSansJP-{weight}{suffix}": ranges
        for weight in WEIGHTS
        for suffix, ranges in [("", base_ranges), ("-ext", extended_ranges)]
    }
    if args.check:
        if not check_css(jp_ranges):
            return 1
        print("src/app.css の unicode-range が一致しました。")
        return 0

    sources = {
        f"{family}-{weight}": os.path.join(SRC_DIR, f"{family}-{weight}.ttf")
        for family in ("NotoSansJP", "Inter")
        for weight in WEIGHTS
    }
    missing = [path for path in sources.values() if not os.path.isfile(path)]
    if missing:
        for path in missing:
            print(f"{path} が見つかりません", file=sys.stderr)
        return 1

    jp_out = os.path.join(args.output_dir, "noto-sans-jp")
    en_out = os.path.join(args.output_dir, "inter")
    os.makedirs(jp_out, exist_ok=True)
    os.makedirs(en_out, exist_ok=True)

    print("\n=== Noto Sans JP ===")
    for name, ranges in jp_ranges.items():
        subset_font(sources[name.removesuffix("-ext")], os.path.join(jp_out, f"{name}.woff2"), ranges)

    print("\n=== Inter ===")
    for weight in WEIGHTS:
        name = f"Inter-{weight}"
        subset_font(sources[name], os.path.join(en_out, f"{name}.woff2"), EN_UNICODE_RANGES)

    print(f"\n{args.output_dir} に woff2 を生成しました。")
    return 0


if __name__ == "__main__":
    sys.exit(main())
