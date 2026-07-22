---
version: alpha
name: CrowdStrike Falcon
description: "Near-black (#0d1117 / #161b22) SOC-optimized dark interface. CrowdStrike Red (#EE3124) appears only for Critical alerts — its rarity preserves signal fidelity. Dense endpoint tables, threat timelines, and 5-tier severity with unambiguous color coding. Mission-critical software for 24/7 security operations."

colors:
  primary: "#EE3124"
  on-primary: "#FFFFFF"
  primary-hover: "#D42A1E"
  ink: "#E6EDF3"
  ink-muted: "#8B949E"
  ink-subdued: "#6E7681"
  canvas: "#0d1117"
  surface-1: "#161b22"
  surface-2: "#21262d"
  surface-3: "#2D333B"
  border: "#30363D"
  border-subtle: "#21262d"
  severity-critical: "#EE3124"
  severity-high: "#FF6B00"
  severity-medium: "#F5A623"
  severity-low: "#00DC82"
  severity-info: "#6B7280"
  interactive: "#58A6FF"
  interactive-hover: "#79C0FF"
  success: "#3FB950"
  monospace-ink: "#A5D6FF"

typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: -0.02em
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif"
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0em

spacing:
  base: 4px
  scale: [4, 8, 12, 16, 20, 24, 32, 40, 48, 64]

radius:
  sm: 4px
  md: 6px
  lg: 8px
  pill: 9999px

shadows:
  card: "0 1px 4px rgba(0,0,0,0.4)"
  elevated: "0 4px 16px rgba(0,0,0,0.6)"
  modal: "0 8px 40px rgba(0,0,0,0.8)"

motion:
  duration-fast: 100ms
  duration-base: 200ms
  easing: cubic-bezier(0.4, 0, 0.2, 1)
---

## Rationale

**Dark for the ops center, not for aesthetics** — CrowdStrike Falcon runs in Security Operations Centers where analysts work 8–12 hour shifts in low-light environments, staring at threat dashboards through the night. The #0d1117 near-black background is not a design trend — it is a direct response to the operational environment. Reduced screen glare, less eye strain, and lower ambient light emission make sustained 24/7 monitoring possible. This is the same reasoning behind aircraft cockpit displays and hospital monitoring systems being dark-background.

**Critical red must earn every appearance** — CrowdStrike Red (#EE3124) is the company's brand color, but in the Falcon interface it appears in exactly one semantic context: Critical severity alerts. This is the most consequential design decision in the system. When a SOC analyst glances at their screen and sees red, they know — without reading — that something critical requires immediate attention. If red were diluted into navigation, headings, or decorative elements, the critical alert signal would be destroyed. The restraint is not brand timidity — it is signal fidelity as a security function.

**5-tier severity as operational vocabulary** — Security events are not binary. A misconfigured firewall is not the same priority as an active ransomware execution. Falcon's 5-tier severity system (Critical / High / Medium / Low / Informational) maps to a precisely calibrated color scale: red / orange / amber / green / gray. These colors are the operational language of the SOC — analysts, incident responders, and threat hunters all work in this vocabulary daily. The design system exists to make that vocabulary instantly parseable under pressure.

**Dense data for professionals under pressure** — A threat hunter investigating an active incident needs to see endpoint telemetry, process trees, network connections, and registry changes simultaneously. A detection engineer needs to scan 500 detection events in 30 seconds to triage what requires human response. Falcon's UI must pack extraordinary amounts of structured information into limited screen space without sacrificing readability. Small type (13px), compact row heights, and information-dense layouts are not aesthetic failures — they are tools for people who use them under operational pressure.

## 1. Visual Theme & Atmosphere
Falcon presents a deep, layered darkness that communicates operational seriousness. The three-level surface hierarchy (#0d1117 canvas, #161b22 primary surface, #21262d elevated surface) creates depth and spatial organization without any light or color. The experience is that of looking at a sophisticated instrument panel — every visual element is purposeful.

The navigation is a left sidebar in #161b22, approximately 220px wide. Main content areas are #0d1117. Modals and elevated panels use #21262d. This creates a consistent depth model where surfaces that are more "above" the canvas are slightly lighter — the inverse of the material world, but consistent and learnable.

## 2. Color System
**Dark surface system**:
- Canvas: #0d1117 — deepest layer, page background
- Surface 1: #161b22 — primary cards, sidebar navigation, panel backgrounds
- Surface 2: #21262d — elevated elements, dropdown menus, secondary panels
- Surface 3: #2D333B — hover states, tertiary surfaces
- Border: #30363D — card edges, table row dividers
- Border subtle: #21262d — internal section dividers

**Text**:
- Primary ink: #E6EDF3 — near-white, the primary reading color on all dark surfaces
- Muted: #8B949E — secondary metadata, column headers, timestamps
- Subdued: #6E7681 — tertiary information, disabled states

**Interactive (non-alert)**:
- Interactive blue: #58A6FF — links, clickable identifiers, interactive labels
- Hover: #79C0FF — on interaction

**Severity scale** (the most critical design tokens in the system):
- Critical (5): #EE3124 — active intrusions, ransomware, credential theft in progress
- High (4): #FF6B00 — significant threats requiring same-shift response
- Medium (3): #F5A623 — threats requiring investigation, elevated risk
- Low (2): #00DC82 — informational detections, policy violations, low-risk anomalies
- Informational (1): #6B7280 — telemetry events, audit logs, expected behaviors

**System status**:
- Agent active / host online: #3FB950 green
- Alert/success confirmation: #3FB950

**Monospace data**:
- #A5D6FF — log output, command lines, file paths, process names in code-style displays

## 3. Typography
Falcon uses Inter for the UI layer. At 13px body — the density that security tooling requires — Inter's consistent character widths and open forms prevent the visual fatigue that comes from reading degraded or compressed typefaces at small sizes.

Monospace is a first-class font in Falcon: process command lines, registry paths, file system paths, network connection strings, and log event text all render in a code font (typically JetBrains Mono or system monospace fallback). Monospace is not cosmetic — it is semantically meaningful. When text renders in monospace, the analyst knows they are reading machine-generated data, not human-authored labels. This distinction matters during incident response.

Display headings (dashboard titles, module headers): 28px weight 700. Section headers within dashboards: 18px weight 600. Panel section labels: 13px weight 600 in muted ink.

## 4. Components & Patterns
**Detection event card**:
- Severity badge (color-coded pill): Critical / High / Medium / Low / Info
- Event name (bold, 14px), timestamp, affected endpoint hostname
- Tactic and technique tags (MITRE ATT&CK framework tags as small pills)
- "Investigate" button (blue interactive)

**Endpoint table**:
- Columns: Hostname, IP, OS, Agent Version, Prevention Policy, Last Seen, Status
- Status column: green dot "Online" / gray dot "Offline" / orange dot "Reduced Functionality"
- Sortable headers; bulk action checkboxes
- Row hover reveals inline quick-action buttons

**Threat event timeline**:
- Vertical chronological sequence of events for a detection
- Each event: timestamp, event type icon, process name, event description
- Color-coded event type icons: process (blue), network (green), registry (amber), file (purple)
- Expandable event rows with full telemetry JSON

**Process tree visualization**:
- Hierarchical tree showing parent→child process relationships
- Suspicious or malicious nodes highlighted in severity colors
- Click a node to see command line, file path, hash, network connections in a right panel

**Threat intelligence graph** (Threat Intelligence module):
- Force-directed graph showing relationship between actors, malware families, CVEs, and campaigns
- Node types: actor (red), malware (orange), CVE (amber), campaign (blue), victim industry (gray)
- Zoom, pan, and click to expand relationships

**Alert severity badge**:
- Pill shape, severity color fill, white text, 12px font, 4px 8px padding
- Used consistently in all detection views, email notifications, and API responses

## 5. Spacing & Layout
Falcon uses a 4px base grid. The main sidebar nav is 220px wide (collapsible to 48px icon-only mode for more screen real estate during incident response). Top app bar: 48px. Content area padding: 20px.

Detection table row height: 40px — compact but click-safe. Panel padding: 16px. Between dashboard cards: 12px. Full-page investigation layouts collapse the left nav to maximize the content area for complex visualizations.

## 6. Motion & Interaction
Motion is minimal and purposeful. New detection events added to a table use a brief 200ms highlight flash in the severity color to draw attention before settling to the normal row appearance — critical for SOC analysts who need to notice newly arriving events without constantly watching the top of the list.

Critical and High severity alerts trigger a notification badge animation on the nav item — a pulsing red/orange dot that persists until viewed. This persistent indicator is intentional: in high-noise environments, analysts need a reliable visual cue that high-priority items are waiting.

All other motion: 100–200ms transitions, no decorative animations. Modals appear at 150ms fade. No page-level transitions — speed is essential when navigating an active incident.

## Accessibility

### Contrast Ratios
- **#E6EDF3 on #0d1117 canvas**: 15.3:1 — passes AAA
- **#8B949E muted on #0d1117**: 5.4:1 — passes AA
- **#6E7681 subdued on #0d1117**: 3.8:1 — fails AA; use only for non-essential decorative text
- **#FFFFFF on #EE3124 critical**: 4.5:1 — passes AA (borderline)
- **#FFFFFF on #FF6B00 high**: 3.1:1 — fails AA; severity badges should use larger text (14px+, bold)
- **#FFFFFF on #F5A623 medium**: 2.6:1 — fails AA; same — use larger bold text or pair with text label
- **#1F1F1F on #00DC82 low**: 9.8:1 — passes AAA
- **#E6EDF3 on #161b22 surface-1**: 13.4:1 — passes AAA
- **#58A6FF interactive on #0d1117**: 7.0:1 — passes AAA

### Minimum Requirements
- **Severity indication**: always color + text label + (where space permits) icon — never color-only; essential for colorblind analysts
- **Focus indicator**: 2px solid #58A6FF outline on interactive elements; 2px solid #EE3124 on destructive actions
- **Alert notifications**: persistent badges (not just flashes) for critical alerts — screen reader announcements via aria-live="assertive" for new Critical/High events
- **Touch targets**: 44×44px minimum; Falcon mobile requires careful attention to action target sizes

### Motion
- Respects `prefers-reduced-motion`: yes — new event highlight flash, pulse animation on alert badges both suppressed
- Under reduced-motion, new events still appear (no animation) but use a persistent bold indicator rather than fading in

### Notes
- #FF6B00 (High) and #F5A623 (Medium) fail AA against white (3.1:1 and 2.6:1 respectively) — these colors should only be used in severity badges at 14px+ bold or as background fills for larger UI regions, never as body text
- The 5-tier severity system must be tested with colorblind simulation (deuteranopia, protanopia) — red/orange/amber distinctions can collapse; always pair with text label and numeric tier
- SOC environments often use color calibration profiles that flatten colors; severity color selection should be tested on standard office monitors, not design-calibrated displays
- The monospace ink (#A5D6FF) on #0d1117 achieves 11.2:1 — AAA compliant, appropriate for the dense log data it presents
