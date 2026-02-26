#!/usr/bin/env python3
"""
analyze_skill.py — 既存スキルの分析・統計・改善レポート

使い方:
    python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/
    python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/ --json
    python3 skill-creator-max/scripts/analyze_skill.py .claude/skills/ --suggest

分析内容:
    - 各スキルの構造統計（セクション数、ステップ数、コードブロック数、行数）
    - カテゴリ分類
    - 品質スコア
    - スキル間のパターン比較
    - 改善提案（--suggest フラグ）
"""

from __future__ import annotations

import sys
import re
import json
from pathlib import Path
from dataclasses import dataclass, field, asdict


@dataclass
class SkillAnalysis:
    """スキル分析結果"""
    name: str
    file_path: str
    category: str = "unknown"
    title: str = ""
    description: str = ""
    line_count: int = 0
    word_count: int = 0
    section_count: int = 0
    step_count: int = 0
    code_block_count: int = 0
    table_count: int = 0
    link_count: int = 0
    has_prerequisites: bool = False
    has_error_handling: bool = False
    has_report_format: bool = False
    sections: list[str] = field(default_factory=list)
    commands_referenced: list[str] = field(default_factory=list)
    tools_used: list[str] = field(default_factory=list)
    quality_score: int = 0
    suggestions: list[str] = field(default_factory=list)


# カテゴリ分類のヒューリスティクス
CATEGORY_KEYWORDS = {
    "test": [
        "テスト", "test", "check", "チェック", "lint", "validate",
        "検証", "計測", "perf", "performance", "a11y",
    ],
    "deploy": [
        "デプロイ", "deploy", "build", "ビルド", "push", "CI",
        "release", "publish", "ship",
    ],
    "codegen": [
        "生成", "generate", "create", "変換", "convert",
        "migrate", "リファクタ", "refactor",
    ],
    "docs": [
        "ドキュメント", "document", "README", "changelog",
        "docs", "記述",
    ],
}

# ツール検出パターン
TOOL_PATTERNS = {
    "Bash": [r"\bnpm\b", r"\bbash\b", r"\bgit\b", r"\bgh\b"],
    "Chrome MCP": [
        r"Chrome MCP", r"resize_window", r"navigate",
        r"screenshot", r"javascript_tool",
    ],
    "Read": [r"\bRead\b.*ファイル", r"ファイルを\s*Read"],
    "Grep": [r"\bGrep\b", r"検索"],
    "Vitest": [r"\bVitest\b", r"\bvitest\b", r"npm run test"],
    "TypeScript": [r"npm run check", r"型チェック", r"TypeScript"],
}


def classify_category(content: str, name: str) -> str:
    """コンテンツからカテゴリを推定"""
    scores = {}
    combined = f"{name} {content}".lower()

    for cat, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for kw in keywords if kw.lower() in combined)
        scores[cat] = score

    if max(scores.values()) == 0:
        return "general"
    return max(scores, key=scores.get)


def detect_tools(content: str) -> list[str]:
    """使用ツールを検出"""
    tools = []
    for tool, patterns in TOOL_PATTERNS.items():
        for pattern in patterns:
            if re.search(pattern, content, re.IGNORECASE):
                tools.append(tool)
                break
    return tools


def analyze_file(file_path: Path) -> SkillAnalysis:
    """スキルファイルを分析"""
    name = file_path.stem
    analysis = SkillAnalysis(name=name, file_path=str(file_path))

    try:
        content = file_path.read_text(encoding="utf-8")
    except Exception:
        return analysis

    lines = content.split("\n")
    analysis.line_count = len(lines)
    analysis.word_count = len(content.split())

    # タイトル
    h1_match = re.search(r"^#\s+(.+)", content, re.MULTILINE)
    if h1_match:
        analysis.title = h1_match.group(1).strip()

    # 説明文
    if h1_match:
        after = content[h1_match.end():].lstrip("\n")
        first = after.split("\n")[0].strip() if after else ""
        if first and not first.startswith("#"):
            analysis.description = first

    # セクション
    h2_sections = re.findall(r"^##\s+(.+)", content, re.MULTILINE)
    analysis.sections = [s.strip() for s in h2_sections]
    analysis.section_count = len(h2_sections)

    # ステップ数
    analysis.step_count = len(re.findall(r"^\d+\.\s", content, re.MULTILINE))

    # コードブロック
    analysis.code_block_count = len(re.findall(r"```[\s\S]*?```", content))

    # テーブル
    table_rows = re.findall(r"^\|.*\|$", content, re.MULTILINE)
    # テーブル数 = セパレータ行 (|---|) の数
    separators = [r for r in table_rows if re.match(r"^\|[\s\-:|]+\|$", r)]
    analysis.table_count = len(separators)

    # リンク
    analysis.link_count = len(re.findall(r"\[.*?\]\(.*?\)", content))

    # カテゴリ
    analysis.category = classify_category(content, name)

    # セクション分析
    section_lower = [s.lower() for s in analysis.sections]
    analysis.has_prerequisites = any(
        "前提" in s or "prerequisite" in s for s in section_lower
    )
    analysis.has_error_handling = any(
        "失敗" in s or "error" in s or "対応" in s for s in section_lower
    )
    analysis.has_report_format = any(
        "結果" in s or "レポート" in s or "report" in s for s in section_lower
    )

    # ツール検出
    analysis.tools_used = detect_tools(content)

    # コマンド参照
    cmd_refs = re.findall(r"`/(\w[\w-]+)`", content)
    analysis.commands_referenced = list(set(cmd_refs))

    # 品質スコア
    score = 0
    score += 15 if analysis.title else 0
    score += 10 if analysis.description else 0
    score += 5 if analysis.has_prerequisites else 0
    score += 20 if analysis.step_count > 0 else 0
    score += 10 if analysis.code_block_count > 0 else 0
    score += 15 if analysis.has_error_handling else 0
    score += 10 if analysis.has_report_format else 0
    score += 5 if analysis.table_count > 0 else 0
    score += min(10, analysis.step_count * 2)
    analysis.quality_score = min(100, score)

    return analysis


def generate_suggestions(analysis: SkillAnalysis) -> list[str]:
    """改善提案を生成"""
    suggestions = []

    if not analysis.description:
        suggestions.append("H1 直後に1行の説明文を追加する")

    if not analysis.has_prerequisites:
        suggestions.append("「## 前提」セクションを追加し、実行条件を明記する")

    if analysis.step_count == 0:
        suggestions.append("番号付きリストで手順を明確にする")
    elif analysis.step_count < 3:
        suggestions.append(
            f"手順が {analysis.step_count} ステップしかありません。"
            "より詳細な手順に分割を検討"
        )

    if analysis.code_block_count == 0:
        suggestions.append("コマンド例やコードブロックを追加する")

    if not analysis.has_error_handling:
        suggestions.append(
            "「## 失敗時の対応」セクションを追加し、"
            "エラーパターンと対処法を記載する"
        )

    if not analysis.has_report_format:
        suggestions.append(
            "「## 結果レポート」セクションを追加し、"
            "出力フォーマットを定義する"
        )

    if analysis.table_count == 0 and analysis.has_error_handling:
        suggestions.append(
            "失敗パターンをテーブル形式で整理するとわかりやすい"
        )

    if analysis.line_count < 15:
        suggestions.append(
            f"スキル定義が短い ({analysis.line_count} 行)。"
            "より詳細な手順・説明の追加を検討"
        )

    return suggestions


def print_analysis(analyses: list[SkillAnalysis], show_suggestions: bool):
    """分析結果を出力"""
    print("\n" + "=" * 70)
    print("  skill-creator-max: Skill Analysis Report")
    print("=" * 70)

    # カテゴリ別グルーピング
    by_category = {}
    for a in analyses:
        by_category.setdefault(a.category, []).append(a)

    for cat, skills in sorted(by_category.items()):
        cat_labels = {
            "test": "テスト・検証",
            "deploy": "ビルド・デプロイ",
            "codegen": "コード生成・変換",
            "docs": "ドキュメント",
            "general": "汎用",
            "unknown": "未分類",
        }
        print(f"\n📂 {cat_labels.get(cat, cat)} ({len(skills)} 件)")
        print("-" * 50)

        for a in skills:
            grade_map = {
                range(90, 101): "A",
                range(75, 90): "B",
                range(60, 75): "C",
                range(40, 60): "D",
                range(0, 40): "F",
            }
            grade = "F"
            for r, g in grade_map.items():
                if a.quality_score in r:
                    grade = g
                    break

            print(f"\n  📝 {a.name} [{grade}: {a.quality_score}/100]")
            print(f"     {a.description or '(説明なし)'}")
            print(
                f"     行:{a.line_count} セクション:{a.section_count} "
                f"ステップ:{a.step_count} コードブロック:{a.code_block_count} "
                f"テーブル:{a.table_count}"
            )
            if a.tools_used:
                print(f"     ツール: {', '.join(a.tools_used)}")
            if a.commands_referenced:
                print(f"     参照: {', '.join('/' + c for c in a.commands_referenced)}")

            if show_suggestions:
                suggestions = generate_suggestions(a)
                if suggestions:
                    for s in suggestions:
                        print(f"     💡 {s}")

    # 全体統計
    print("\n" + "=" * 70)
    print("📊 全体統計")
    print("-" * 50)

    total = len(analyses)
    avg_score = sum(a.quality_score for a in analyses) / total if total else 0
    avg_steps = sum(a.step_count for a in analyses) / total if total else 0
    avg_lines = sum(a.line_count for a in analyses) / total if total else 0
    total_code_blocks = sum(a.code_block_count for a in analyses)

    print(f"  スキル数:           {total}")
    print(f"  平均品質スコア:     {avg_score:.1f}/100")
    print(f"  平均ステップ数:     {avg_steps:.1f}")
    print(f"  平均行数:           {avg_lines:.1f}")
    print(f"  コードブロック合計: {total_code_blocks}")

    # カテゴリ分布
    print(f"\n  カテゴリ分布:")
    for cat, skills in sorted(by_category.items()):
        bar = "█" * len(skills) + "░" * (total - len(skills))
        print(f"    {cat:>10}: {bar} ({len(skills)})")

    # 品質分布
    grades = {"A": 0, "B": 0, "C": 0, "D": 0, "F": 0}
    for a in analyses:
        s = a.quality_score
        if s >= 90:
            grades["A"] += 1
        elif s >= 75:
            grades["B"] += 1
        elif s >= 60:
            grades["C"] += 1
        elif s >= 40:
            grades["D"] += 1
        else:
            grades["F"] += 1

    print(f"\n  品質分布:")
    for grade, count in grades.items():
        bar = "█" * count + "░" * (total - count)
        print(f"    {grade}: {bar} ({count})")

    print()


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_skill.py <skills_directory>")
        print("       python3 analyze_skill.py <skills_directory> --json")
        print("       python3 analyze_skill.py <skills_directory> --suggest")
        sys.exit(1)

    target = Path(sys.argv[1])
    output_json = "--json" in sys.argv
    show_suggestions = "--suggest" in sys.argv

    if not target.is_dir():
        print(f"❌ ディレクトリではありません: {target}")
        sys.exit(1)

    md_files = sorted(target.glob("*.md"))
    if not md_files:
        print(f"❌ Markdown ファイルが見つかりません: {target}")
        sys.exit(1)

    analyses = [analyze_file(f) for f in md_files]

    if output_json:
        output = []
        for a in analyses:
            d = asdict(a)
            d["suggestions"] = generate_suggestions(a)
            output.append(d)
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print_analysis(analyses, show_suggestions)


if __name__ == "__main__":
    main()
