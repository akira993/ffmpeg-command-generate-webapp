# i18n-check

`src/lib/i18n/en.json` と `src/lib/i18n/ja.json` の翻訳キー整合性をチェックする。

## 手順

1. `src/lib/i18n/en.json` と `src/lib/i18n/ja.json` を Read する
2. 両ファイルのキー構造を比較し、**片方にしか存在しないキー**を列挙する
3. コンポーネントで使用されているキーが両ファイルに存在するか確認する
4. 欠落キーがあれば追加する（翻訳文は文脈から適切に作成する）

## キー構造（基準）

```
common.copy / copied / reset / input / output / apply
header.title / subtitle
mode.preset / advanced
preset.videoConvert.name / .desc
preset.videoCompress.name / .desc
preset.audioExtract.name / .desc
preset.audioConvert.name / .desc
preset.videoTrim.name / .desc
preset.gifGenerate.name / .desc
preset.imageConvert.name / .desc
form.filename / format / codec / resolution / framerate / bitrate / crf
form.sampleRate / channels / startTime / endTime / duration
form.noVideo / noAudio / stripMetadata / copyStreams
command.generated / empty / copied
pathGuide.buttonLabel / title / description / step1〜4 / tipTitle / tipMac / tipWindows / tipLinux / warning / installPrompt / installLink
installGuide.buttonLabel / title / description / mac.* / windows.* / verifyTitle / verifyDesc / officialSite
```

## ルール

- **新規キー追加時**: en.json と ja.json の両方に必ず追加する
- **日本語 (ja.json)**: 自然な日本語で、UIラベルは簡潔に
- **英語 (en.json)**: 簡潔な英語、UI慣習に従う
- sveltekit-i18n の補間構文: `{{variable}}` 形式
