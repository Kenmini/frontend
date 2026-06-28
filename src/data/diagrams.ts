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
        annotation: { type: "highlight", x: 220, y: 100, width: 160, height: 80 },
        description: "右メインパネル上部の真空ステータス表示（拡大図）。通常時はGUNランプ点滅、他の３つが常時点灯していることを確認します。"
      },
      "PANEL LAMP / ROOM LAMP": {
        item: "PANEL LAMP / ROOM LAMP",
        annotation: { type: "highlight", x: 280, y: 190, width: 100, height: 50 },
        description: "パネルライトおよびルームランプスイッチ。PANEL LAMPはメインパネル照明、ROOM LAMPは顕微鏡室の照明制御スイッチです。"
      },
    }
  },
  "p2_初期状態確認_鏡筒状態確認横": {
    id: "p2_初期状態確認_鏡筒状態確認横",
    name: "Page 2 - 鏡筒絞り初期確認（横レイアウト）",
    url: "/images/diagrams/p2_初期状態確認_鏡筒状態確認横.png",
    highlights: {
      "A位置（約5cm）": {
        item: "A位置（約5cm）",
        annotation: { type: "highlight", x: 155, y: 90, width: 150, height: 50 },
        description: "試料ホルダーが鏡筒先端からおよそ5cmの位置（A位置）にあることを示す緑色の矢印。"
      },
      "EVACスイッチ": {
        item: "EVACスイッチ",
        annotation: { type: "highlight", x: 5, y: 175, width: 160, height: 55 },
        description: "試料交換排気スイッチがEVACになっていることを確認する。初期確認時はEVACであることが必要です。"
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
        annotation: { type: "circle", x: 185, y: 60, width: 50, height: 50 },
        description: "鏡筒上部の収束レンズ（コンデンサー）絞りレバー。起動時はレバーが抜かれていることを確認します。"
      },
      "X線分析用絞り": {
        item: "X線分析用絞り",
        annotation: { type: "circle", x: 185, y: 155, width: 50, height: 50 },
        description: "EDX分析時に使用するX線用絞りレバー。起動時は右側に倒れている（抜かれている）ことを確認します。"
      },
      "対物絞り": {
        item: "対物絞り",
        annotation: { type: "circle", x: 185, y: 248, width: 50, height: 50 },
        description: "対物レンズ絞りレバー。起動時に抜かれていることを確認します。"
      },
      "制限視野絞り": {
        item: "制限視野絞り",
        annotation: { type: "circle", x: 185, y: 345, width: 50, height: 50 },
        description: "制限視野回折（SAD）絞りレバー。起動時に抜かれていることを確認します。"
      },
    }
  },
  "p3_試料ホルダー": {
    id: "p3_試料ホルダー",
    name: "Page 3 - 試料ホルダーへの試料セット",
    url: "/images/diagrams/p3_試料ホルダー.png",
    highlights: {
      "試料押さえ（碗状カバー）": {
        item: "試料押さえ（碗状カバー）",
        annotation: { type: "highlight", x: 100, y: 5, width: 180, height: 100 },
        description: "碗状の試料押さえ。広口が上になるようにセットし、ネジ山を潰さないよう強く締めすぎないようにします。"
      },
      "ホルダー穴": {
        item: "ホルダー穴",
        annotation: { type: "circle", x: 155, y: 110, width: 70, height: 70 },
        description: "試料ホルダー先端の試料固定穴。ここに試料グリッドを落とし込みます。"
      },
    }
  },
  "p3_試料ホルダー_A位置": {
    id: "p3_試料ホルダー_A位置",
    name: "Page 3 - 試料ホルダーの挿入準備 (A位置)",
    url: "/images/diagrams/p3_試料ホルダー_A位置.png",
    highlights: {
      "A位置（約5cm）": {
        item: "A位置（約5cm）",
        annotation: { type: "highlight", x: 150, y: 100, width: 190, height: 50 },
        description: "シリンダの溝を合わせ、一番手前のA位置（約5cm）までまっすぐ差し込みます。"
      },
      "排気スイッチ（EVAC）": {
        item: "排気スイッチ（EVAC）",
        annotation: { type: "highlight", x: 5, y: 195, width: 120, height: 70 },
        description: "ホルダーをA位置まで軽く押し込みながら、試料室排気スイッチを「EVAC」に切り替えます。"
      },
    }
  },
  "p3_試料ホルダー_B位置": {
    id: "p3_試料ホルダー_B位置",
    name: "Page 3 - 中間挿入 (B位置)",
    url: "/images/diagrams/p3_試料ホルダー_B位置.png",
    highlights: {
      "B位置（約25cm）": {
        item: "B位置（約25cm）",
        annotation: { type: "highlight", x: 140, y: 145, width: 180, height: 50 },
        description: "排気完了後ブザーが鳴る15秒の間に、時計方向に45°回して止まるまで挿入した中間位置（B位置・約25cm）。"
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
        annotation: { type: "circle", x: 400, y: 160, width: 20, height: 20 },
        description: "挿入開始および予備排気・大気リーク時の基準位置（右端の○印）。"
      },
      "B位置": {
        item: "B位置",
        annotation: { type: "circle", x: 280, y: 42, width: 20, height: 20 },
        description: "時計回りに45°回転させて中間ロックされた位置（中央上の○印）。"
      },
      "C位置": {
        item: "C位置",
        annotation: { type: "circle", x: 62, y: 100, width: 20, height: 20 },
        description: "反時計回りに15°戻して観察位置まで完全に押し込んだ状態（左端の○印）。"
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
        annotation: { type: "circle", x: 128, y: 138, width: 40, height: 40 },
        description: "[FLASH]ボタン。ランプ点滅中に押してフラッシングパルスを印加します（0.4〜0.7mA目標）。"
      },
      "I1C": {
        item: "I1C",
        annotation: { type: "circle", x: 175, y: 138, width: 40, height: 40 },
        description: "[I1C]ボタン。昇圧から40分待機後、エミッション電流の自動制御を完了させるために使用します。"
      },
      "FE": {
        item: "FE",
        annotation: { type: "circle", x: 152, y: 190, width: 40, height: 40 },
        description: "[FE]高圧電源ON/OFFトグルキー。これを押してから[FLASH]点滅中に[FLASH]を押します。"
      },
    }
  },
  "p5_非点補正_2nd": {
    id: "p5_非点補正_2nd",
    name: "Page 5 - 2次収束非点補正 (右サブパネル)",
    url: "/images/diagrams/p5_非点補正_2nd.png",
    highlights: {
      "COND STIGM（2nd）": {
        item: "COND STIGM（2nd）",
        annotation: { type: "highlight", x: 48, y: 110, width: 230, height: 110 },
        description: "右サブパネルのCOND STIGM（2nd）つまみ。ビームスポットをきれいな正円形に補正します。"
      },
      "目標形状（丸い星形）": {
        item: "目標形状（丸い星形）",
        annotation: { type: "circle", x: 390, y: 30, width: 210, height: 240 },
        description: "2次非点補正後の目標ビーム形状。縦横が均等な丸い星形（手裏剣形）になるよう追い込みます。"
      },
    }
  },
  "p5_非点補正_3rd": {
    id: "p5_非点補正_3rd",
    name: "Page 5 - 3次収束非点補正 (左サブパネル)",
    url: "/images/diagrams/p5_非点補正_3rd.png",
    highlights: {
      "COND STIGM-TEM（3rd）": {
        item: "COND STIGM-TEM（3rd）",
        annotation: { type: "highlight", x: 0, y: 50, width: 100, height: 170 },
        description: "左サブパネルのCOND STIGM-TEM（3rd）つまみ。絞り込み時のビームの対称性（カウスチック）を補正します。"
      },
      "非対称カウスチック形状": {
        item: "非対称カウスチック形状",
        annotation: { type: "circle", x: 390, y: 30, width: 210, height: 240 },
        description: "3次非点がある状態のカウスチック形状。四方が内側にへこんだ非対称な形。これを手裏剣形に補正します。"
      },
    }
  },
  "p5_非点補正_実際のビュー": {
    id: "p5_非点補正_実際のビュー",
    name: "Page 5 - 非点カウスチック形状（実際のビュー）",
    url: "/images/diagrams/p5_非点補正_実際のビュー.png",
    highlights: {
      "カウスチック（手裏剣形）": {
        item: "カウスチック（手裏剣形）",
        annotation: { type: "circle", x: 40, y: 40, width: 260, height: 280 },
        description: "3次非点を合わせる際に見える手裏剣形のカウスチック模様。これを完全な点対称に追い込みます。"
      },
    }
  },
  "p6_明度調整": {
    id: "p6_明度調整",
    name: "Page 6 - 輝度中心調整 (Brightness Centering)",
    url: "/images/diagrams/p6_明度調整.png",
    highlights: {
      "中心収束スポット": {
        item: "中心収束スポット",
        annotation: { type: "circle", x: 145, y: 168, width: 35, height: 35 },
        description: "BRIGHTNESS CENTERINGで中心に合わせるべきスポット。ビームを絞ったときにここに輝点が来るよう調整します。"
      },
      "ビーム軌道": {
        item: "ビーム軌道",
        annotation: { type: "highlight", x: 60, y: 60, width: 270, height: 260 },
        description: "BRIGHTNESSを変化させたとき、ビームが同心円状に広がるよう（中心が動かないよう）BRIGHTNESS CENTERINGで調整します。"
      },
    }
  },
  "p6_試料の位置調整": {
    id: "p6_試料の位置調整",
    name: "Page 6 - Z軸コントロールつまみ",
    url: "/images/diagrams/p6_試料の位置調整.png",
    highlights: {
      "Zコントロールつまみ": {
        item: "Zコントロールつまみ",
        annotation: { type: "highlight", x: 70, y: 175, width: 110, height: 90 },
        description: "対物レンズの基準電流（OBJ: 5.72付近）に対し、試料の高さを物理的に上下させて正焦点に合わせるZコントロールノブ。"
      },
    }
  },
  "p6_試料の位置調整_実際のビュー": {
    id: "p6_試料の位置調整_実際のビュー",
    name: "Page 6 - 像の正焦点コントラスト変化（実際のビュー）",
    url: "/images/diagrams/p6_試料の位置調整_実際のビュー.png",
    highlights: {
      "像全体": {
        item: "像全体",
        annotation: { type: "highlight", x: 10, y: 10, width: 285, height: 285 },
        description: "Z軸を上下させて像の輪郭コントラストが最小になる点（またはWOBBLER動作時に像の揺れが止まる点）が正焦点高さです。"
      },
    }
  },
  "p7_非点収差補正": {
    id: "p7_非点収差補正",
    name: "Page 7 - 対物非点補正ダイヤル (OBJ STIGM) - 左サブパネル",
    url: "/images/diagrams/p7_非点収差補正.png",
    highlights: {
      "OBJ STIGM（X・Y）": {
        item: "OBJ STIGM（X・Y）",
        annotation: { type: "highlight", x: 95, y: 20, width: 270, height: 270 },
        description: "OBJ STIGM-XYダイヤルとRESETボタンを含む緑枠エリア。200K倍以上での観察時、アモルファスのフリンジを等方的に調整する際に使用します。"
      },
      "RESET": {
        item: "RESET",
        annotation: { type: "circle", x: 205, y: 118, width: 55, height: 40 },
        description: "対物レンズ非点補正回路の基準リセットボタン（RESETと矢印が指す小ボタン）。150K倍以下の観察では通常リセット状態で問題ありません。"
      },
    }
  },
  "p7_非点収差補正_粒状構造": {
    id: "p7_非点収差補正_粒状構造",
    name: "Page 7 - アモルファス薄膜フリンジパターン（補正前後）",
    url: "/images/diagrams/p7_非点収差補正_粒状構造.png",
    highlights: {
      "補正済み（等方的フリンジ）": {
        item: "補正済み（等方的フリンジ）",
        annotation: { type: "highlight", x: 10, y: 10, width: 318, height: 300 },
        description: "過焦点（オーバーフォーカス）状態で縦横斜め全方向のフリンジ幅が等しく対称な状態（補正完了）。"
      },
      "非点あり（一方向フリンジ）": {
        item: "非点あり（一方向フリンジ）",
        annotation: { type: "highlight", x: 343, y: 10, width: 320, height: 300 },
        description: "非点収差がある状態。フリンジが横縞方向にのみ揃っており、OBJ STIGM-XYで追い込みが必要な状態。"
      },
    }
  },
  "p8_明視野法": {
    id: "p8_明視野法",
    name: "Page 8 - 透過波選択と明視野・格子像モード図",
    url: "/images/diagrams/p8_明視野法.png",
    highlights: {
      "電子回折図形（上・BF用）": {
        item: "電子回折図形（上・BF用）",
        annotation: { type: "highlight", x: 10, y: 10, width: 220, height: 230 },
        description: "上段の電子回折図形。中心の透過波（白丸）のみを選択することで明視野像が得られます。"
      },
      "明視野像": {
        item: "明視野像",
        annotation: { type: "highlight", x: 305, y: 25, width: 200, height: 200 },
        description: "中心の透過波のみを選択し（他を絞りでカット）、コントラストを得る通常の顕微鏡像（明視野像）。"
      },
      "電子回折図形（下・格子像用）": {
        item: "電子回折図形（下・格子像用）",
        annotation: { type: "highlight", x: 10, y: 275, width: 220, height: 230 },
        description: "下段の電子回折図形。大きな絞りで透過波＋複数の回折波を同時に選択することで格子（多波干渉）像が得られます。"
      },
      "格子（多波干渉）像": {
        item: "格子（多波干渉）像",
        annotation: { type: "highlight", x: 305, y: 285, width: 200, height: 200 },
        description: "複数の回折斑点および透過波を干渉させて、結晶格子配列の規則線（フリンジ）を捉える格子（多波干渉）像。"
      },
    }
  },
  "p10_beamtilt1": {
    id: "p10_beamtilt1",
    name: "Page 10 - Wobbler未調整時のビーム軌道（楕円）",
    url: "/images/diagrams/p10_beamtilt1.png",
    highlights: {
      "楕円軌道": {
        item: "楕円軌道",
        annotation: { type: "highlight", x: 35, y: 30, width: 160, height: 200 },
        description: "未調整状態。ビームが振動すると楕円形の軌道を描きます。COMA FREE ALIGNMENT（BTX/BTVX/BTY/BTVY）で修正します。"
      },
    }
  },
  "p10_beamtilt2": {
    id: "p10_beamtilt2",
    name: "Page 10 - Wobbler調整済みのビーム軌道（直線）",
    url: "/images/diagrams/p10_beamtilt2.png",
    highlights: {
      "直線往復軌道": {
        item: "直線往復軌道",
        annotation: { type: "highlight", x: 50, y: 30, width: 130, height: 225 },
        description: "調整完了状態。ビームが一軸上の純粋な直線振動になっており、これが目標形状です。"
      },
    }
  },
  "p10_試料傾斜1": {
    id: "p10_試料傾斜1",
    name: "Page 10 - 傾斜コントローラー方向ダイヤル（4方向）",
    url: "/images/diagrams/p10_試料傾斜1.png",
    highlights: {
      "HAND LEFT（上）": {
        item: "HAND LEFT（上）",
        annotation: { type: "highlight", x: 130, y: 30, width: 155, height: 120 },
        description: "上方向（HAND LEFT）への傾斜制御。暗い灰色の矢印で表示。"
      },
      "FOOT RIGHT（右）": {
        item: "FOOT RIGHT（右）",
        annotation: { type: "highlight", x: 260, y: 130, width: 150, height: 140 },
        description: "右方向（FOOT RIGHT）への傾斜制御。黒い矢印で表示。"
      },
      "FOOT LEFT（左）": {
        item: "FOOT LEFT（左）",
        annotation: { type: "highlight", x: 0, y: 200, width: 160, height: 130 },
        description: "左方向（FOOT LEFT）への傾斜制御。黒い矢印で表示。"
      },
      "HAND RIGHT（下）": {
        item: "HAND RIGHT（下）",
        annotation: { type: "highlight", x: 125, y: 255, width: 165, height: 120 },
        description: "下方向（HAND RIGHT）への傾斜制御。暗い灰色の矢印で表示。"
      },
    }
  },
  "p10_試料傾斜2": {
    id: "p10_試料傾斜2",
    name: "Page 10 - 傾斜コントローラー（調整後・2方向のみ）",
    url: "/images/diagrams/p10_試料傾斜2.png",
    highlights: {
      "HAND LEFT（上）": {
        item: "HAND LEFT（上）",
        annotation: { type: "highlight", x: 130, y: 35, width: 155, height: 130 },
        description: "上方向（HAND LEFT）への傾斜。暗い灰色矢印。"
      },
      "FOOT RIGHT（右）": {
        item: "FOOT RIGHT（右）",
        annotation: { type: "highlight", x: 255, y: 175, width: 160, height: 130 },
        description: "右方向（FOOT RIGHT）への傾斜。黒い矢印。この2方向のみが表示されるのが正しく調整された目標状態。"
      },
    }
  },
  "p11_マイクロディフラクション": {
    id: "p11_マイクロディフラクション",
    name: "Page 11 - マイクロディフラクション INT ALIGNつまみ",
    url: "/images/diagrams/p11_マイクロディフラクション.png",
    highlights: {
      "INT ALIGN（X・Y）": {
        item: "INT ALIGN（X・Y）",
        annotation: { type: "highlight", x: 30, y: 20, width: 185, height: 115 },
        description: "DIFFモード選択時、回折斑点の透過ビームが蛍光板のクロスヘア中心に来るように、左サブパネルのINT ALIGN（X・Y）を用いてアライメントします。"
      },
    }
  },
  "p12_試料交換": {
    id: "p12_試料交換",
    name: "Page 12 - 試料ホルダー取り出し手順図（警告付き）",
    url: "/images/diagrams/p12_試料交換.png",
    highlights: {
      "A位置": {
        item: "A位置",
        annotation: { type: "circle", x: 330, y: 120, width: 20, height: 20 },
        description: "試料取り出しの最終手前位置。ここまで引き出した後にAIRスイッチを操作します。"
      },
      "B位置": {
        item: "B位置",
        annotation: { type: "circle", x: 258, y: 35, width: 20, height: 20 },
        description: "取り出し手順の中間位置。時計方向に15°回してB位置にします。"
      },
      "C位置": {
        item: "C位置",
        annotation: { type: "circle", x: 25, y: 75, width: 20, height: 20 },
        description: "観察位置（最も奥まで挿入された状態）。取り出し時はここからB位置、A位置の順に操作します。"
      },
      "警告：AIR前に抜かない": {
        item: "警告：AIR前に抜かない",
        annotation: { type: "highlight", x: 195, y: 160, width: 325, height: 85 },
        description: "重大警告：試料交換室排気スイッチを「AIR」にし、SPEC AIR赤ランプが点灯することを確認する前に、ホルダーをA位置から引き抜かないでください。"
      },
    }
  },
};
