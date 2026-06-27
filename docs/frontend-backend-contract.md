# Frontend Backend Contract

FrontendがBackend APIをどう呼び、既存の画面用チャットモデルへどう変換するかを記録する。
Backend本体の正式仕様は `/Volumes/miniSSD/UMP-JUST/backend/API.ja.md` を参照する。

## Backend Endpoint

Base URLは `NEXT_PUBLIC_API_ENDPOINT` または画面内のAPI endpoint入力欄で指定する。

Frontendは以下を呼び出す。

```text
POST /ask
```

指定値がすでに `/ask` で終わる場合はそのまま使う。それ以外は末尾に `/ask` を付与する。

## Request

```json
{
  "message": "輝度つまみはどこですか？",
  "session_id": "session_98765",
  "current_state": {
    "active_figure_id": "panel_01"
  }
}
```

Frontendは `chat_session_id` を `localStorage` に保存し、`session_id` として送信する。
`active_figure_id` は現時点では `panel_01` をデフォルト値として送信する。

## Backend Response

```json
{
  "answer_text": "...",
  "next_step_hint": null,
  "visual_data": {
    "figure_id": "panel_01",
    "highlight_item": "輝度つまみ"
  },
  "citations": [],
  "confidence": 0.82,
  "is_gap": false
}
```

## Frontend Adapter

`src/services/chatService.ts` でBackendレスポンスを既存UIモデルへ変換する。
共有型は `src/types/chat.ts` に置き、UI層とAPI層が同じ契約だけに依存するようにする。

| Backend field | Frontend field |
| --- | --- |
| `answer_text` | `answer` |
| `visual_data` | `visualData` として保持 |
| `next_step_hint` | `nextStepHint` |
| `citations` | `citations` |
| `confidence` | `confidence` |
| `is_gap` | `isGap`, warning message |

Backend endpointが未設定の場合、既存のmock responseはこれまで通り複数stepのデモデータを返す。

`visual_data.highlight_item` から注釈座標を作る処理はまだ行わない。実機材画像・図ID・座標系の仕様が確定してから、別の機能単位として実装する。

## Error Handling

- 15秒でタイムアウトし、`API request timed out` をthrowする。
- HTTPステータスが2xxでない場合は `HTTP Error {status}` をthrowする。
- Backend responseが最低限の `/ask` 形を満たさない場合は `Invalid API response shape` をthrowする。
