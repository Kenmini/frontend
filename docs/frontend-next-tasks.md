# Frontend Next Tasks

明日の作業開始時に確認する残作業リスト。

## Current State

FrontendのMVP骨格は実装済み。

- ユーザー入力を `POST /ask` に送る処理は実装済み
- Backend API contractとのrequest/response adapterは実装済み
- チャット入力、履歴表示、回答表示、手順カード、画像表示、アノテーション表示は機能単位に分割済み
- `page.tsx` は画面レイアウトと機能接続を担当し、チャット状態は `useChatController.ts` に分離済み

現時点ではBackend実サーバとの疎通確認は未実施。

## First Task: Backend Integration Check

Backendが起動したら、まず以下を確認する。

```bash
cd /Volumes/miniSSD/UMP-JUST/backend
uvicorn main:app --reload --port 8000
```

別ターミナルでhealth check。

```bash
curl http://localhost:8000/health
```

期待値:

```json
{"status":"ok"}
```

`/ask` の疎通確認。

```bash
curl -X POST http://localhost:8000/ask \
  -H "Content-Type: application/json" \
  -d '{"message":"レーザーが出ません","session_id":"frontend-test","current_state":{"active_figure_id":"panel_01"}}'
```

期待する最低限のresponse shape:

```json
{
  "answer_text": "...",
  "next_step_hint": null,
  "visual_data": {
    "figure_id": "panel_01",
    "highlight_item": null
  },
  "citations": [],
  "confidence": 0.0,
  "is_gap": true
}
```

Frontend画面のAPI endpointには以下を入れる。

```text
http://localhost:8000
```

## If Integration Fails

まず見る場所:

- `src/services/chatService.ts`

ここでBackend responseをFrontend用の `ChatResponse` に変換している。

よくある修正箇所:

- request bodyのfield名が違う
- response field名が違う
- `citations` や `visual_data` が `null` になる
- `confidence` が未定義になる
- CORSまたはendpoint URLの指定が違う

UI component側を直接直す前に、まずadapterで吸収できるか確認する。

## Remaining Frontend Work

Backend疎通を除く残作業。

### 1. imageId Mapping

`StepImage` は `imageUrl` 表示に対応済み。

未実装:

- `imageId` から実画像を解決する仕組み
- `figure_id` と画像assetの対応

想定修正箇所:

- `src/components/steps/StepImage.tsx`
- 必要なら `src/services` または `src/types/chat.ts`

### 2. highlight_item to Annotation

Backendは `visual_data.highlight_item` を返す。
Frontendは座標指定のannotation表示に対応済み。

未実装:

- `highlight_item` を座標annotationへ変換する仕様
- 実画像ごとの座標定義

注意:

- 仮の固定座標マップは入れない
- 実画像、図ID、座標系が確定してから実装する

想定修正箇所:

- `src/services/chatService.ts`
- `src/types/chat.ts`
- `src/components/steps/AnnotationOverlay.tsx`

### 3. Real Data Display Checks

実データで確認するケース:

- `answer_text` が長い
- `citations` が複数ある
- `visual_data.highlight_item` がある
- `is_gap: true`
- `confidence` が低い
- 画像がない
- `steps` が空

見る場所:

- `src/components/chat/AnswerMessage.tsx`
- `src/components/chat/ChatHistory.tsx`
- `src/components/steps/StepCard.tsx`
- `src/components/steps/StepImage.tsx`

### 4. Tests

まだ自動テストは未追加。

優先度が高いテスト:

- `chatService`: `/ask` responseを `ChatResponse` に変換できるか
- `useChatController`: 送信、履歴保存、エラー表示
- `StepImage`: loading/error/fallback表示
- E2E: 質問 -> 回答 -> 手順カード -> 次へ

## Do Not Split Further For Now

現時点の分割粒度は十分。

これ以上 `StepNavigation` などを小さく切るより、以下を優先する。

- Backend疎通
- 実データ表示の検証
- imageId/annotation仕様の確定
- adapterでのIF吸収

## Verification Commands

Frontend変更後は以下を通す。

```bash
cd /Volumes/miniSSD/UMP-JUST/frontend
npm run build
npm run lint
```
