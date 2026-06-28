import type { ChatRequestOptions, ChatResponse, Citation, VisualData, Step } from "@/types/chat";
import { DIAGRAMS } from "@/data/diagrams";

interface AskResponse {
  answer_text: string;
  next_step_hint?: string | null;
  visual_data: VisualData | null;
  citations: Citation[];
  confidence: number;
  is_gap: boolean;
}

// -------------------------------------------------------------
// CONFIGURATION FLAGS
// -------------------------------------------------------------
// Force mock mode regardless of settings. Can be controlled via environment variables.
export const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Default backend API endpoint from environment variables (wired at build/runtime time).
export const DEFAULT_API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";
const REQUEST_TIMEOUT_MS = 45000;
const DEFAULT_FIGURE_ID = "panel_01";
let cachedSessionId: string | null = null;

function resolveAskEndpoint(endpoint: string) {
  const trimmed = endpoint.trim();
  if (trimmed.endsWith("/ask")) return trimmed;
  return `${trimmed.replace(/\/$/, "")}/ask`;
}

function getSessionId() {
  if (cachedSessionId) return cachedSessionId;

  if (typeof window === "undefined") {
    cachedSessionId = "frontend-server-session";
    return cachedSessionId;
  }

  const saved = window.localStorage.getItem("chat_session_id");
  if (saved) {
    cachedSessionId = saved;
    return cachedSessionId;
  }

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  window.localStorage.setItem("chat_session_id", generated);
  cachedSessionId = generated;
  return generated;
}

function isAskResponse(value: unknown): value is AskResponse {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<AskResponse>;
  return (
    typeof data.answer_text === "string" &&
    Array.isArray(data.citations) &&
    typeof data.confidence === "number" &&
    typeof data.is_gap === "boolean"
  );
}

function adaptAskResponse(data: AskResponse, lang?: "ja" | "en"): ChatResponse {
  const steps: Step[] = [];
  let resolvedVisualData = null;

  if (data.visual_data && data.visual_data.figure_id) {
    const figId = data.visual_data.figure_id;
    const item = data.visual_data.highlight_item;
    const diagram = DIAGRAMS[figId];

    if (diagram) {
      resolvedVisualData = {
        figure_id: figId,
        highlight_item: item,
      };

      const highlight = item ? diagram.highlights[item] : null;

      steps.push({
        id: `${figId}-resolved-step`,
        title: diagram.name,
        text: highlight?.description || (item ? `${item}の位置を確認してください。` : "図面を確認してください。"),
        imageUrl: diagram.url,
        annotation: highlight?.annotation,
        annotationLabel: highlight?.item,
        annotationDescription: highlight?.description,
      });
    }
  }

  const gapWarning = lang === "en"
    ? "No answer was found in the materials. This question has been recorded for professor review."
    : "資料に回答が見つからなかったため、この質問は先生確認用に記録されました。";

  return {
    answer: data.answer_text,
    steps,
    warnings: data.is_gap ? gapWarning : undefined,
    nextStepHint: data.next_step_hint,
    citations: data.citations,
    confidence: data.confidence,
    isGap: data.is_gap,
    visualData: resolvedVisualData || data.visual_data,
  };
}

// -------------------------------------------------------------
// MOCK DATA SCENARIOS (Japanese default, English translation included)
// -------------------------------------------------------------
const SCENARIOS: Record<string, ChatResponse> = {
  laser: {
    answer: {
      ja: "HF-2000の高圧印加とビーム出しの手順を案内します。以下の4つのステップで実行してください。",
      en: "Here are the steps for high voltage application and beam emission on HF-2000. Follow these 4 steps.",
    },
    warnings: [
      "高圧印加（FEオン）中は鏡筒後部の窒素トラップの冷却状態を必ず維持してください。",
      "エラー表示が出た場合は、直ちに左メインパネルのGVをCLOSEし、装置責任者に連絡してください。"
    ],
    slackContext: "Slackにて鈴木教授より「高圧印加パラメータはV0=200kV、Ratio=5.5、I1=30uAに固定して運用してください」と共有されています。",
    steps: [
      {
        id: "laser-s1",
        title: { ja: "高圧セット条件の確認", en: "Check Set Up Parameters" },
        text: {
          ja: "左メインパネル内の[FUNCTION]を押し、設定条件（V0: 200kV、Ratio: 5.5、I1: 30µA）が正しいことを確認します。",
          en: "Press [FUNCTION] on the left main panel and verify the conditions (V0: 200kV, Ratio: 5.5, I1: 30µA) are correct.",
        },
        imageUrl: "/images/diagrams/p4_フラッシュ.png",
        annotation: { type: "highlight", x: 30, y: 30, width: 540, height: 340 },
        annotationLabel: "左メインパネル全体",
        annotationDescription: "左メインパネル内の[FUNCTION]を押して、高圧設定パラメータ（V0=200kV, Ratio=5.5, I1=30µA）を確認します。",
      },
      {
        id: "laser-s2",
        title: { ja: "ガンバルブ (GV) の開放", en: "Open Gun Valve" },
        text: {
          ja: "左メインパネル内の GV スイッチを OPEN にします。",
          en: "Set the GV switch on the left main panel to OPEN.",
        },
        imageUrl: "/images/diagrams/p4_フラッシュ.png",
        annotation: { type: "circle", x: 360, y: 290, width: 80, height: 80 },
        annotationLabel: "FE キー",
        annotationDescription: "[FE]高圧電源ON/OFFトグルキー。GVをOPENにした後、このキーで高圧をONにします。",
      },
      {
        id: "laser-s3",
        title: { ja: "フラッシング (FLASH) の実行", en: "Run Flushing" },
        text: {
          ja: "[FE]を押し、[FLASH]キーが点滅している間に[FLASH]を押してフラッシングを行います（電流が0.4〜0.7mAに達するまで）。",
          en: "Press [FE], then press [FLASH] while it flashes to perform tip flushing (repeat until current reaches 0.4-0.7mA).",
        },
        imageUrl: "/images/diagrams/p4_フラッシュ.png",
        annotation: { type: "circle", x: 270, y: 180, width: 80, height: 80 },
        annotationLabel: "FLASH ボタン",
        annotationDescription: "[FLASH]ボタン。ランプ点滅中に押してフラッシングパルスを印加します。フラッシング電流が0.4〜0.7mAに達するまで繰り返します。",
      },
      {
        id: "laser-s4",
        title: { ja: "エミッションの自動設定", en: "Auto-set Emission Current" },
        text: {
          ja: "設定高圧に昇圧完了後、40分待機します。その後、左メインパネルの[I1C]を押してエミッション電流を自動設定します。",
          en: "After high voltage ramps up, wait 40 minutes. Then press [I1C] on the left main panel to auto-set the emission current.",
        },
        imageUrl: "/images/diagrams/p4_フラッシュ.png",
        annotation: { type: "circle", x: 440, y: 180, width: 80, height: 80 },
        annotationLabel: "I1C ボタン",
        annotationDescription: "[I1C]ボタン。昇圧から40分待機後、このボタンを押してエミッション電流の自動制御を完了させます。",
      }
    ]
  },
  holder: {
    answer: {
      ja: "試料ホルダーのセットおよび鏡筒への挿入手順です。以下の4つのステップを順に行ってください。",
      en: "Here are the steps for mounting the specimen and inserting the holder into the column. Follow these 4 steps.",
    },
    warnings: "試料押さえリングはデリケートです。絶対に強くねじ込まないでください。",
    steps: [
      {
        id: "holder-s1",
        title: { ja: "ホルダーへの試料セット", en: "Mount Specimen on Holder" },
        text: {
          ja: "二軸ホルダーの試料台に試料を載せ、試料押さえリングの広口が上になるようにセットして固定します。",
          en: "Place the specimen on the holder tip and mount the specimen clamping ring with its wide side facing up.",
        },
        imageUrl: "/images/diagrams/p3_試料ホルダー.png",
        annotation: { type: "highlight", x: 100, y: 50, width: 400, height: 280 },
        annotationLabel: "試料押さえ",
        annotationDescription: "碗状の試料押さえ。広口が上になるようにセットし、ネジ山を潰さないよう強く締めすぎないようにします。",
      },
      {
        id: "holder-s2",
        title: { ja: "ホルダーの挿入と予備排気", en: "Insert Holder and Pre-evac" },
        text: {
          ja: "ホルダーのシリンダ溝を合わせて、まっすぐA位置まで挿入し、軽く指で押しながら排気スイッチを『EVAC』にします（約120秒待ちます）。",
          en: "Align the guide groove, insert the holder straight to position A, and switch the exhaust toggle to 'EVAC' while holding it (wait ~120s).",
        },
        imageUrl: "/images/diagrams/p3_試料ホルダー_A位置.png",
        annotation: { type: "highlight", x: 180, y: 80, width: 240, height: 160 },
        annotationLabel: "A位置（約5cm）",
        annotationDescription: "シリンダの溝を合わせ、一番手前のA位置（約5cm）までまっすぐ差し込みます。その後EVACスイッチを押します。",
      },
      {
        id: "holder-s3",
        title: { ja: "中間B位置への挿入", en: "Rotate to Position B" },
        text: {
          ja: "本引き終了のブザーが鳴る15秒間に、時計方向に45°回して止まるまで挿入します（中間B位置）。",
          en: "When the pre-evacuation buzzer sounds, insert the holder while rotating it 45 degrees clockwise until it stops (intermediate Position B).",
        },
        imageUrl: "/images/diagrams/p3_試料ホルダー_B位置.png",
        annotation: { type: "highlight", x: 220, y: 150, width: 180, height: 120 },
        annotationLabel: "B位置（約25cm）",
        annotationDescription: "排気完了後ブザーが鳴る15秒の間に、時計方向に45度回して止まるまで挿入した中間位置（B位置・約25cm）。",
      },
      {
        id: "holder-s4",
        title: { ja: "観察C位置への挿入", en: "Rotate to Observation Position C" },
        text: {
          ja: "さらに反時計方向に15°回して、止まるまでゆっくりと奥へ挿入します（観察C位置）。",
          en: "Rotate it 15 degrees counter-clockwise and gently push all the way in until it stops (observation Position C).",
        },
        imageUrl: "/images/diagrams/p3_試料ホルダー_図.png",
        annotation: { type: "circle", x: 160, y: 160, width: 60, height: 60 },
        annotationLabel: "C位置",
        annotationDescription: "反時計回りに15度戻して観察位置まで完全に押し込んだ状態。これが通常の観察位置です。",
      }
    ]
  },
  focus: {
    answer: {
      ja: "ピントが合わない・対物レンズ非点収差補正の手順です。以下の3つのステップを確認してください。",
      en: "Objective lens focusing and astigmatism correction procedures. Verify the following 3 steps.",
    },
    warnings: "200K倍以上の高倍率観察を行う場合は、必ずこの対物非点補正を行ってください。",
    steps: [
      {
        id: "focus-s1",
        title: { ja: "対物絞り（2番）の挿入", en: "Insert Objective Aperture 2" },
        text: {
          ja: "透過波が中心になるように対物絞り（通常2番）を挿入します。",
          en: "Insert the objective aperture (normally No. 2) so that the central transmitted beam is selected.",
        },
        imageUrl: "/images/diagrams/p2_初期状態確認_鏡筒状態確認横.png",
        annotation: { type: "highlight", x: 430, y: 250, width: 140, height: 60 },
        annotationLabel: "対物絞り",
        annotationDescription: "対物レンズ絞りレバー。回折パターンを得た後、透過波が中心になるように対物絞り（通常2番）を挿入します。",
      },
      {
        id: "focus-s2",
        title: { ja: "過焦点での非点補正", en: "Correct Astigmatism in Overfocus" },
        text: {
          ja: "像を過焦点（オーバーフォーカス）にし、左サブパネルのOBJ STIGM-XYを使って、アモルファスの外側フリンジ幅が全周で均等になるように補正します。",
          en: "Adjust focus to overfocus, and use OBJ STIGM-XY on the left sub-panel to make the outer fringe width equal in all directions.",
        },
        imageUrl: "/images/diagrams/p7_非点収差補正_粒状構造.png",
        annotation: { type: "highlight", x: 50, y: 50, width: 500, height: 300 },
        annotationLabel: "フリンジパターン比較",
        annotationDescription: "左：補正済みの等方的フリンジ（目標）。右：非点ありの横縞フリンジ（要補正）。OBJ STIGM-XYで左の状態に追い込みます。",
      },
      {
        id: "focus-s3",
        title: { ja: "正焦点のコントラスト調整", en: "Verify Exact Focus" },
        text: {
          ja: "アモルファス構造のコントラストの粒が最も細かく、かつシャープに見える最小コントラスト位置（正焦点）にフォーカスを微調整します。",
          en: "Finely adjust the focus to the point of minimum contrast (exact focus) where the amorphous grain features look finest and sharpest.",
        },
        imageUrl: "/images/diagrams/p6_試料の位置調整_実際のビュー.png",
        annotation: { type: "highlight", x: 50, y: 50, width: 500, height: 300 },
        annotationLabel: "正焦点像",
        annotationDescription: "Z軸を上下させて像の輪郭コントラストが最小になる点が正焦点高さです。WOBBLERをONにして像の揺れが止まる点を探す方法もあります。",
      }
    ]
  },
  astig: {
    answer: {
      ja: "収束レンズの非点補正（ビーム形状補正）の手順です。以下の3つのステップで行います。",
      en: "Condenser lens astigmatism correction (beam shape correction). Follow these 3 steps.",
    },
    warnings: "BEAM TILTなどを動かすと収束非点が出やすくなります。その際は再度本手順を行ってください。",
    steps: [
      {
        id: "astig-s1",
        title: { ja: "ビームの輝度中心調整", en: "Align Brightness Center" },
        text: {
          ja: "ビームを収束させ、蛍光板の中心にない場合は右メインパネルのBRIGHTNESS CENTERINGで中心に合わせます。",
          en: "Condense the beam, and if it is not centered on the screen, use BRIGHTNESS CENTERING on the right main panel to align it.",
        },
        imageUrl: "/images/diagrams/p6_明度調整.png",
        annotation: { type: "highlight", x: 150, y: 100, width: 300, height: 200 },
        annotationLabel: "BRIGHTNESS CENTERING",
        annotationDescription: "ビームを絞ったときに中心位置にアライメントするBRIGHTNESS CENTERINGつまみ。大きいビームと小さいビームが同じ中心を向くよう調整します。",
      },
      {
        id: "astig-s2",
        title: { ja: "3次非点の補正", en: "Correct 3rd Astigmatism" },
        text: {
          ja: "左サブパネルのCOND STIGM-TEM(3rd)を使い、ビームを絞り込むときのカウスチック（手裏剣形の影）が軸対称（対称な形状）になるよう調整します。",
          en: "Use COND STIGM-TEM(3rd) on the left sub-panel to make the caustic shadow symmetric when condensing the beam.",
        },
        imageUrl: "/images/diagrams/p5_非点補正_3rd.png",
        annotation: { type: "highlight", x: 120, y: 80, width: 360, height: 240 },
        annotationLabel: "COND STIGM-TEM (3rd)",
        annotationDescription: "左サブパネルのCOND STIGM-TEM（3rd）つまみ。絞り込み時のビームの対称性（カウスチック）を補正します。手裏剣形が対称になるよう調整します。",
      },
      {
        id: "astig-s3",
        title: { ja: "2次非点の補正", en: "Correct 2nd Astigmatism" },
        text: {
          ja: "右サブパネルのCOND STIGM(2nd)を使い、コンデンサースポットが最も小さく、かつ正円になるように補正します。",
          en: "Use COND STIGM(2nd) on the right sub-panel to condense the spot into the smallest possible perfect circle.",
        },
        imageUrl: "/images/diagrams/p5_非点補正_2nd.png",
        annotation: { type: "highlight", x: 120, y: 80, width: 360, height: 240 },
        annotationLabel: "COND STIGM (2nd)",
        annotationDescription: "右サブパネルのCOND STIGM（2nd）つまみ。ビームスポットをきれいな正円形に補正します。丸い星形になるよう追い込みます。",
      }
    ]
  },
  default: {
    answer: {
      ja: "HF-2000の基本トラブルシューティング手順です。以下の操作が正しく行われているか確認してください。",
      en: "General HF-2000 troubleshooting guide. Please verify the following basic operations are correct.",
    },
    steps: [
      {
        id: "default-s1",
        title: { ja: "真空度ステータスの確認", en: "Verify Vacuum State" },
        text: {
          ja: "右メインパネルのVACUUM STATEが正常表示になっていることを確認してください（GUNがグリーン点滅、他3つがグリーン点灯）。",
          en: "Ensure the VACUUM STATE lamps on the right main panel are normal (GUN flashes green, other 3 light green).",
        },
        imageUrl: "/images/diagrams/p2_初期状態確認_右メインパネル.png",
        annotation: { type: "circle", x: 310, y: 110, width: 180, height: 100 },
        annotationLabel: "VACUUM STATE",
        annotationDescription: "右メインパネル上部の真空ステータス表示。通常時はGUNランプ点滅、他の3つが常時点灯していることを確認します。",
      },
      {
        id: "default-s2",
        title: { ja: "各種絞りの開放確認", en: "Verify Apertures Retracted" },
        text: {
          ja: "鏡筒の初期状態として、収束絞り、対物絞り、制限視野絞りが適切に抜かれているか確認してください。",
          en: "Make sure that the condenser aperture, objective aperture, and SAD aperture are retracted for startup.",
        },
        imageUrl: "/images/diagrams/p2_初期状態確認_鏡筒状態確認横.png",
        annotation: { type: "highlight", x: 430, y: 60, width: 140, height: 320 },
        annotationLabel: "各種絞りレバー",
        annotationDescription: "収束レンズ絞り・X線分析用絞り・対物絞り・制限視野絞りの各レバー。起動時はすべて抜かれていることを確認します。",
      }
    ]
  }
};

// -------------------------------------------------------------
// CHAT API CALL WITH FALLBACK
// -------------------------------------------------------------
/**
 * Sends a chat message to the configured backend API endpoint.
 * Falls back to mock data scenario matching keywords if endpoint is blank, or if forced.
 * 
 * @param message The natural language text input by the student
 * @param endpoint Optional backend API URL (POST request)
 * @param options Optional backend request state such as session and active figure
 * @returns Promise Resolves to ChatResponse containing answer, steps, and optional metadata
 */
export async function sendChatMessage(
  message: string,
  endpoint?: string,
  options: ChatRequestOptions = {},
): Promise<ChatResponse> {
  // Use user-provided endpoint first, fallback to DEFAULT_API_ENDPOINT
  const activeEndpoint = endpoint?.trim() || DEFAULT_API_ENDPOINT.trim();

  // Determine if we should mock this request
  if (FORCE_MOCK_MODE || !activeEndpoint) {
    // Simulate API network latency (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerMessage = message.toLowerCase();
    
    // Choose scenario based on keywords
    if (
      lowerMessage.includes("高圧") ||
      lowerMessage.includes("ビーム") ||
      lowerMessage.includes("レーザー") ||
      lowerMessage.includes("放電") ||
      lowerMessage.includes("フラッシング") ||
      lowerMessage.includes("laser") ||
      lowerMessage.includes("beam") ||
      lowerMessage.includes("volt")
    ) {
      return SCENARIOS.laser;
    } else if (
      lowerMessage.includes("試料") ||
      lowerMessage.includes("ホルダー") ||
      lowerMessage.includes("セット") ||
      lowerMessage.includes("交換") ||
      lowerMessage.includes("holder") ||
      lowerMessage.includes("sample")
    ) {
      return SCENARIOS.holder;
    } else if (
      lowerMessage.includes("ピント") ||
      lowerMessage.includes("フォーカス") ||
      lowerMessage.includes("focus") ||
      lowerMessage.includes("ぼやける") ||
      lowerMessage.includes("対物")
    ) {
      return SCENARIOS.focus;
    } else if (
      lowerMessage.includes("非点") ||
      lowerMessage.includes("astig") ||
      lowerMessage.includes("補正") ||
      lowerMessage.includes("収束")
    ) {
      return SCENARIOS.astig;
    }
    
    // Default mock response
    return SCENARIOS.default;
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(resolveAskEndpoint(activeEndpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        session_id: options.sessionId ?? getSessionId(),
        current_state: { active_figure_id: options.activeFigureId ?? DEFAULT_FIGURE_ID },
        lang: options.lang || null,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (!isAskResponse(data)) {
      throw new Error("Invalid API response shape");
    }
    return adaptAskResponse(data, options.lang);
  } catch (error: unknown) {
    console.error("Backend API connection failed:", error);
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error("API request timed out");
    }
    throw new Error(error instanceof Error ? error.message : "API Connection Error");
  } finally {
    window.clearTimeout(timeoutId);
  }
}
