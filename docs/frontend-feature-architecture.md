# Frontend Feature Architecture

このドキュメントは、Frontendを機能単位で疎結合に実装していくための設計方針をまとめる。

## Goal

MVPの中心体験は以下。

```text
質問する -> Backendから回答が返る -> 図や手順を確認する
```

各機能は直接実装を参照し合わず、共有型と明確なprops/APIを通して接続する。

## Current Boundary

現時点で分離済みの境界:

```text
src/types/chat.ts
  ChatResponse / Step / Annotation / Citation / VisualData

src/services/chatService.ts
  Backend API call
  Backend response adapter

src/hooks/useChatController.ts
  Chat state
  Send flow
  Chat history persistence
  Step index state

src/app/page.tsx
  Screen layout state
  Existing UI rendering
```

依存方向:

```text
page.tsx -> useChatController.ts
page.tsx -> UI components
useChatController.ts -> chatService.ts
useChatController.ts -> types/chat.ts
chatService.ts -> types/chat.ts
```

`page.tsx` はチャット送信や履歴保存の実装を知らず、`useChatController` が提供する状態と操作だけを使う。

## Feature Modules

今後は以下の単位で切り出す。

| Feature | Target module | Responsibility |
| --- | --- | --- |
| Chat input | `components/chat/ChatInput.tsx` | 入力欄、送信ボタン、Enter送信、disabled制御 |
| Chat history | `components/chat/ChatHistory.tsx` | ユーザー/AIメッセージ一覧、ローディング、エラー |
| Answer display | `components/chat/AnswerMessage.tsx` | answer、warnings、citations、confidence、visualData表示 |
| Backend API | `services/chatService.ts` | `/ask` 呼び出し、timeout、response adapter |
| Chat state | `hooks/useChatController.ts` | 入力、履歴、送信中、エラー、ステップ番号、送信フロー |
| Shared contract | `types/chat.ts` | UI/API間の共有型 |
| Step card | `components/steps/StepCard.tsx` | 手順タイトル、説明、現在ステップ表示 |
| Step navigation | `components/steps/StepNavigation.tsx` | 戻る/次へ/完了、進捗表示 |
| Step image | `components/steps/StepImage.tsx` | imageUrl/imageId解決、読み込み/失敗表示 |
| Annotation overlay | `components/steps/AnnotationOverlay.tsx` | 画像上の丸印/矢印/ハイライト描画 |

## Rules

- UIコンポーネントは `fetch` を直接呼ばない。
- APIサービスはDOMやCSS、React stateを知らない。
- `page.tsx` は画面レイアウト状態と機能同士の接続だけを担当する。
- チャットの状態管理と送信フローは `useChatController.ts` に閉じ込める。
- Backend responseの生形式はUIに直接流さず、`chatService.ts` で `ChatResponse` に変換する。
- 座標や画像IDの変換は、実画像・座標仕様が確定するまで固定値で実装しない。
- 新しい機能は、既存機能のprops/APIを壊さないように追加する。

## Implementation Order

1. Shared types: `types/chat.ts`
2. Backend API adapter: `services/chatService.ts`
3. Answer metadata display: `AnswerMessage`
4. Chat input split: `ChatInput`
5. Chat history split: `ChatHistory`
6. Step card split: `StepCard`
7. Image/annotation split: `StepImage`, `AnnotationOverlay`
8. Chat state split: `useChatController`

## MVP Status

| Feature | Status |
| --- | --- |
| Chat input | Split into `components/chat/ChatInput.tsx` |
| Chat history | Split into `components/chat/ChatHistory.tsx` |
| Backend API | `/ask` adapter implemented |
| Chat state | Split into `hooks/useChatController.ts` |
| Text answer | Basic answer display implemented |
| Answer metadata | Split into `components/chat/AnswerMessage.tsx` and displayed when present |
| Step card | Split into `components/steps/StepCard.tsx` |
| Step navigation | Included in `components/steps/StepCard.tsx` |
| Image display | Split into `components/steps/StepImage.tsx`; imageId mapping not implemented |
| Annotation | Split into `components/steps/AnnotationOverlay.tsx`; backend visualData mapping not implemented |

## Backend Integration Notes

Backend contract is documented separately in `docs/frontend-backend-contract.md`.

Current backend endpoint:

```text
POST /ask
```

Current adapter rule:

```text
Backend AskResponse -> Frontend ChatResponse
```

`visual_data.highlight_item` is stored as metadata only. It is not converted to coordinates yet.
