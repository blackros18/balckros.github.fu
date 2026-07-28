# Icon Audit — NextGen AI Labs (Figma)

File: `jzvd3OqAArvZ4AP7uyt3LF` — pages **Main design** (`0:1`) and **🎨 Design System** (`20:2`).

Everything below comes from rendering each icon symbol in the Figma file and comparing the
glyphs. The only icon source in the file is the component set **`Icons`**
(`54:2746`, frame "Icons" inside the `Design System` section) — **59 variants**, plus one
loose star used by the `Rating` component.

The **Main design** page does *not* draw only from that set — roughly nine out of ten icon
slots there are hand-placed artwork from a second, unrelated icon family. That is catalogued
separately in [§4](#4-off-system-icons-on-the-main-design-page).

> **Node IDs:** the `54:*` / `68:*` / `111:*` / `138:*` IDs in §1–§3 are on the Design System
> page (`20:2`) and are stable. The Main design page was re-created after this audit was
> first written — its nodes are now `276:*`, and any older ID for that page is dead.

---

## 1. Full inventory — `Icons` component set (59 variants)

| # | Variant name | Node | Glyph as drawn | Nearest Material Symbol |
|---|---|---|---|---|
| 1 | `Add` | 54:2747 | plus | `add` |
| 2 | `Dashboard` | 54:2750 | 2×2 squares | `dashboard` |
| 3 | `Admin` | 54:2753 | person + gear | `manage_accounts` |
| 4 | `Counsellor` | 54:2756 | person in circle badge | `support_agent` |
| 5 | `Clients` | 54:2759 | two people | `group` |
| 6 | `Transfer` | 54:2762 | two opposed horizontal arrows | `swap_horiz` |
| 7 | `Missed` | 54:2765 | calendar + × | `event_busy` |
| 8 | `analytics` | 54:2768 | bar chart in a box | `insert_chart` |
| 9 | `feedback` | 54:2771 | speech bubble + `!` | `feedback` |
| 10 | `settings` | 54:2774 | gear | `settings` |
| 11 | `logout` | 54:2777 | arrow out of bracket | `logout` |
| 12 | `keyboard arrow down` | 54:2780 | chevron down | `keyboard_arrow_down` |
| 13 | `notifications unread` | 54:2783 | bell + dot | `notifications_unread` |
| 14 | `arrow left` | 54:2787 | chevron left | `chevron_left` |
| 15 | `arrow right` | 54:2790 | chevron right | `chevron_right` |
| 16 | `Active` | 54:2793 | person + check | `how_to_reg` |
| 17 | `Decline` | 54:2796 | arrow bending down-right | — (glyph ≠ name) |
| 18 | `Upline` | 54:2799 | arrow trending up-right | `trending_up` |
| 19 | `post Assessments` | 54:2802 | document with lines | `assignment` |
| 20 | `Tick mark` | 54:2805 | check in circle | `check_circle` |
| 21 | `Download` | 54:2808 | arrow to baseline | `download` |
| 22 | `Three Dot` | 54:2811 | vertical ellipsis | `more_vert` |
| 23 | `Mail` | 54:2814 | envelope | `mail` |
| 24 | `Search bar` | 54:2817 | magnifier | `search` |
| 25 | `Intervention` | 54:2820 | handshake | `handshake` |
| 26 | `Question` | 54:2823 | `?` in circle | `help` |
| 27 | `User Acitvity` *(typo)* | 54:2826 | magnifier variant | `manage_search` |
| 28 | `Couple` | 54:2829 | two people | `group` |
| 29 | `Individual` | 54:2832 | single person + mark | `person` |
| 30 | `Inactive` | 54:2835 | person + × | `person_off` |
| 31 | `Eye` | 54:2838 | eye | `visibility` |
| 32 | `Language` | 54:2841 | 文A | `translate` |
| 33 | `drag_indicator` | 54:2844 | 6 dots | `drag_indicator` |
| 34 | `delete` | 54:2847 | trash can | `delete` |
| 35 | `info` | 54:2850 | `i` in circle | `info` |
| 36 | `edit` | 54:2853 | pencil | `edit` |
| 37 | `cancel` | 54:2856 | bare × | `close` |
| 38 | `Calendar` | 54:2859 | calendar | `calendar_month` |
| 39 | `Rupees` | 54:2862 | ₹ in circle | `currency_rupee_circle` |
| 40 | `Report` | 54:2865 | document with lines | `description` |
| 41 | `Send` | 54:2868 | right-pointing triangle outline | `send` |
| 42 | `Clock` | 54:2871 | clock face | `schedule` |
| 43 | `Chat` | 54:2874 | speech bubble with lines | `chat` |
| 44 | `Call` | 54:2877 | handset | `call` |
| 45 | `arrow_outward` | 54:2880 | diagonal arrow up-right | `arrow_outward` |
| 46 | `Save` | 54:2883 | floppy disk | `save` |
| 47 | `person_add` | 54:2886 | person + plus | `person_add` |
| 48 | `Merchant Dashboard` | 68:1729 | 2×2 squares | `dashboard` |
| 49 | `Order & AI Logs` | 68:1768 | list / receipt lines | `receipt_long` |
| 50 | `Automation Rules` | 68:1846 | lines + × | `rule` |
| 51 | `Widget` | 68:1692 | diamond in square | `widgets` |
| 52 | `Analytics` | 68:1906 | bar chart *(20×20)* | `analytics` |
| 53 | `Integrations` | 68:1998 | plug / cable | `cable` |
| 54 | `Usage & Plan` | 68:2023 | lightning bolt | `bolt` |
| 55 | `Filter` | 68:2126 | 3 decreasing lines | `filter_list` |
| 56 | `Play` | 111:1568 | right-pointing triangle | `play_arrow` |
| 57 | `Preview` | 111:2481 | box + diagonal arrow | `open_in_new` |
| 58 | `Code` | 111:2483 | `< >` | `code` |
| 59 | `Lock` | 138:7315 | padlock | `lock` |

Outside the set: `Rating / star_half` (`54:3569`, ×5 instances) renders as a **full** star
despite the `star_half` name.

---

## 2. Collisions — icons that are the same or too similar

| # | Pair / group | Nodes | Problem |
|---|---|---|---|
| C1 | `Dashboard` ↔ `Merchant Dashboard` | 54:2750, 68:1729 | **Identical glyph** (2×2 squares). Straight duplicate. |
| C2 | `analytics` ↔ `Analytics` | 54:2768, 68:1906 | Same concept, case-only name difference, one is 20×20 and one 24×24. |
| C3 | `Send` ↔ `Play` | 54:2868, 111:1568 | Both a bare right-pointing triangle — indistinguishable at 24 px. |
| C4 | `arrow_outward` ↔ `Preview` ↔ `Upline` | 54:2880, 111:2481, 54:2799 | Three diagonal up-right arrows. |
| C5 | `Search bar` ↔ `User Acitvity` | 54:2817, 54:2826 | Both magnifiers; differ only by a small inner detail. |
| C6 | `Clients` ↔ `Couple` | 54:2759, 54:2829 | Both "two people" glyphs. |
| C7 | `Individual` ↔ `person_add` ↔ `Active` | 54:2832, 54:2886, 54:2793 | Person + small badge, three near-identical silhouettes. |
| C8 | `feedback` ↔ `Chat` | 54:2771, 54:2874 | Both single speech bubbles. |
| C9 | `Report` ↔ `post Assessments` ↔ `Order & AI Logs` | 54:2865, 54:2802, 68:1768 | Three document/lines-in-a-box glyphs. |
| C10 | `cancel` ↔ `Decline` | 54:2856, 54:2796 | `cancel` is a bare ×; `Decline` is an arrow — the two names are swapped relative to their artwork. |
| C11 | `Calendar` ↔ `Missed` | 54:2859, 54:2765 | Same calendar body, differing only by the small ×. Acceptable as a family, but keep the × heavy. |
| C12 | `Dashboard` ↔ `Widget` | 54:2750, 68:1692 | Both square-grid marks; distinct enough only at large sizes. |

Non-collision defects worth fixing in the same pass:

- `User Acitvity` — spelling ("Activity").
- `analytics` / `Analytics`, `Dashboard` / `Merchant Dashboard` — inconsistent casing and
  naming style (`Title Case`, `lower case`, `snake_case` are all present in one set).
- `Analytics` (68:1906) is **20×20** in a 24×24 set.
- 7 variants sit at `y=44` instead of `y=20` inside the sheet frame — `Merchant Dashboard`,
  `Order & AI Logs`, `Automation Rules`, `Integrations`, `Play`, `Preview`, `Code`.
- `arrow left` (54:2787) is off-pixel: `x=486, y=44.000003`, size `24.000002`.
- `Rating / star_half` draws a full star.

---

## 3. Replacement set (downloaded)

All SVGs in this folder are **Google Material Symbols — Rounded, weight 400**, taken from
`@material-symbols/svg-400@0.45.9` (`rounded/`), the official Google icon set repackaged for
npm. Each file is a 24 dp grid drawing (`viewBox="0 -960 960 960"`), single path, `currentColor`.

| Collision | Variant | Use this file | Why it separates |
|---|---|---|---|
| C1 | `Dashboard` | `dashboard.svg` | keeps the grid mark |
| C1 | `Merchant Dashboard` | `storefront.svg` | shop front — reads as *merchant*, not *grid* |
| C2 | `Analytics` (single variant) | `analytics.svg` | one canonical chart icon at 24×24 |
| C2 | second analytics context, if kept | `query_stats.svg` | chart + magnifier, clearly not the plain chart |
| C3 | `Send` | `send.svg` | true paper-plane, not a triangle |
| C3 | `Play` | `play_circle.svg` | triangle inside a circle |
| C4 | `Upline` | `trending_up.svg` | polyline trend, not a straight arrow |
| C4 | `arrow_outward` | `arrow_outward.svg` | the only bare diagonal arrow left |
| C4 | `Preview` | `preview.svg` | window + eye |
| C5 | `Search bar` | `search.svg` | plain magnifier |
| C5 | `User Activity` | `person_search.svg` (alt: `manage_search.svg`) | person inside the lens |
| C6 | `Clients` | `groups.svg` | three-person cluster |
| C6 | `Couple` | `diversity_1.svg` | two figures + heart |
| C7 | `Individual` | `person.svg` | bare silhouette, no badge |
| C7 | `Active` | `how_to_reg.svg` | person + check |
| C7 | `Inactive` | `person_off.svg` | struck-through person |
| C7 | `person_add` | `person_add.svg` | person + plus |
| C7 | `Admin` | `manage_accounts.svg` | person + gear |
| C7 | `Counsellor` | `support_agent.svg` | person + headset |
| C8 | `feedback` | `feedback.svg` | bubble + `!` |
| C8 | `Chat` | `forum.svg` | two stacked bubbles |
| C9 | `Report` | `summarize.svg` | sheet with a summary rule |
| C9 | `post Assessments` | `assignment_turned_in.svg` | clipboard + check |
| C9 | `Order & AI Logs` | `receipt_long.svg` | long torn receipt |
| C10 | `cancel` → rename `close` | `close.svg` | bare × |
| C10 | `Decline` | `cancel.svg` | × inside a circle |
| C10 | `Tick mark` | `check_circle.svg` | check inside a circle (mirrors `cancel`) |
| C11 | `Calendar` | `calendar_month.svg` | plain calendar |
| C11 | `Missed` | `event_busy.svg` | calendar + full-size × |
| C12 | `Widget` | `widgets.svg` | offset tiles, not a 2×2 grid |
| — | `Automation Rules` | `rule_settings.svg` | rule list + gear |
| — | `Integrations` | `extension.svg` | puzzle piece — no cable/plug ambiguity |
| — | `Usage & Plan` | `data_usage.svg` | usage dial instead of a generic bolt |
| — | `Filter` | `filter_list.svg` | canonical filter |

35 SVGs, all Rounded / weight 400 / 24 dp.

### Applying them in Figma

1. Drag the SVG onto the `Icons` sheet (`54:2746`); Figma imports it as a 48×48 frame —
   resize to **24×24** and flatten to a single vector.
2. Swap it into the matching variant of the `Icons` component set so every instance across
   **Main design** updates automatically.
3. While in the set, also fix: the `y=44` variants back to `y=20`, `Analytics` from 20×20 to
   24×24, `arrow left` to integer coordinates, and rename
   `User Acitvity` → `User Activity`, `cancel` → `close`, `analytics`/`Analytics` → one variant.

---

## 4. Off-system icons on the Main design page

Scanned from the `Pro Plan` section (`276:2825`), which is representative of the whole
Main design page. Counts are for that section; the page-wide figure is given where it differs.

**Ratio: 42 `Icons` instances from the design system vs ~326 hand-placed icon slots.**

These are a different icon family altogether — thin rounded ~1.5 px stroke, frequently
colour-filled, drawn at 11–32 px — sitting alongside the 24 px Material-style `Icons` set.
Most are frames named `Icon` with no component behind them, so they update nowhere.

### 4.1 No equivalent in the design system — need to be added

| Glyph | Size | Uses | Example node | Where |
|---|---|---|---|---|
| Lightning bolt / zap (green) | 18 | — | `276:2851` | KPI cards |
| Bot / robot face (blue) | 18 | — | `276:2869` | KPI cards — AI decisions |
| Alert-circle with badge (red) | 18 | — | `276:2887` | KPI cards — chargebacks |
| Shield | 18 | — | `276:2905` | KPI cards — protection |
| Sparkles / AI stars (green) | 18 | — | `276:4421` | Widget · Visual Branding |
| Warning triangle (red) | 14 | — | `276:3202` | Activity feed |
| Refresh / rotate-cw (blue) | 14 | — | `276:3224` | Activity feed |
| Rocket | 16 | — | `276:3334` | Empty state |
| Shopping bag | 20 | — | `276:5482` | Integrations cards |
| Trend arrow down (red) | 12 | — | `276:5063` | Analytics & Reports |
| Shield-check | 24 | — | `276:7123` | Usage & Plan |
| Folder / small square | 11 | 1 | `276:4109` | Automation Rules |
| Arrow-up · arrow-up-left · arrow-down-left | 20 | 12 | `276:4499` · `276:4494` · `276:4509` | Widget position picker |

18 px KPI slots total 61 uses, 14 px feed slots 43, 20 px slots 12, 12 px slots 8.

### 4.2 Duplicate art for icons that already exist in the set

| Glyph | Size | Uses | Example node | Existing variant |
|---|---|---|---|---|
| `lock` | 16 | 48 *(195 page-wide)* | `276:6394` | `Lock` — `138:7315` |
| Sort caret — **raw vector**, not even a frame | 4.52×9.6 | 37 *(98 page-wide)* | `276:3763` | `keyboard arrow down` — `54:2780` |
| Check-circle (green, thin) | 14 / 15 | — | `276:3213`, `276:3648` | `Tick mark` — `54:2805` |
| Eye | 13 | — | `276:3085` | `Eye` — `54:2838` |
| External-link / open-in-new | 13 | — | `276:3111` | `Preview` — `111:2481` |
| Undo / curved arrow (amber, green) | 14 / 13 | — | `276:3235`, `276:4053` | `Decline` — `54:2796` |
| Filter / sort lines | 16 | 25 | `276:3037`, `276:4114` | `Filter` — `68:2126` |
| Search-with-dot, 2 variants | 15 | 24 | `276:3700`, `276:4074` | `Search bar` / `User Acitvity` |
| Arrow-right | 15 | — | `276:3043` | `arrow right` — `54:2790` *(a chevron)* |
| Trend arrow up (green) | 12 | — | `276:2860` | `Upline` — `54:2799` |
| Message-square bubble | 24 | 4 | `276:4598`, `276:4760` | `Chat` — `54:2874` |
| File-upload | 32 | 1 | `276:4794` | `Save` / `Download` |
| `logout` | 18 | 4 *(15 page-wide)* | `276:5002` | `logout` — `54:2777` |

13 px slots total 58 uses, 15 px 24, 16 px 25.

### 4.3 Empty icon slots

Frames named `Icon` that render nothing: `276:3919` (13 px) and `276:3999` (16 px), both on
Order & AI Logs.

### 4.4 Not icons — do not sweep these up

Line-chart, donut, stacked-bar and tooltip vectors under the `SVG` groups on Merchant
Dashboard (`276:2933`, `276:2977`) and Analytics & Reports (`276:5126`, `276:5164`,
`276:5284`), and the 40×40 colour swatches on Widget · Visual Branding (`276:4448`).

### 4.5 Three problems, in priority order

1. **A second icon family is in use.** The ~13 glyphs in §4.1 have no counterpart in the set
   at all — they need drawing and adding as variants, not just re-linking.
2. **Duplicate art for icons that already exist** (§4.2). Every one of these should become an
   instance of the existing variant; the sort caret in particular is loose vector art repeated
   98 times across the page.
3. **Off-grid sizing.** Icons appear at 11, 12, 13, 14, 15, 16, 18, 20, 24 and 32 px against a
   24 px set. Even correctly-sourced icons are being scaled arbitrarily — pick a size ramp
   (e.g. 16 / 20 / 24) and add it as a variant property instead.
