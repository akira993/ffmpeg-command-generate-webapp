#!/usr/bin/env python3
"""
quick_validate.py — スキル定義の構文クイックチェック

使い方:
    python3 skill-creator-max/scripts/quick_validate.py .claude/skills/run-tests.md
    python3 skill-creator-max/scripts/quick_validate.py .claude/skills/  # ディレクトリ全体

チェック項目:
    - ファイル存在・読み込み可否
    - Markdownヘッダー構造 (# title が存在するか)
    - 必須セクション (## 手順) の有無
    - 空ファイル・極端に短いファイルの検出
    - コードブロックの閉じ忘れ
"""

from __future__ import annotations

import sys
import re
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class ValidationResult:
    """バリデーション結果"""
    file_path: str
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    info: list[str] = field(default_factory=list)

    @property
    def passed(self) -> bool:
        return len(self.errors) == 0

    def summary_icon(self) -> str:
        if self.errors:
            return "❌"
        if self.warnings:
            return "⚠️"
        return "✅"


def validate_skill_file(file_path: Path) -> ValidationResult:
    """単一スキルファイルのクイックバリデーション"""
    result = ValidationResult(file_path=str(file_path))

    # 1. ファイル存在チェック
    if not file_path.exists():
        result.errors.append(f"ファイルが存在しません: {file_path}")
        return result

    if not file_path.is_file():
        result.errors.append(f"ファイルではありません: {file_path}")
        return result

    # 2. 読み込み
    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        result.errors.append(f"読み込みエラー: {e}")
        return result

    lines = content.split("\n")

    # 3. 空ファイルチェック
    stripped = content.strip()
    if not stripped:
        result.errors.append("ファイルが空です")
        return result

    if len(stripped) < 20:
        result.warnings.append(f"ファイルが極端に短いです ({len(stripped)} 文字)")

    # 4. タイトル（H1）チェック
    h1_pattern = re.compile(r"^#\s+\S")
    has_h1 = any(h1_pattern.match(line) for line in lines)
    if not has_h1:
        result.errors.append("H1 タイトル (# title) がありません")
    else:
        h1_line = next(line for line in lines if h1_pattern.match(line))
        title = h1_line.lstrip("#").strip()
        result.info.append(f"タイトル: {title}")

    # 5. 必須セクションチェック
    h2_pattern = re.compile(r"^##\s+(.+)")
    h2_sections = [h2_pattern.match(line).group(1).strip() for line in lines if h2_pattern.match(line)]
    result.info.append(f"セクション: {', '.join(h2_sections) if h2_sections else '(なし)'}")

    # 「手順」セクションの有無
    step_keywords = ["手順", "steps", "procedure", "手順"]
    has_steps = any(
        any(kw in section.lower() for kw in step_keywords)
        for section in h2_sections
    )
    if not has_steps:
        result.warnings.append("「## 手順」セクションがありません（推奨）")

    # 6. コードブロックの閉じ忘れ
    code_fence_count = content.count("```")
    if code_fence_count % 2 != 0:
        result.errors.append(
            f"コードブロック (```) が閉じていません（{code_fence_count} 個検出）"
        )

    # 7. 番号付きリストの存在（手順があることの証）
    numbered_list = re.compile(r"^\d+\.\s")
    has_numbered = any(numbered_list.match(line) for line in lines)
    if not has_numbered:
        result.warnings.append("番号付きリストがありません（手順の記述を推奨）")

    # 8. ファイル名と H1 の整合性
    stem = file_path.stem
    if has_h1:
        h1_text = next(
            line.lstrip("#").strip() for line in lines if h1_pattern.match(line)
        )
        if stem.lower().replace("-", "") != h1_text.lower().replace("-", "").replace(" ", ""):
            result.info.append(
                f"ファイル名 ({stem}) と H1 ({h1_text}) が異なります"
            )

    # 9. 行数統計
    non_empty_lines = [line for line in lines if line.strip()]
    result.info.append(f"行数: {len(lines)} (非空行: {len(non_empty_lines)})")

    return result


def validate_directory(dir_path: Path) -> list[ValidationResult]:
    """ディレクトリ内の全スキルファイルを検証"""
    results = []
    md_files = sorted(dir_path.glob("*.md"))

    if not md_files:
        result = ValidationResult(file_path=str(dir_path))
        result.warnings.append("Markdown ファイルが見つかりません")
        results.append(result)
        return results

    for md_file in md_files:
        results.append(validate_skill_file(md_file))

    return results


def print_results(results: list[ValidationResult]) -> bool:
    """結果を出力し、全体の合否を返す"""
    all_passed = True

    print("\n" + "=" * 60)
    print("  skill-creator-max: Quick Validate")
    print("=" * 60)

    for result in results:
        icon = result.summary_icon()
        print(f"\n{icon} {result.file_path}")

        if result.info:
            for msg in result.info:
                print(f"   ℹ️  {msg}")

        if result.errors:
            all_passed = False
            for msg in result.errors:
                print(f"   ❌ ERROR: {msg}")

        if result.warnings:
            for msg in result.warnings:
                print(f"   ⚠️  WARN: {msg}")

        if not result.errors and not result.warnings:
            print("   すべてのチェックに合格")

    # サマリー
    total = len(results)
    passed = sum(1 for r in results if r.passed)
    warned = sum(1 for r in results if r.passed and r.warnings)

    print("\n" + "-" * 60)
    print(f"結果: {passed}/{total} 合格", end="")
    if warned:
        print(f" ({warned} 件警告あり)", end="")
    print()

    if all_passed:
        print("✅ すべてのスキルがクイックチェックに合格しました")
    else:
        print("❌ エラーのあるスキルがあります。修正してください。")

    print()
    return all_passed


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 quick_validate.py <skill_file_or_directory>")
        print()
        print("Examples:")
        print("  python3 quick_validate.py .claude/skills/run-tests.md")
        print("  python3 quick_validate.py .claude/skills/")
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_dir():
        results = validate_directory(target)
    elif target.is_file():
        results = [validate_skill_file(target)]
    else:
        print(f"❌ パスが存在しません: {target}")
        sys.exit(1)

    all_passed = print_results(results)
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
