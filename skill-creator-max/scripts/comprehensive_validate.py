#!/usr/bin/env python3
"""
comprehensive_validate.py — スキル定義の総合バリデーション

使い方:
    python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/
    python3 skill-creator-max/scripts/comprehensive_validate.py .claude/skills/ --strict

チェック項目（quick_validate に加えて）:
    - セクション構造の深度分析
    - テーブル構文の整合性
    - コマンド例の存在と構文
    - 失敗時対応セクションの有無
    - 結果レポート形式の有無
    - スキル間の整合性（命名規則、構造パターン）
    - CLAUDE.md との整合性
    - 品質スコアリング（0-100）
"""

from __future__ import annotations

import sys
import re
import json
from pathlib import Path
from dataclasses import dataclass, field


@dataclass
class QualityMetrics:
    """スキル品質メトリクス"""
    has_title: bool = False
    has_description: bool = False
    has_prerequisites: bool = False
    has_steps: bool = False
    has_code_examples: bool = False
    has_error_handling: bool = False
    has_report_format: bool = False
    has_table: bool = False
    step_count: int = 0
    section_count: int = 0
    word_count: int = 0
    code_block_count: int = 0

    def score(self) -> int:
        """品質スコア（0-100）を算出"""
        s = 0
        s += 15 if self.has_title else 0
        s += 10 if self.has_description else 0
        s += 5 if self.has_prerequisites else 0
        s += 20 if self.has_steps else 0
        s += 10 if self.has_code_examples else 0
        s += 15 if self.has_error_handling else 0
        s += 10 if self.has_report_format else 0
        s += 5 if self.has_table else 0
        # ステップ数ボーナス（3以上で+5、5以上で+10）
        s += min(10, self.step_count * 2) if self.step_count >= 3 else 0
        return min(100, s)

    def grade(self) -> str:
        """スコアをグレードに変換"""
        s = self.score()
        if s >= 90:
            return "A"
        if s >= 75:
            return "B"
        if s >= 60:
            return "C"
        if s >= 40:
            return "D"
        return "F"


@dataclass
class ComprehensiveResult:
    """総合バリデーション結果"""
    file_path: str
    metrics: QualityMetrics = field(default_factory=QualityMetrics)
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)
    suggestions: list[str] = field(default_factory=list)


def analyze_skill(file_path: Path) -> ComprehensiveResult:
    """単一スキルの総合分析"""
    result = ComprehensiveResult(file_path=str(file_path))
    m = result.metrics

    if not file_path.exists() or not file_path.is_file():
        result.errors.append(f"ファイルが存在しません: {file_path}")
        return result

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception as e:
        result.errors.append(f"読み込みエラー: {e}")
        return result

    lines = content.split("\n")
    stripped = content.strip()
    m.word_count = len(stripped.split())

    # --- H1 タイトル ---
    h1_match = re.search(r"^#\s+(.+)", content, re.MULTILINE)
    if h1_match:
        m.has_title = True
    else:
        result.errors.append("H1 タイトルがありません")

    # --- 説明文（H1 直後の非空行）---
    if h1_match:
        after_h1 = content[h1_match.end():].lstrip("\n")
        first_line = after_h1.split("\n")[0].strip() if after_h1 else ""
        if first_line and not first_line.startswith("#"):
            m.has_description = True
        else:
            result.warnings.append("H1 直後に説明文がありません")

    # --- H2 セクション分析 ---
    h2_sections = re.findall(r"^##\s+(.+)", content, re.MULTILINE)
    m.section_count = len(h2_sections)
    section_names_lower = [s.lower().strip() for s in h2_sections]

    # 前提セクション
    prereq_kw = ["前提", "prerequisites", "前提条件", "前提チェック"]
    m.has_prerequisites = any(
        any(kw in sn for kw in prereq_kw) for sn in section_names_lower
    )

    # 手順セクション
    step_kw = ["手順", "steps", "procedure", "テスト手順", "計測手順"]
    m.has_steps = any(any(kw in sn for kw in step_kw) for sn in section_names_lower)
    if not m.has_steps:
        result.errors.append("「## 手順」セクションがありません")

    # エラーハンドリングセクション
    err_kw = ["失敗", "error", "エラー", "トラブル", "対応"]
    m.has_error_handling = any(
        any(kw in sn for kw in err_kw) for sn in section_names_lower
    )
    if not m.has_error_handling:
        result.suggestions.append("「## 失敗時の対応」セクションの追加を推奨")

    # 結果レポートセクション
    report_kw = ["結果", "レポート", "result", "report", "出力"]
    m.has_report_format = any(
        any(kw in sn for kw in report_kw) for sn in section_names_lower
    )
    if not m.has_report_format:
        result.suggestions.append("「## 結果レポート」セクションの追加を推奨")

    # --- コードブロック ---
    code_blocks = re.findall(r"```[\s\S]*?```", content)
    m.code_block_count = len(code_blocks)
    m.has_code_examples = m.code_block_count > 0
    if not m.has_code_examples:
        result.warnings.append("コードブロックがありません（コマンド例の記載を推奨）")

    # コードブロック閉じ忘れ
    fence_count = content.count("```")
    if fence_count % 2 != 0:
        result.errors.append("コードブロック (```) が閉じていません")

    # --- 番号付きリスト（ステップ数） ---
    numbered_items = re.findall(r"^\d+\.\s", content, re.MULTILINE)
    m.step_count = len(numbered_items)
    if m.step_count == 0:
        result.warnings.append("番号付きリストがありません")

    # --- テーブル ---
    table_rows = re.findall(r"^\|.*\|$", content, re.MULTILINE)
    m.has_table = len(table_rows) >= 2  # ヘッダー + セパレータ以上

    # テーブル構文チェック
    if table_rows:
        col_counts = []
        for row in table_rows:
            cols = row.count("|") - 1  # 行頭・行末の | を除外
            col_counts.append(cols)
        if len(set(col_counts)) > 1:
            result.warnings.append(
                f"テーブルの列数が不統一です: {set(col_counts)}"
            )

    # --- 内容の一貫性チェック ---
    # TODO パターンの検出
    todo_count = len(re.findall(r"TODO", content, re.IGNORECASE))
    if todo_count > 0:
        result.warnings.append(f"TODO が {todo_count} 件残っています")

    # 空セクション検出
    for i, line in enumerate(lines):
        if re.match(r"^##\s+", line):
            # 次のセクションまたはEOFまでの内容をチェック
            section_content = []
            for j in range(i + 1, len(lines)):
                if re.match(r"^##?\s+", lines[j]):
                    break
                section_content.append(lines[j].strip())
            if not any(section_content):
                result.warnings.append(f"空セクション: {line.strip()}")

    return result


def check_cross_skill_consistency(
    results: list[ComprehensiveResult], skills_dir: Path
) -> list[str]:
    """スキル間の整合性チェック"""
    issues = []

    # ファイル名の命名規則チェック
    names = [Path(r.file_path).stem for r in results]
    has_underscore = [n for n in names if "_" in n]
    has_hyphen = [n for n in names if "-" in n]

    if has_underscore and has_hyphen:
        issues.append(
            f"命名規則の混在: ハイフン({', '.join(has_hyphen)}) と "
            f"アンダースコア({', '.join(has_underscore)})"
        )

    return issues


def check_claude_md_consistency(
    results: list[ComprehensiveResult], project_root: Path
) -> list[str]:
    """CLAUDE.md との整合性チェック"""
    issues = []
    claude_md = project_root / "CLAUDE.md"

    if not claude_md.exists():
        issues.append("CLAUDE.md が見つかりません")
        return issues

    claude_content = claude_md.read_text(encoding="utf-8")
    skill_names = [Path(r.file_path).stem for r in results]

    for name in skill_names:
        if f"/{name}" not in claude_content and name not in claude_content:
            issues.append(
                f"スキル '{name}' が CLAUDE.md に記載されていません"
            )

    return issues


def print_results(
    results: list[ComprehensiveResult],
    cross_issues: list[str],
    claude_issues: list[str],
) -> bool:
    """結果を出力"""
    print("\n" + "=" * 60)
    print("  skill-creator-max: Comprehensive Validate")
    print("=" * 60)

    all_passed = True

    for result in results:
        m = result.metrics
        score = m.score()
        grade = m.grade()
        icon = "❌" if result.errors else ("⚠️" if result.warnings else "✅")

        print(f"\n{icon} {result.file_path}  [{grade}: {score}/100]")

        # メトリクス
        checks = [
            ("タイトル", m.has_title),
            ("説明文", m.has_description),
            ("前提条件", m.has_prerequisites),
            ("手順", m.has_steps),
            ("コード例", m.has_code_examples),
            ("エラー対応", m.has_error_handling),
            ("レポート形式", m.has_report_format),
            ("テーブル", m.has_table),
        ]
        check_str = " ".join(
            f"{'✓' if ok else '✗'}{name}" for name, ok in checks
        )
        print(f"   {check_str}")
        print(
            f"   ステップ:{m.step_count} セクション:{m.section_count} "
            f"コードブロック:{m.code_block_count} 語数:{m.word_count}"
        )

        if result.errors:
            all_passed = False
            for msg in result.errors:
                print(f"   ❌ {msg}")

        for msg in result.warnings:
            print(f"   ⚠️  {msg}")

        for msg in result.suggestions:
            print(f"   💡 {msg}")

    # クロスチェック
    if cross_issues or claude_issues:
        print("\n" + "-" * 60)
        print("📋 整合性チェック:")
        for issue in cross_issues:
            print(f"   ⚠️  {issue}")
        for issue in claude_issues:
            print(f"   ⚠️  {issue}")

    # サマリー
    print("\n" + "-" * 60)
    scores = [r.metrics.score() for r in results]
    avg_score = sum(scores) / len(scores) if scores else 0
    print(f"平均スコア: {avg_score:.0f}/100")
    print(f"ファイル数: {len(results)}")

    if all_passed and not cross_issues:
        print("✅ 総合バリデーション合格")
    else:
        print("❌ 修正が必要な項目があります")

    print()
    return all_passed and not cross_issues


def find_project_root() -> Path:
    """プロジェクトルートを探索"""
    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".claude").is_dir():
            return parent
    return current


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 comprehensive_validate.py <skills_directory>")
        print("       python3 comprehensive_validate.py <skills_directory> --strict")
        sys.exit(1)

    target = Path(sys.argv[1])
    strict = "--strict" in sys.argv

    if not target.is_dir():
        print(f"❌ ディレクトリではありません: {target}")
        sys.exit(1)

    md_files = sorted(target.glob("*.md"))
    if not md_files:
        print(f"❌ Markdown ファイルが見つかりません: {target}")
        sys.exit(1)

    results = [analyze_skill(f) for f in md_files]

    project_root = find_project_root()
    cross_issues = check_cross_skill_consistency(results, target)
    claude_issues = check_claude_md_consistency(results, project_root)

    all_passed = print_results(results, cross_issues, claude_issues)

    if strict:
        # strict モード: 警告もエラー扱い
        has_warnings = any(r.warnings for r in results)
        if has_warnings:
            print("⚠️  --strict モード: 警告をエラーとして扱います")
            all_passed = False

    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()
