---
title: "Storybook ルール"
description: "Storybook 10 + Svelte CSFフォーマット・ストーリー配置・ストア依存パターン"
category: "rules"
created: "2026-02-27"
updated: "2026-03-07"
---

# Storybook ルール

## 基本構成

- **Storybook 10** + `@storybook/sveltekit` + `@storybook/addon-svelte-csf` v5
- 設定: `.storybook/main.ts`, `.storybook/preview.ts`
- ポート: `http://localhost:6006`（`npm run storybook`）

## ストーリーファイルの配置

コンポーネントと同階層に co-locate する:

```
src/lib/components/ui/button/
├── button.svelte
├── button.stories.svelte    ← ストーリー
└── index.ts

src/lib/components/preset/
├── PresetCard.svelte
└── PresetCard.stories.svelte
```

## Svelte CSF フォーマット

### 単体コンポーネント

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import MyComponent from './MyComponent.svelte';

  const { Story } = defineMeta({
    title: 'UI/MyComponent',
    component: MyComponent,
    tags: ['autodocs'],
    argTypes: { /* optional controls */ }
  });
</script>

<Story name="Default" args={{ ... }}>
  {#snippet template(args)}
    <MyComponent {...args} />
  {/snippet}
</Story>
```

### barrel export パターン（Card, Dialog, Select 等の複合コンポーネント）

```svelte
<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import * as Card from './index.js';

  const { Story } = defineMeta({
    title: 'UI/Card',
    component: Card.Root,
    tags: ['autodocs']
  });
</script>

<Story name="Default">
  {#snippet template()}
    <Card.Root>
      <Card.Header>
        <Card.Title>Title</Card.Title>
      </Card.Header>
      <Card.Content>
        <p>Content</p>
      </Card.Content>
    </Card.Root>
  {/snippet}
</Story>
```

## カテゴリ命名

| カテゴリ | 用途 | 例 |
|---------|------|-----|
| `UI/*` | 汎用 UI コンポーネント | Button, Card, Dialog, Input, Select |
| `Domain/*` | ビジネスロジック依存 | PresetCard, CommandOutput, DropZone |

## グローバルストア依存のストーリー

`commandStore` 等に依存するコンポーネントは `{@const}` パターンでストア状態を設定する:

```svelte
<Story name="WithCommand">
  {#snippet template()}
    {@const _ = (() => {
      commandStore.mode = 'preset';
      commandStore.applyPreset('video-convert');
    })()}
    <CommandOutput />
  {/snippet}
</Story>
```

**注意**: デコレータだけではストーリーごとの状態設定ができないため、このパターンが必要。

## i18n・テーマ

- `preview.ts` のデコレータが locale 切替と `.dark` クラス切替を処理済み
- ストーリー内で `$t()` は通常通り使える（追加設定不要）
- Storybook ツールバーの Globe アイコンで ja/en 切替、ペイントブラシで light/dark 切替

## CSS

ストーリー内のインラインスタイルにも oklch ルールが適用される。
`#hex` / `rgb()` / `hsl()` は禁止。Tailwind ユーティリティクラスまたは CSS トークン（`var(--color-*)` 等）を使うこと。

## ストーリー作成の必須タイミング

新しい UI コンポーネントを作成したら、必ず stories ファイルも作成する。
最低限 `Default` ストーリーを含め、主要なバリエーション（variant/size/状態）をカバーすること。
