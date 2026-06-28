# Frontend MVP Test Evidence

実行日: 2026-06-28

実行コマンド:

```bash
npm run build
npm run lint
npm run test:e2e
```

結果:

```text
4 passed
```

## Evidence Files

| File | Covered checks |
| --- | --- |
| `01-chat-input-demo-response.png` | 入力、IME Enter、Enter送信、デモ回答、Step 1表示 |
| `02-step-navigation-arrow-annotation.png` | ステップ遷移、annotation切替 |
| `03-step-complete-and-back.png` | 最終ステップ、完了表示、戻る操作 |
| `04-history-context-menu.png` | 履歴表示、履歴再送信、右クリック削除メニュー |
| `05-history-deleted.png` | 履歴削除、localStorage永続削除 |
| `06-backend-adapted-response.png` | Backend `/ask` response adapter、metadata表示 |
| `06-backend-request.json` | FrontendからBackendへ送るrequest body |

## Notes

- Backend実サーバではなく、Playwright routeで `/ask` responseをmockしている。
- 実Backend疎通時は `docs/frontend-next-tasks.md` の手順で追加確認する。
