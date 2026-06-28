# Diagram Mapping Guide (Clean Trimmed Individual Diagrams)

This document maps all separate, aggressively cropped diagrams extracted from the HF-2000 PDF manual. The backend can send a `figure_id` (matching the Image ID below) and a `highlight_item` (matching the Item name below) in its `visual_data` response. The frontend resolves the specific image asset and overlays highlight markers dynamically.

---

## 🖼️ Coordinate System

- All highlights are mapped using a normalized grid coordinate system of **600 x 400** (independent of the display resolution).
- Image assets are stored in `/public/images/diagrams/`.

---

## 📋 Diagram Registry

### 1. `panel_right`
- **Description**: 右メインパネル
- **PDF Page**: Page 2
- **Asset**: `/images/diagrams/panel_right.png`
- **Highlight Items**:
  - `VACUUM STATE`: Vacuum indicator display area
  - `PANEL LAMP`: Main panel light button

### 2. `microscope_column`
- **Description**: 顕微鏡鏡筒と各種絞りレバー
- **PDF Page**: Page 2
- **Asset**: `/images/diagrams/microscope_column.png`
- **Highlight Items**:
  - `収束レンズ絞り`: Condenser aperture lever
  - `対物絞り`: Objective aperture lever
  - `制限視野絞り`: SAD aperture lever

### 3. `holder_pos_a`
- **Description**: 試料ホルダーA位置（排気位置）
- **PDF Page**: Page 3 / Page 2
- **Asset**: `/images/diagrams/holder_pos_a.png`
- **Highlight Items**:
  - `A位置`: Fully pulled-out position of the holder

### 4. `holder_pos_b`
- **Description**: 試料ホルダーB位置（中間位置）
- **PDF Page**: Page 3
- **Asset**: `/images/diagrams/holder_pos_b.png`
- **Highlight Items**:
  - `B位置`: 45-degree rotated intermediate insertion position

### 5. `sample_set`
- **Description**: 試料セット手順
- **PDF Page**: Page 3
- **Asset**: `/images/diagrams/sample_set.png`
- **Highlight Items**:
  - `試料押さえ`: Specimen clamping ring

### 6. `holder_rot_schematic`
- **Description**: ホルダー挿入・回転角度模式図
- **PDF Page**: Page 3
- **Asset**: `/images/diagrams/holder_rot_schematic.png`
- **Highlight Items**:
  - `回転軌道`: Rotation steps (A, B, C positions)

### 7. `panel_left_buttons`
- **Description**: 左メインパネル操作スイッチ
- **PDF Page**: Page 4
- **Asset**: `/images/diagrams/panel_left_buttons.png`
- **Highlight Items**:
  - `FLASH`: Flashing button
  - `I1C`: Emission current auto setting button
  - `FE`: Field Emission high voltage ON/OFF button

### 8. `subpanel_left_3rd_stig`
- **Description**: 左サブパネル（3rd Cond Stig）
- **PDF Page**: Page 5
- **Asset**: `/images/diagrams/subpanel_left_3rd_stig.png`
- **Highlight Items**:
  - `3rd Cond Stig`: 3rd condenser astigmatism dial

### 9. `subpanel_right_2nd_stig`
- **Description**: 右サブパネル（2nd Cond Stig）
- **PDF Page**: Page 5
- **Asset**: `/images/diagrams/subpanel_right_2nd_stig.png`
- **Highlight Items**:
  - `2nd Cond Stig`: 2nd condenser astigmatism dial

### 10. `caustic_handdrawn`
- **Description**: カウスチック非点補正波形図
- **PDF Page**: Page 5
- **Asset**: `/images/diagrams/caustic_handdrawn.png`
- **Highlight Items**:
  - `カウスチック波形`: Astigmatism caustic pattern drawing

### 11. `subpanel_left_obj_stigm`
- **Description**: 対物レンズ非点補正 (OBJ STIGM)
- **PDF Page**: Page 7
- **Asset**: `/images/diagrams/subpanel_left_obj_stigm.png`
- **Highlight Items**:
  - `RESET`: Stigmatism calibration reset button
  - `OBJ STIGM`: Objective astigmatism dial XY

### 12. `amorphous_contrast_overfocus`
- **Description**: 過焦点フリンジ幅像
- **PDF Page**: Page 7
- **Asset**: `/images/diagrams/amorphous_contrast_overfocus.png`
- **Highlight Items**:
  - `フリンジ`: Overfocused fringe lines

### 13. `amorphous_contrast_exact`
- **Description**: 正焦点コントラスト
- **PDF Page**: Page 7
- **Asset**: `/images/diagrams/amorphous_contrast_exact.png`
- **Highlight Items**:
  - `粒状構造`: Amorphous exact focus granular patterns

### 14. `diffraction_spot_brightfield`
- **Description**: 明視野像（BF像）選択
- **PDF Page**: Page 8
- **Asset**: `/images/diagrams/diffraction_spot_brightfield.png`
- **Highlight Items**:
  - `透過波選択`: Selection of the central direct beam spot

### 15. `diffraction_spot_lattice`
- **Description**: 格子像（高分解能像）選択
- **PDF Page**: Page 8
- **Asset**: `/images/diagrams/diffraction_spot_lattice.png`
- **Highlight Items**:
  - `多波干渉選択`: Selection of multiple diffraction spots

### 16. `beam_tilt_keys`
- **Description**: BEAM TILT 調整キー
- **PDF Page**: Page 10
- **Asset**: `/images/diagrams/beam_tilt_keys.png`
- **Highlight Items**:
  - `ALIGNMENT`: Sub-panel alignment direction buttons

### 17. `wobbler_trajectory`
- **Description**: Wobblerビーム調整軌跡
- **PDF Page**: Page 10
- **Asset**: `/images/diagrams/wobbler_trajectory.png`
- **Highlight Items**:
  - `軌跡補正`: Oval beam wobble correction line

### 18. `holder_exchange_schematic`
- **Description**: 試料ホルダー交換注意図
- **PDF Page**: Page 12
- **Asset**: `/images/diagrams/holder_exchange_schematic.png`
- **Highlight Items**:
  - `A位置警告`: Warning label about holder removal sequence

### 19. `edx_save_window`
- **Description**: EDXデータ保存先指定画面
- **PDF Page**: Page 15
- **Asset**: `/images/diagrams/edx_save_window.png`
- **Highlight Items**:
  - `EMSA保存`: EMSA file extension selection

### 20. `edx_peak_identification`
- **Description**: EDXスペクトルピーク同定画面
- **PDF Page**: Page 16
- **Asset**: `/images/diagrams/edx_peak_identification.png`
- **Highlight Items**:
  - `ピーク表示`: Element characteristic X-ray labels

### 21. `edx_periodic_table`
- **Description**: EDX元素選択周期表
- **PDF Page**: Page 17
- **Asset**: `/images/diagrams/edx_periodic_table.png`
- **Highlight Items**:
  - `元素選択`: Grid of periodic table elements

### 22. `edx_quant_settings`
- **Description**: EDX定量法(MBTS法)設定
- **PDF Page**: Page 17
- **Asset**: `/images/diagrams/edx_quant_settings.png`
- **Highlight Items**:
  - `MBTS`: Correction method selection

### 23. `ana_stig_left`
- **Description**: 左サブパネル（ANA非点補正）
- **PDF Page**: Page 19
- **Asset**: `/images/diagrams/ana_stig_left.png`
- **Highlight Items**:
  - `3rd. Cond.Stigma.-ANA`: Condenser astigmatism dial (ANA mode)

### 24. `ana_stig_right`
- **Description**: 右サブパネル（ANA非点補正）
- **PDF Page**: Page 19
- **Asset**: `/images/diagrams/ana_stig_right.png`
- **Highlight Items**:
  - `Cond.Stigma.`: Condenser astigmatism dial (ANA mode)

### 25. `c1_aperture_dial`
- **Description**: コンデンサー絞り (C1絞り) つまみ
- **PDF Page**: Page 20
- **Asset**: `/images/diagrams/c1_aperture_dial.png`
- **Highlight Items**:
  - `C1絞り`: Aperture selection dial

### 26. `edx_roi_mapping_map`
- **Description**: マッピングROI設定メニュー
- **PDF Page**: Page 24
- **Asset**: `/images/diagrams/edx_roi_mapping_map.png`
- **Highlight Items**:
  - `X-ray Map`: X-ray Map menu list item

### 27. `edx_roi_mapping_roi`
- **Description**: マッピング元素ライン設定
- **PDF Page**: Page 24
- **Asset**: `/images/diagrams/edx_roi_mapping_roi.png`
- **Highlight Items**:
  - `ROI`: ROI selection button

### 28. `dwell_time_setting`
- **Description**: Dwell Time測定パラメータ設定
- **PDF Page**: Page 25
- **Asset**: `/images/diagrams/dwell_time_setting.png`
- **Highlight Items**:
  - `Dwell Time`: Parameter fields

### 29. `acquire_mapping`
- **Description**: マッピング走査測定の開始
- **PDF Page**: Page 25
- **Asset**: `/images/diagrams/acquire_mapping.png`
- **Highlight Items**:
  - `Acquire`: Play symbol start scan button
