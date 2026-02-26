#!/usr/bin/env python3
"""
init_skill.py — 対話式スキル雛形生成スクリプト

使い方:
    python3 skill-creator-max/scripts/init_skill.py
    python3 skill-creator-max/scripts/init_skill.py --name my-skill --category test
    python3 skill-creator-max/scripts/init_skill.py --template category1

既存の .claude/skills/ ディレクトリにスキル定義 Markdown を生成する。
"""

from __future__ import annotations

import argparse
import os
import sys
import re
from datetime import datetime
from pathlib import Path

# --- 定数 ---

SKILLS_DIR = ".claude/skills"
TEMPLATES_DIR = "skill-creator-max/templates"

CATEGORIES = {
    "test": {
        "label": "テスト・検証",
        "template": "category1_template.md",
        "description": "ユニットテスト、UIテスト、リント、パフォーマンス計測など",
        "examples": ["run-tests", "css-lint", "ui-test", "perf-test", "i18n-check"],
    },
    "deploy": {
        "label": "ビルド・デプロイ",
        "template": "category2_template.md",
        "description": "ビルド、CI/CD、デプロイ、環境構築など",
        "examples": ["deploy", "deploy-test"],
    },
    "codegen": {
        "label": "コード生成・変換",
        "template": "category3_template.md",
        "description": "コード生成、リファクタリング、マイグレーション、変換など",
        "examples": ["generate-component", "migrate-api"],
    },
    "general": {
        "label": "汎用",
        "template": "SKILL_template.md",
        "description": "上記カテゴリに該当しないスキル",
        "examples": [],
    },
}

# --- ヘルパー ---


def find_project_root() -> Path:
    """プロジェクトルート（.claude/ が存在するディレクトリ）を探索"""
    current = Path.cwd()
    for parent in [current, *current.parents]:
        if (parent / ".claude").is_dir():
            return parent
    # フォールバック: CWD
    return current


def slugify(name: str) -> str:
    """スキル名をファイル名に安全な形式に変換"""
    slug = re.sub(r"[^a-zA-Z0-9\-_]", "-", name.strip().lower())
    slug = re.sub(r"-+", "-", slug).strip("-")
    return slug


def load_template(project_root: Path, template_name: str) -> str:
    """テンプレートファイルを読み込む"""
    template_path = project_root / TEMPLATES_DIR / template_name
    if template_path.exists():
        content = template_path.read_text(encoding="utf-8")
        # YAML フロントマター部分をスキップしてコンテンツ本体を返す
        parts = content.split("---", 2)
        if len(parts) >= 3:
            return parts[2].strip()
        return content
    return None


def existing_skills(project_root: Path) -> list[str]:
    """既存スキルの一覧を取得"""
    skills_path = project_root / SKILLS_DIR
    if not skills_path.exists():
        return []
    return [f.stem for f in skills_path.glob("*.md")]


# --- 対話式プロンプト ---


def interactive_prompt() -> dict:
    """対話式でスキル情報を収集"""
    print("\n" + "=" * 60)
    print("  skill-creator-max: 新しいスキルを作成")
    print("=" * 60 + "\n")

    # スキル名
    while True:
        name = input("スキル名 (例: run-tests, css-lint): ").strip()
        if not name:
            print("  ❌ スキル名は必須です")
            continue
        slug = slugify(name)
        if slug != name:
            print(f"  → ファイル名: {slug}.md")
        break

    # カテゴリ選択
    print("\nカテゴリを選択してください:")
    for i, (key, cat) in enumerate(CATEGORIES.items(), 1):
        examples = ", ".join(cat["examples"][:3]) if cat["examples"] else "---"
        print(f"  {i}. {cat['label']} ({key})")
        print(f"     {cat['description']}")
        print(f"     例: {examples}")

    while True:
        choice = input(f"\n番号 (1-{len(CATEGORIES)}): ").strip()
        try:
            idx = int(choice) - 1
            if 0 <= idx < len(CATEGORIES):
                category = list(CATEGORIES.keys())[idx]
                break
        except ValueError:
            pass
        print("  ❌ 有効な番号を入力してください")

    # 説明
    description = input("\n説明 (1行): ").strip()
    if not description:
        description = f"{slug} スキル"

    # 手順の概要
    print("\n手順の概要（空行で終了）:")
    steps = []
    step_num = 1
    while True:
        step = input(f"  {step_num}. ").strip()
        if not step:
            break
        steps.append(step)
        step_num += 1

    # 前提条件
    prerequisites = input("\n前提条件（なければ空Enter）: ").strip()

    # ツール依存
    print("\n使用するツール（カンマ区切り、なければ空Enter）:")
    print("  例: Bash, Chrome MCP, Read, Grep")
    tools = input("  → ").strip()

    return {
        "name": slug,
        "category": category,
        "description": description,
        "steps": steps,
        "prerequisites": prerequisites,
        "tools": [t.strip() for t in tools.split(",") if t.strip()] if tools else [],
    }


# --- スキルファイル生成 ---


def generate_skill_content(info: dict, template_content: str | None) -> str:
    """スキルMarkdownコンテンツを生成"""
    name = info["name"]
    desc = info["description"]
    cat = CATEGORIES[info["category"]]
    steps = info["steps"]
    prereqs = info["prerequisites"]
    tools = info["tools"]

    lines = []

    # タイトルと説明
    lines.append(f"# {name}")
    lines.append("")
    lines.append(desc)
    lines.append("")

    # 前提条件
    if prereqs:
        lines.append("## 前提")
        lines.append("")
        lines.append(prereqs)
        lines.append("")

    # 手順
    lines.append("## 手順")
    lines.append("")
    if steps:
        for i, step in enumerate(steps, 1):
            lines.append(f"{i}. {step}")
        lines.append("")
    else:
        lines.append("1. TODO: 手順を記述する")
        lines.append("2. TODO: 確認ポイントを追加する")
        lines.append("3. TODO: 結果のレポート形式を定義する")
        lines.append("")

    # 使用ツール（コメントとして）
    if tools:
        lines.append("## 使用ツール")
        lines.append("")
        for tool in tools:
            lines.append(f"- {tool}")
        lines.append("")

    # 失敗時の対応（テスト系のテンプレートパターン）
    if info["category"] == "test":
        lines.append("## 失敗時の対応")
        lines.append("")
        lines.append("| 状況 | 対応 |")
        lines.append("|------|------|")
        lines.append("| TODO | TODO: 失敗パターンと対応を記述 |")
        lines.append("")

    # デプロイ系の結果レポートパターン
    if info["category"] in ("deploy", "test"):
        lines.append("## 結果レポート")
        lines.append("")
        lines.append("以下の形式で報告する:")
        lines.append("")
        lines.append("```")
        if info["category"] == "deploy":
            lines.append(f"## {name} 結果")
            lines.append("- Status: ✅ / ⚠️")
            lines.append("- Details: <詳細>")
        else:
            lines.append(f"## {name} テスト結果")
            lines.append("- 結果: ✅ / ⚠️ <問題があれば記載>")
        lines.append("```")
        lines.append("")

    return "\n".join(lines)


# --- メイン ---


def main():
    parser = argparse.ArgumentParser(
        description="Claude Code スキル雛形を生成する"
    )
    parser.add_argument("--name", help="スキル名（対話式をスキップ）")
    parser.add_argument(
        "--category",
        choices=list(CATEGORIES.keys()),
        help="カテゴリ",
    )
    parser.add_argument("--description", help="説明文")
    parser.add_argument("--template", help="使用するテンプレートファイル名")
    parser.add_argument(
        "--output-dir",
        default=None,
        help="出力ディレクトリ（デフォルト: .claude/skills/）",
    )
    parser.add_argument("--dry-run", action="store_true", help="ファイルを作成せず内容を表示")
    args = parser.parse_args()

    project_root = find_project_root()

    # 既存スキル一覧
    existing = existing_skills(project_root)
    if existing:
        print(f"\n📋 既存スキル: {', '.join(existing)}")

    # 情報収集
    if args.name:
        info = {
            "name": slugify(args.name),
            "category": args.category or "general",
            "description": args.description or f"{args.name} スキル",
            "steps": [],
            "prerequisites": "",
            "tools": [],
        }
    else:
        info = interactive_prompt()

    # 重複チェック
    if info["name"] in existing:
        overwrite = input(
            f"\n⚠️  '{info['name']}' は既に存在します。上書きしますか？ (y/N): "
        ).strip().lower()
        if overwrite != "y":
            print("中断しました。")
            sys.exit(0)

    # テンプレート読み込み
    template_name = args.template or CATEGORIES[info["category"]]["template"]
    template_content = load_template(project_root, template_name)

    # コンテンツ生成
    content = generate_skill_content(info, template_content)

    # 出力
    output_dir = Path(args.output_dir) if args.output_dir else (project_root / SKILLS_DIR)
    output_path = output_dir / f"{info['name']}.md"

    if args.dry_run:
        print("\n" + "=" * 60)
        print(f"  [DRY RUN] {output_path}")
        print("=" * 60)
        print(content)
        return

    output_dir.mkdir(parents=True, exist_ok=True)
    output_path.write_text(content, encoding="utf-8")

    print(f"\n✅ スキルファイルを生成しました: {output_path}")
    print(f"   カテゴリ: {CATEGORIES[info['category']]['label']}")
    print(f"   コマンド: /{info['name']}")
    print(f"\n💡 CLAUDE.md の「スキル」テーブルにも追記してください:")
    print(f"   | `/{info['name']}` | {info['description']} |")


if __name__ == "__main__":
    main()
