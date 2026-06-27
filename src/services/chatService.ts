export interface Annotation {
  type: "circle" | "highlight" | "arrow";
  x: number; // coordinate out of 600 width
  y: number; // coordinate out of 400 height
  width: number;
  height: number;
}

export interface Step {
  id: string;
  title: string | { ja: string; en: string };
  text: string | { ja: string; en: string };
  annotation?: Annotation;
  imageId?: string;
  imageUrl?: string;
}

export interface ChatResponse {
  answer: string | { ja: string; en: string };
  steps: Step[];
  warnings?: string[] | string;
  slackContext?: string;
}

// -------------------------------------------------------------
// CONFIGURATION FLAGS
// -------------------------------------------------------------
// Force mock mode regardless of settings. Can be controlled via environment variables.
export const FORCE_MOCK_MODE = process.env.NEXT_PUBLIC_USE_MOCK === "true";

// Default backend API endpoint from environment variables (wired at build/runtime time).
export const DEFAULT_API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || "";

// -------------------------------------------------------------
// MOCK DATA SCENARIOS (Japanese default, English translation included)
// -------------------------------------------------------------
const SCENARIOS: Record<string, ChatResponse> = {
  laser: {
    answer: {
      ja: "確認手順を案内します。以下の4ステップでレーザー出力をチェックしてください。",
      en: "Here are the check procedures. Follow these 4 steps to check the laser output.",
    },
    warnings: [
      "レーザー光を直接覗き込まないでください。失明の危険があります。",
      "現在、この機材は冷却ファンに異音が発生する報告があります。",
    ],
    slackContext: "Slackにて山下さんより「昨日からレーザーの出力が15%ほど不安定になる場合がある」と共有されています。",
    steps: [
      {
        id: "laser-s1",
        title: { ja: "電源スイッチの確認", en: "Power Switch Check" },
        text: {
          ja: "本体の右側側面にある赤いメイン電源スイッチが ON (上側) に倒れているか確認してください。",
          en: "Check if the red main power switch on the right side panel is flipped to ON (up).",
        },
        annotation: { type: "circle", x: 452, y: 165, width: 46, height: 60 },
      },
      {
        id: "laser-s2",
        title: { ja: "安全カバー（インターロック）", en: "Safety Cover (Interlock)" },
        text: {
          ja: "安全カバーが完全にロック位置まで閉じているか確認します。カバーが開いた状態では、インターロック機能によりレーザーは出力されません。",
          en: "Make sure the safety cover is completely closed and locked. The laser will not emit if the cover is open due to the interlock feature.",
        },
        annotation: { type: "highlight", x: 110, y: 80, width: 300, height: 180 },
      },
      {
        id: "laser-s3",
        title: { ja: "キースイッチをONにする", en: "Turn Key Switch to ON" },
        text: {
          ja: "コントロールパネル of 物理キー（シリンダーキー）を右に90度回し、ON 位置に設定してください。",
          en: "Turn the physical key switch on the control panel 90 degrees clockwise to the ON position.",
        },
        annotation: { type: "arrow", x: 340, y: 290, width: 44, height: 44 },
      },
      {
        id: "laser-s4",
        title: { ja: "出力調整ダイヤルの設定", en: "Output Dial Setting" },
        text: {
          ja: "出力ダイヤルが 0 (最小) になっていないか確認し、ノブをゆっくり回して目的の出力レベルまで上げてください。",
          en: "Ensure the output dial is not set to 0 (minimum), and slowly rotate the knob to set the desired output level.",
        },
        annotation: { type: "circle", x: 215, y: 205, width: 72, height: 72 },
      },
    ],
  },
  power: {
    answer: {
      ja: "装置の電源が入らない場合のトラブルシューティング手順です。以下の3ステップを確認してください。",
      en: "Here are the troubleshooting steps when the device won't power on. Please check the following 3 steps.",
    },
    warnings: "感電防止のため、コンセント周辺を触る際は必ず手が乾いていることを確認してください。",
    slackContext: "Slackにて鈴木教授より「実験室Aの壁コンセントが一部停電している可能性がある」との報告があります。",
    steps: [
      {
        id: "power-s1",
        title: { ja: "電源プラグの確認", en: "Power Cord Connection" },
        text: {
          ja: "装置背面、または壁コンセントに電源プラグがしっかりと奥まで差し込まれているか目視で確認してください。",
          en: "Visually check that the power cord is firmly and fully plugged into the back of the device and the wall outlet.",
        },
        annotation: { type: "highlight", x: 90, y: 330, width: 26, height: 12 },
      },
      {
        id: "power-s2",
        title: { ja: "ブレーカーの確認", en: "Wall Breaker Check" },
        text: {
          ja: "壁コンセントの上部にある漏電遮断器（ブレーカー）が OFF (下側) に落ちていないか確認してください。",
          en: "Check if the leakage circuit breaker above the wall outlet has tripped to the OFF (down) position.",
        },
        annotation: { type: "highlight", x: 110, y: 80, width: 300, height: 180 },
      },
      {
        id: "power-s3",
        title: { ja: "管ヒューズの点検", en: "Fuse Holder Inspection" },
        text: {
          ja: "電源ソケットの直下にあるヒューズホルダーを引き出し、中のガラス管ヒューズが断線していないか点検してください。予備のヒューズは引き出し内に同梱されています。",
          en: "Pull out the fuse holder directly below the power inlet socket, and inspect if the glass tube fuse inside is blown. A spare fuse is included in the socket compartment.",
        },
        annotation: { type: "circle", x: 452, y: 165, width: 46, height: 60 },
      },
    ],
  },
  focus: {
    answer: {
      ja: "ピントが合わない場合の確認手順です。レンズやステージ周辺を以下の3ステップで確認してください。",
      en: "Here are the check procedures when focus cannot be obtained. Check the lenses and stage area with these 3 steps.",
    },
    warnings: "対物レンズの先端をスライドガラスにぶつけないよう、ステージを上昇させる際は側面から目視しつつ慎重に行ってください。",
    steps: [
      {
        id: "focus-s1",
        title: { ja: "対物レンズの緩み確認", en: "Check Objective Lens tightness" },
        text: {
          ja: "対物レンズ（レボルバー）がしっかりカチッと音がする位置まで回されているか、またレンズがネジ山に沿って斜めに緩んで装着されていないか確認してください。",
          en: "Check that the objective lens turret is clicked firmly into position, and that the lens itself is not loosely or diagonally threaded.",
        },
        annotation: { type: "highlight", x: 132, y: 112, width: 256, height: 70 },
      },
      {
        id: "focus-s2",
        title: { ja: "Z軸ストッパー（ステージロック）", en: "Z-Axis Stage Limiter" },
        text: {
          ja: "ステージの高さ上昇を制限する『Z制限ストッパーダイヤル』が締め付けられたままになっていないか確認し、ロックを少し緩めてください。",
          en: "Verify if the Z-stage limiter dial, which limits the stage height travel, is locked tight. Slightly loosen the limiter lock.",
        },
        annotation: { type: "circle", x: 251, y: 241, width: 72, height: 72 },
      },
      {
        id: "focus-s3",
        title: { ja: "微動ダイヤルによる微調整", en: "Fine Focus Adjustments" },
        text: {
          ja: "粗動ダイヤルで大まかな高さを合わせた後、コントロールパネル外側の微動ノブを用いて、サンプルがはっきりと見えるまでゆっくり微調整を行ってください。",
          en: "After adjusting the rough height with the coarse dial, use the fine focus knob on the outside to slowly adjust until the sample image is sharp.",
        },
        annotation: { type: "arrow", x: 251, y: 241, width: 50, height: 50 },
      },
    ],
  },
  default: {
    answer: {
      ja: "ご質問ありがとうございます。一般的なトラブル防止として、以下の基本手順を確認してください。",
      en: "Thank you for your question. For general troubleshooting, please verify the following basic steps.",
    },
    steps: [
      {
        id: "default-s1",
        title: { ja: "装置の再起動", en: "Restart the Device" },
        text: {
          ja: "装置本体の電源を一度OFFにし、10秒以上待ってから再度ONにしてシステムが正常にブートするか確認してください。",
          en: "Turn off the main power switch, wait for at least 10 seconds, then turn it back on to check if the system boots up normally.",
        },
        annotation: { type: "circle", x: 452, y: 165, width: 46, height: 60 },
      },
      {
        id: "default-s2",
        title: { ja: "ステータス画面のチェック", en: "Check Status Screen" },
        text: {
          ja: "本体前面の液晶ディスプレイにエラーコードや『ERR』などの警告灯が表示されていないか確認します。",
          en: "Check the LCD display on the front panel to see if any error codes or warning symbols like 'ERR' are flashing.",
        },
        annotation: { type: "highlight", x: 95, y: 150, width: 96, height: 64 },
      },
    ],
  },
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
 * @returns Promise Resolves to ChatResponse containing answer, steps, and optional metadata
 */
export async function sendChatMessage(message: string, endpoint?: string): Promise<ChatResponse> {
  // Use user-provided endpoint first, fallback to DEFAULT_API_ENDPOINT
  const activeEndpoint = endpoint?.trim() || DEFAULT_API_ENDPOINT.trim();

  // Determine if we should mock this request
  if (FORCE_MOCK_MODE || !activeEndpoint) {
    // Simulate API network latency (800ms)
    await new Promise((resolve) => setTimeout(resolve, 800));

    const lowerMessage = message.toLowerCase();
    
    // Choose scenario based on keywords
    if (
      lowerMessage.includes("レーザー") ||
      lowerMessage.includes("laser") ||
      lowerMessage.includes("出ない") ||
      lowerMessage.includes("出ません")
    ) {
      return SCENARIOS.laser;
    } else if (
      lowerMessage.includes("電源") ||
      lowerMessage.includes("power") ||
      lowerMessage.includes("入らない") ||
      lowerMessage.includes("つかない")
    ) {
      return SCENARIOS.power;
    } else if (
      lowerMessage.includes("ピント") ||
      lowerMessage.includes("focus") ||
      lowerMessage.includes("合わない") ||
      lowerMessage.includes("ぼやける")
    ) {
      return SCENARIOS.focus;
    }
    
    // Default mock response
    return SCENARIOS.default;
  }

  // Actual API Call
  try {
    const response = await fetch(activeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      answer: data.answer || "",
      steps: data.steps || [],
      warnings: data.warnings,
      slackContext: data.slackContext,
    };
  } catch (error: any) {
    console.error("Backend API connection failed:", error);
    throw new Error(error.message || "API Connection Error");
  }
}
