#!/usr/bin/env python3
"""
test_trigger.py — スキルトリガー条件テスト

使い方:
    python3 skill-creator-max/scripts/test_trigger.py .claude/skills/
    python3 skill-creator-max/scripts/test_trigger.py .claude/skills/run-tests.md

スキルがどのようなユーザー入力で発火するかをシミュレーションし、
トリガー条件の網羅性と衝突を検出する。

仕組み:
    - スキル名（ファイル名）をコマンド名 (/<name>) として扱う
    - 説明文・手順からキーワードを抽出し、トリガーパターンを推定
    - スキル間のキーワード重複を検出
"""

from __future__ import annotations

import sys
import re
from pathlib import Path
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class SkillTrigger:
    """スキルのトリガー情報"""
    name: str
    command: str
    file_path: str
    description: str
    keywords: list[str] = field(default_factory=list)
    matched_phrases: list[str] = field(default_factory=list)


# 日本語のキーワード抽出用ストップワード
STOPWORDS_JA = {
    "する", "した", "して", "です", "ます", "ない", "ある",
    "この", "その", "あの", "これ", "それ", "あれ",
    "こと", "もの", "ため", "よう", "とき", "場合",
    "以下", "以上", "以降", "まで", "から", "より",
    "および", "または", "および", "ただし",
}

STOPWORDS_EN = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "can", "shall",
    "and", "or", "but", "if", "then", "else", "when", "while",
    "for", "to", "from", "in", "on", "at", "by", "with",
    "of", "as", "not", "no", "all", "each", "every",
    "this", "that", "these", "those", "it", "its",
}


def extract_keywords(content: str) -> list[str]:
    """コンテンツからキーワードを抽出"""
    # 英語単語の抽出
    en_words = re.findall(r"\b[a-zA-Z][a-zA-Z0-9_-]{2,}\b", content)
    en_filtered = [
        w.lower() for w in en_words if w.lower() not in STOPWORDS_EN
    ]

    # 日本語のキーフレーズ抽出（カタカナ語、漢字語）
    katakana = re.findall(r"[ァ-ヶー]{2,}", content)
    kanji_phrases = re.findall(r"[一-龥]{2,}", content)

    # 技術用語（コマンド、ツール名）
    tech_terms = re.findall(r"`([^`]+)`", content)
    commands = re.findall(r"\b(npm|bash|git|gh|python3?)\s+\w+", content)

    all_keywords = list(set(en_filtered + katakana + kanji_phrases + tech_terms))
    # 出現頻度で並べ替え
    keyword_freq = {}
    for kw in all_keywords:
        keyword_freq[kw] = content.lower().count(kw.lower())

    sorted_keywords = sorted(
        keyword_freq.keys(), key=lambda k: keyword_freq[k], reverse=True
    )
    return sorted_keywords[:20]  # 上位20キーワード


def parse_skill(file_path: Path) -> SkillTrigger | None:
    """スキルファイルからトリガー情報を抽出"""
    if not file_path.exists():
        return None

    content = file_path.read_text(encoding="utf-8")
    name = file_path.stem

    # H1 直後の説明文を取得
    h1_match = re.search(r"^#\s+.+\n+(.+)", content, re.MULTILINE)
    description = ""
    if h1_match:
        desc_line = h1_match.group(1).strip()
        if not desc_line.startswith("#"):
            description = desc_line

    keywords = extract_keywords(content)

    return SkillTrigger(
        name=name,
        command=f"/{name}",
        file_path=str(file_path),
        description=description,
        keywords=keywords,
    )


def simulate_trigger(skills: list[SkillTrigger], query: str) -> list[tuple[SkillTrigger, int]]:
    """ユーザー入力に対してマッチするスキルを返す"""
    matches = []
    query_lower = query.lower()
    query_words = set(re.findall(r"\b\w+\b", query_lower))

    for skill in skills:
        score = 0

        # コマンド名の完全一致
        if skill.command in query or skill.name in query_lower:
            score += 100

        # キーワードマッチ
        for kw in skill.keywords:
            if kw.lower() in query_lower:
                score += 10

        # 説明文の単語マッチ
        desc_words = set(re.findall(r"\b\w+\b", skill.description.lower()))
        overlap = query_words & desc_words
        score += len(overlap) * 5

        if score > 0:
            matches.append((skill, score))

    matches.sort(key=lambda x: x[1], reverse=True)
    return matches


def detect_conflicts(skills: list[SkillTrigger]) -> list[str]:
    """スキル間のキーワード衝突を検出"""
    conflicts = []

    for i, skill_a in enumerate(skills):
        for skill_b in skills[i + 1:]:
            common = set(skill_a.keywords[:10]) & set(skill_b.keywords[:10])
            if len(common) >= 3:
                conflicts.append(
                    f"⚠️  '{skill_a.name}' と '{skill_b.name}' のキーワードが重複: "
                    f"{', '.join(list(common)[:5])}"
                )

    return conflicts


# --- テストケース ---

TEST_QUERIES = [
    "テストを実行して",
    "型チェックして",
    "CSSのルール違反をチェック",
    "デプロイして",
    "UIテストして",
    "パフォーマンスを計測",
    "翻訳キーの整合性チェック",
    "本番環境のテスト",
    "/run-tests",
    "/deploy",
    "npm run test",
    "ビルドしてデプロイ",
    "i18n のチェック",
    "モバイルのレイアウト確認",
]


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 test_trigger.py <skills_directory_or_file>")
        sys.exit(1)

    target = Path(sys.argv[1])

    if target.is_dir():
        md_files = sorted(target.glob("*.md"))
    elif target.is_file():
        md_files = [target]
    else:
        print(f"❌ パスが存在しません: {target}")
        sys.exit(1)

    skills = []
    for f in md_files:
        skill = parse_skill(f)
        if skill:
            skills.append(skill)

    if not skills:
        print("❌ スキルが見つかりません")
        sys.exit(1)

    # --- スキル一覧 ---
    print("\n" + "=" * 60)
    print("  skill-creator-max: Trigger Test")
    print("=" * 60)

    print(f"\n📋 検出されたスキル ({len(skills)} 件):")
    for skill in skills:
        kw_str = ", ".join(skill.keywords[:5])
        print(f"  {skill.command}: {skill.description[:50]}")
        print(f"    キーワード: {kw_str}")

    # --- 衝突検出 ---
    conflicts = detect_conflicts(skills)
    if conflicts:
        print(f"\n🔍 キーワード衝突検出 ({len(conflicts)} 件):")
        for c in conflicts:
            print(f"  {c}")
    else:
        print("\n✅ キーワード衝突なし")

    # --- トリガーシミュレーション ---
    print(f"\n🧪 トリガーシミュレーション ({len(TEST_QUERIES)} クエリ):")
    print("-" * 60)

    for query in TEST_QUERIES:
        matches = simulate_trigger(skills, query)
        if matches:
            top = matches[0]
            others = [m[0].command for m in matches[1:3]]
            others_str = f" (他: {', '.join(others)})" if others else ""
            print(f"  「{query}」")
            print(f"    → {top[0].command} (score: {top[1]}){others_str}")
        else:
            print(f"  「{query}」")
            print(f"    → ❌ マッチなし")

    print()


if __name__ == "__main__":
    main()
