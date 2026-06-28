import { expect, test, type Page } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const evidenceDir = path.resolve("test-evidence");

async function saveEvidence(page: Page, name: string) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  await page.screenshot({
    path: path.join(evidenceDir, `${name}.png`),
    fullPage: true,
  });
}

async function sendMessage(page: Page, message: string) {
  const input = page.getByPlaceholder(/装置の症状を入力/);
  await input.click();
  await input.pressSequentially(message);
  const sendButton = page.getByTitle("送信");
  await expect(sendButton).toBeEnabled();
  await sendButton.click();
}

test.describe("Frontend MVP manual checklist", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test("chat input supports empty disabled state, IME Enter, Enter submit, loading, and demo response", async ({ page }) => {
    const input = page.getByPlaceholder(/装置の症状を入力/);
    const sendButton = page.getByTitle("送信");

    await expect(input).toBeVisible();
    await expect(sendButton).toBeDisabled();

    await input.click();
    await input.pressSequentially("   ");
    await expect(sendButton).toBeDisabled();

    await input.press("Meta+A");
    await input.pressSequentially("レーザーが出ません");
    await input.dispatchEvent("keydown", {
      key: "Enter",
      code: "Enter",
      keyCode: 229,
      which: 229,
      bubbles: true,
      cancelable: true,
      isComposing: true,
    });
    await expect(input).toHaveValue("レーザーが出ません");
    await expect(page.getByText("確認手順を組み立てています...")).toHaveCount(0);

    await input.press("Enter");
    await expect(page.getByText("レーザーが出ません").last()).toBeVisible();
    await expect(page.getByText("HF-2000の高圧印加")).toBeVisible();
    await expect(page.getByText("STEP 1 / 4")).toBeVisible();

    await saveEvidence(page, "01-chat-input-demo-response");
  });

  test("step card navigation and annotation states work independently", async ({ page }) => {
    await sendMessage(page, "レーザーが出ません");

    await expect(page.getByText("STEP 1 / 4")).toBeVisible();
    await expect(page.getByRole("button", { name: /戻る/ })).toBeDisabled();

    await page.getByRole("button", { name: /次へ/ }).click();
    await expect(page.getByText("STEP 2 / 4")).toBeVisible();

    await page.getByRole("button", { name: /次へ/ }).click();
    await expect(page.getByText("STEP 3 / 4")).toBeVisible();
    await saveEvidence(page, "02-step-navigation-arrow-annotation");

    await page.getByRole("button", { name: /次へ/ }).click();
    await expect(page.getByText("STEP 4 / 4")).toBeVisible();
    await expect(page.getByRole("button", { name: /完了/ })).toBeDisabled();
    await expect(page.getByText("すべての手順が完了しました")).toBeVisible();

    await page.getByRole("button", { name: /戻る/ }).click();
    await expect(page.getByText("STEP 3 / 4")).toBeVisible();

    await saveEvidence(page, "03-step-complete-and-back");
  });

  test("history can replay a question and delete it from the right-click menu", async ({ page }) => {
    await sendMessage(page, "電源が入らない");
    await expect(page.getByText("HF-2000の基本トラブルシューティング手順です")).toBeVisible();

    const sidebar = page.locator("aside");
    const historyItem = sidebar.getByRole("button", { name: /電源が入らない/ });
    await expect(historyItem).toBeVisible();

    await historyItem.click();
    await expect(page.getByText("HF-2000の基本トラブルシューティング手順です")).toHaveCount(2);

    await historyItem.click({ button: "right" });
    await expect(page.getByRole("button", { name: "削除" })).toBeVisible();
    await saveEvidence(page, "04-history-context-menu");

    await page.getByRole("button", { name: "削除" }).click();
    await expect(sidebar.getByRole("button", { name: /電源が入らない/ })).toHaveCount(0);

    await page.reload();
    await expect(sidebar.getByRole("button", { name: /電源が入らない/ })).toHaveCount(0);
    await expect(page.getByText("まだ相談はありません。")).toBeVisible();

    await saveEvidence(page, "05-history-deleted");
  });

  test("backend endpoint setting sends POST /ask and displays adapted response metadata", async ({ page }) => {
    const requests: unknown[] = [];
    await page.route("http://127.0.0.1:9876/ask", async (route) => {
      requests.push(route.request().postDataJSON());
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          answer_text: "バックエンド疎通テストの回答です。",
          next_step_hint: "次に関連図を確認してください。",
          visual_data: {
            figure_id: "panel_01",
            highlight_item: "輝度つまみ",
          },
          citations: [
            {
              source: "manual.pdf",
              snippet: "輝度つまみはパネル右上にあります。",
            },
          ],
          confidence: 0.82,
          is_gap: false,
        }),
      });
    });

    await page.getByTitle("Settings").click();
    await page.getByPlaceholder("https://your-api.com/chat").pressSequentially("http://127.0.0.1:9876");
    await page.getByLabel("関連図を表示").check();
    await sendMessage(page, "輝度つまみはどこですか？");
    await expect(page.getByPlaceholder(/装置の症状を入力/)).toBeDisabled();
    await expect(page.getByText("確認手順を組み立てています...")).toBeVisible();

    await expect(page.getByText("バックエンド疎通テストの回答です。")).toBeVisible();
    await expect(page.getByText("次に関連図を確認してください。")).toBeVisible();
    await expect(page.getByText("manual.pdf")).toBeVisible();
    await expect(page.getByText("panel_01")).toBeVisible();
    await expect(page.getByText("輝度つまみ").last()).toBeVisible();

    expect(requests).toHaveLength(1);
    expect(requests[0]).toMatchObject({
      message: "輝度つまみはどこですか？",
      current_state: {
        active_figure_id: "panel_01",
      },
    });
    expect(requests[0]).toHaveProperty("session_id");

    fs.mkdirSync(evidenceDir, { recursive: true });
    fs.writeFileSync(
      path.join(evidenceDir, "06-backend-request.json"),
      JSON.stringify(requests[0], null, 2)
    );
    await saveEvidence(page, "06-backend-adapted-response");
  });

  test("backend pdf_url visual data displays a link to the requested PDF page", async ({ page }) => {
    await page.route("http://127.0.0.1:9876/ask", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          answer_text: "PDFページ確認テストです。",
          next_step_hint: null,
          visual_data: {
            figure_id: null,
            highlight_item: null,
            source: null,
            page_number: 12,
            pdf_url: "https://example.com/manuals/hf-2000.pdf",
          },
          citations: [],
          confidence: 0.9,
          is_gap: false,
        }),
      });
    });

    await page.getByTitle("Settings").click();
    await page.getByPlaceholder("https://your-api.com/chat").pressSequentially("http://127.0.0.1:9876");
    await sendMessage(page, "PDFページを見せて");

    await expect(page.getByText("PDFページ確認テストです。")).toBeVisible();
    const pdfToggle = page.getByRole("button", { name: /hf-2000\.pdf.*Page 12/ });
    await expect(pdfToggle).toBeVisible();

    await pdfToggle.click();
    await expect(page.getByText("https://example.com/manuals/hf-2000.pdf")).toBeVisible();

    const pageLink = page.getByRole("link", { name: "Page 12 を開く" });
    await expect(pageLink).toHaveAttribute("href", "https://example.com/manuals/hf-2000.pdf#page=12");
    await expect(pageLink).toHaveAttribute("target", "_blank");

    await saveEvidence(page, "07-backend-pdf-url-page-link");
  });
});
