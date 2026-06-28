import type { Annotation } from "@/types/chat";

export interface DiagramHighlight {
  item: string;
  annotation: Annotation;
  description: string;
}

export interface DiagramData {
  id: string;
  name: string;
  url: string;
  highlights: Record<string, DiagramHighlight>;
}

export const DIAGRAMS: Record<string, DiagramData> = {
  "p2_初期状態確認_右メインパネル": {
    id: "p2_初期状態確認_右メインパネル",
    name: "Page 2 - 初期状態確認 (右メインパネル)",
    url: "/images/diagrams/p2_初期状態確認_右メインパネル.png",
    highlights: {
      "VACUUM STATE": {
        item: "VACUUM STATE",
        annotation: { type: "circle", x: 310, y: 110, width: 180, height: 100 },
        description: "右メインパネル上部の真空ステータス表示。通常時はGUNランプ点滅、他3つが常時点灯していることを確認します。"
      },
      "PANEL LAMP": {
        item: "PANEL LAMP",
        annotation: { type: "circle", x: 460, y: 220, width: 60, height: 60 },
        description: "メインパネル操作ダイヤル部のバックライト照明スイッチ。"
      },
      "ROOM LAMP": {
        item: "ROOM LAMP",
        annotation: { type: "circle", x: 580, y: 220, width: 60, height: 60 },
        description: "顕微鏡室の照明制御スイッチ。"
      },
    }
  },
  "p2_初期状態確認_鏡筒状態確認横": {
    id: "p2_初期状態確認_鏡筒状態確認横",
    name: "Page 2 - 鏡筒各部絞り確認 (横レイアウト)",
    url: "/images/diagrams/p2_初期状態確認_鏡筒状態確認横.png",
    highlights: {
      "収束レンズ絞り": {
        item: "収束レンズ絞り",
        annotation: { type: "highlight", x: 430, y: 60, width: 140, height: 60 },
        description: "収束レンズ（コンデンサー）絞りレバー。起動時はレバーが抜かれていることを確認します。"
      },
      "X線分析用絞り": {
        item: "X線分析用絞り",
        annotation: { type: "highlight", x: 430, y: 155, width: 140, height: 60 },
        description: "EDX分析時に使用するX線用絞りレバー。右側に倒れている（抜かれている）ことを確認します。"
      },
      "対物絞り": {
        item: "対物絞り",
        annotation: { type: "highlight", x: 430, y: 250, width: 140, height: 60 },
        description: "対物レンズ絞りレバー。起動時に抜かれていることを確認します。"
      },
      "制限視野絞り": {
        item: "制限視野絞り",
        annotation: { type: "highlight", x: 430, y: 320, width: 140, height: 60 },
        description: "制限視野回折（SAD）絞りレバー。起動時に抜かれていることを確認します。"
      },
    }
  },
  "p2_初期状態確認_鏡筒状態確認縦": {
    id: "p2_初期状態確認_鏡筒状態確認縦",
    name: "Page 2 - 鏡筒各部絞り確認 (縦レイアウト)",
    url: "/images/diagrams/p2_初期状態確認_鏡筒状態確認縦.png",
    highlights: {
      "収束レンズ絞り": {
        item: "収束レンズ絞り",
        annotation: { type: "highlight", x: 450, y: 60, width: 120, height: 60 },
        description: "収束レンズ絞りレバー。起動時は抜かれていることを確認します。"
      },
      "対物絞り": {
        item: "対物絞り",
        annotation: { type: "highlight", x: 450, y: 250, width: 120, height: 60 },
        description: "対物レンズ絞りレバー。起動時に抜かれていることを確認します。"
      },
    }
  },
  "p3_試料ホルダー": {
    id: "p3_試料ホルダー",
    name: "Page 3 - 試料ホルダーのセット",
    url: "/images/diagrams/p3_試料ホルダー.png",
    highlights: {
      "試料押さえ": {
        item: "試料押さえ",
        annotation: { type: "highlight", x: 100, y: 50, width: 400, height: 280 },
        description: "二軸傾斜ホルダーの試料押さえ固定部。広口を上にセットし、ネジ山を潰さないよう強く締めすぎないようにします。"
      },
    }
  },
  "p3_試料ホルダー_A位置": {
    id: "p3_試料ホルダー_A位置",
    name: "Page 3 - 試料ホルダーの挿入準備 (A位置)",
    url: "/images/diagrams/p3_試料ホルダー_A位置.png",
    highlights: {
      "A位置": {
        item: "A位置",
        annotation: { type: "highlight", x: 180, y: 80, width: 240, height: 160 },
        description: "シリンダの溝を合わせ、一番手前のA位置までまっすぐ差し込みます。"
      },
      "排気スイッチ": {
        item: "排気スイッチ",
        annotation: { type: "highlight", x: 40, y: 240, width: 120, height: 120 },
        description: "ホルダーを軽く指で押し込みながら、試料室排気スイッチを『EVAC』に切り替えます。"
      },
    }
  },
  "p3_試料ホルダー_B位置": {
    id: "p3_試料ホルダー_B位置",
    name: "Page 3 - 中間挿入 (B位置)",
    url: "/images/diagrams/p3_試料ホルダー_B位置.png",
    highlights: {
      "B位置": {
        item: "B位置",
        annotation: { type: "highlight", x: 220, y: 150, width: 180, height: 120 },
        description: "排気完了後ブザーが鳴る15秒の間に、時計方向に45°回して止まるまで挿入した中間位置（B位置）。"
      },
    }
  },
  "p3_試料ホルダー_図": {
    id: "p3_試料ホルダー_図",
    name: "Page 3 - 試料ホルダー回転角度模式図",
    url: "/images/diagrams/p3_試料ホルダー_図.png",
    highlights: {
      "A位置": {
        item: "A位置",
        annotation: { type: "circle", x: 300, y: 230, width: 60, height: 60 },
        description: "挿入開始および予備排気・大気リーク時の基準位置。"
      },
      "B位置": {
        item: "B位置",
        annotation: { type: "circle", x: 270, y: 120, width: 60, height: 60 },
        description: "時計回りに45°回転させて中間ロックされた位置。"
      },
      "C位置": {
        item: "C位置",
        annotation: { type: "circle", x: 160, y: 160, width: 60, height: 60 },
        description: "反時計回りに15°戻して観察位置まで完全に押し込んだ状態。"
      },
    }
  },
  "p4_フラッシュ": {
    id: "p4_フラッシュ",
    name: "Page 4 - 左メインパネル (フラッシング操作)",
    url: "/images/diagrams/p4_フラッシュ.png",
    highlights: {
      "FLASH": {
        item: "FLASH",
        annotation: { type: "circle", x: 270, y: 180, width: 80, height: 80 },
        description: "[FLASH]ボタン。ランプ点滅中に押してフラッシングパルスを印加します（0.4〜0.7mA目標）。"
      },
      "I1C": {
        item: "I1C",
        annotation: { type: "circle", x: 440, y: 180, width: 80, height: 80 },
        description: "[I1C]ボタン。昇圧から40分待機後、エミッション電流の自動制御を完了させるために使用します。"
      },
      "FE": {
        item: "FE",
        annotation: { type: "circle", x: 360, y: 290, width: 80, height: 80 },
        description: "[FE]高圧電源ON/OFFトグルキー。"
      },
    }
  },
  "p5_非点補正_2nd": {
    id: "p5_非点補正_2nd",
    name: "Page 5 - 2次収束非点補正 (右サブパネル)",
    url: "/images/diagrams/p5_非点補正_2nd.png",
    highlights: {
      "COND STIGM": {
        item: "COND STIGM",
        annotation: { type: "highlight", x: 120, y: 80, width: 360, height: 240 },
        description: "右サブパネルのCOND STIGM(2nd)つまみ。ビームスポットをきれいな正円形に補正します。"
      },
    }
  },
  "p5_非点補正_3rd": {
    id: "p5_非点補正_3rd",
    name: "Page 5 - 3次収束非点補正 (左サブパネル)",
    url: "/images/diagrams/p5_非点補正_3rd.png",
    highlights: {
      "COND STIGM-TEM": {
        item: "COND STIGM-TEM",
        annotation: { type: "highlight", x: 120, y: 80, width: 360, height: 240 },
        description: "左サブパネルのCOND STIGM-TEM(3rd)つまみ。絞り込み時のビームの対称性（カウスチック）を補正します。"
      },
    }
  },
  "p5_非点補正_実際のビュー": {
    id: "p5_非点補正_実際のビュー",
    name: "Page 5 - 非点カウスチック形状",
    url: "/images/diagrams/p5_非点補正_実際のビュー.png",
    highlights: {
      "カウスチック": {
        item: "カウスチック",
        annotation: { type: "highlight", x: 370, y: 50, width: 210, height: 300 },
        description: "3次非点を合わせる際、手裏剣形に見えるカウスチック模様。これを完全な点対称（手裏剣の羽が対称）に追い込みます。"
      },
    }
  },
  "p6_明度調整": {
    id: "p6_明度調整",
    name: "Page 6 - 輝度中心調整 (Brightness Centering)",
    url: "/images/diagrams/p6_明度調整.png",
    highlights: {
      "BRIGHTNESS CENTERING": {
        item: "BRIGHTNESS CENTERING",
        annotation: { type: "highlight", x: 150, y: 100, width: 300, height: 200 },
        description: "右メインパネルのBRIGHTNESS CENTERINGつまみ。ビームを絞ったときに中心位置にアライメントします。"
      },
    }
  },
  "p6_試料の位置調整": {
    id: "p6_試料の位置調整",
    name: "Page 6 - Z軸ステージコントロールつまみ",
    url: "/images/diagrams/p6_試料の位置調整.png",
    highlights: {
      "Zコントロール": {
        item: "Zコントロール",
        annotation: { type: "highlight", x: 200, y: 150, width: 200, height: 200 },
        description: "対物レンズの基準電流（OBJ: 5.72付近）に対し、試料の高さを物理的に上下させて正焦点に合わせるZコントロールノブ。"
      },
    }
  },
  "p6_試料の位置調整_実際のビュー": {
    id: "p6_試料の位置調整_実際のビュー",
    name: "Page 6 - 像の正焦点コントラスト変化",
    url: "/images/diagrams/p6_試料の位置調整_実際のビュー.png",
    highlights: {
      "像": {
        item: "像",
        annotation: { type: "highlight", x: 50, y: 50, width: 500, height: 300 },
        description: "Z軸を上下させて像の輪郭コントラストが最小になる点（またはWOBBLER動作時に像の揺れが止まる点）が試料の正焦点高さです。"
      },
    }
  },
  "p7_非点収差補正": {
    id: "p7_非点収差補正",
    name: "Page 7 - 対物非点補正ダイヤル (OBJ STIGM)",
    url: "/images/diagrams/p7_非点収差補正.png",
    highlights: {
      "RESET": {
        item: "RESET",
        annotation: { type: "circle", x: 250, y: 190, width: 100, height: 100 },
        description: "対物レンズ非点補正回路の基準リセットスイッチ。150K倍以下での観察では通常リセット状態で問題ありません。"
      },
      "OBJ STIGM": {
        item: "OBJ STIGM",
        annotation: { type: "highlight", x: 150, y: 80, width: 300, height: 150 },
        description: "OBJ STIGM-XYダイヤル。200K倍以上での観察時、アモルファスのフリンジを等方的に調整する際に使用します。"
      },
    }
  },
  "p7_非点収差補正_粒状構造": {
    id: "p7_非点収差補正_粒状構造",
    name: "Page 7 - アモルファス薄膜フリンジパターン",
    url: "/images/diagrams/p7_非点収差補正_粒状構造.png",
    highlights: {
      "フリンジ": {
        item: "フリンジ",
        annotation: { type: "highlight", x: 50, y: 50, width: 500, height: 300 },
        description: "過焦点（オーバーフォーカス）状態でフリンジ（白黒の干渉フチ）の幅が、円の全周（縦横斜め）で等しく対称になるようにOBJ STIGMダイヤルで追い込みます。"
      },
    }
  },
  "p8_明視野法": {
    id: "p8_明視野法",
    name: "Page 8 - 透過波選択と明視野・格子像モード図",
    url: "/images/diagrams/p8_明視野法.png",
    highlights: {
      "電子回折図形": {
        item: "電子回折図形",
        annotation: { type: "highlight", x: 100, y: 150, width: 160, height: 120 },
        description: "回折波（結晶面からの反射）ドットが集まった電子回折図形。"
      },
      "明視野像": {
        item: "明視野像",
        annotation: { type: "highlight", x: 320, y: 80, width: 180, height: 120 },
        description: "中心の透過波のみを選択し（他を絞りでカット）、コントラストを得る通常の顕微鏡像（明視野像）。"
      },
      "格子像": {
        item: "格子像",
        annotation: { type: "highlight", x: 320, y: 220, width: 180, height: 120 },
        description: "複数の回折斑点および透過波を干渉させて、結晶格子配列の規則線（フリンジ）を捉える格子像。"
      },
    }
  },
  "p10_beamtilt1": {
    id: "p10_beamtilt1",
    name: "Page 10 - BEAM TILT 調整キー",
    url: "/images/diagrams/p10_beamtilt1.png",
    highlights: {
      "ALIGNMENT": {
        item: "ALIGNMENT",
        annotation: { type: "highlight", x: 100, y: 100, width: 400, height: 200 },
        description: "左サブパネルにあるBTX, BTVX, BTY, BTVY方向キー。Wobbler動作中に像がブレないようにアライメントします。"
      },
    }
  },
  "p10_beamtilt2": {
    id: "p10_beamtilt2",
    name: "Page 10 - Wobbler振動アライメント軌跡",
    url: "/images/diagrams/p10_beamtilt2.png",
    highlights: {
      "軌道": {
        item: "軌道",
        annotation: { type: "highlight", x: 150, y: 100, width: 300, height: 200 },
        description: "ビームが振動した際の明るさ逃げ。楕円に広がってしまう軌跡を、一軸上の純粋な直線振動になるよう補正します。"
      },
    }
  },
  "p10_試料傾斜1": {
    id: "p10_試料傾斜1",
    name: "Page 10 - 二軸傾斜ホルダー用コネクタ接続",
    url: "/images/diagrams/p10_試料傾斜1.png",
    highlights: {
      "コネクタ": {
        item: "コネクタ",
        annotation: { type: "highlight", x: 200, y: 100, width: 200, height: 200 },
        description: "二軸ホルダー挿入後、傾斜コントロールケーブルのプラグを顕微鏡前面のソケットに慎重に差し込みます。"
      },
    }
  },
  "p10_試料傾斜2": {
    id: "p10_試料傾斜2",
    name: "Page 10 - 傾斜コントローラ（二軸傾斜装置）",
    url: "/images/diagrams/p10_試料傾斜2.png",
    highlights: {
      "電源スイッチ": {
        item: "電源スイッチ",
        annotation: { type: "circle", x: 100, y: 150, width: 80, height: 80 },
        description: "二軸傾斜用電源ユニットのPOWERスイッチをONにします。"
      },
    }
  },
  "p11_マイクロディフラクション": {
    id: "p11_マイクロディフラクション",
    name: "Page 11 - マイクロディフラクションアライメント",
    url: "/images/diagrams/p11_マイクロディフラクション.png",
    highlights: {
      "調整": {
        item: "調整",
        annotation: { type: "highlight", x: 100, y: 100, width: 400, height: 200 },
        description: "DIFFモード選択時、回折斑点の透過ビームが蛍光板のクロスヘア中心に来るように、左サブパネルのINT ALIGNを用いてアライメントします。"
      },
    }
  },
  "p12_試料交換": {
    id: "p12_試料交換",
    name: "Page 12 - 試料ホルダー取り出し注意マーク",
    url: "/images/diagrams/p12_試料交換.png",
    highlights: {
      "警告": {
        item: "警告",
        annotation: { type: "highlight", x: 150, y: 100, width: 300, height: 200 },
        description: "重大な警告：試料交換室排気スイッチを『AIR』にし、右パネルの『SPEC AIR』赤ランプが点灯することを確認する前に、ホルダーをA位置から引き抜かないでください。"
      },
    }
  },
};
