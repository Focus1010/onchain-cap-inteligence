Design a modern dark‑mode web app UI for a crypto analytics platform called Clanker Holder Radar (CHR).

The product analyzes token ownership and control structure on Base and other EVM chains.

The UI should feel:

• Institutional
• Clean
• Professional
• Data‑driven
• Minimal clutter
• Dark mode default
• Similar aesthetic to Nansen / Arkham / Dune
• No meme styling

✅ USER FLOW
On load → Landing page
User pastes contract address (CA)
Clicks “Analyze”
Redirect to Token Dashboard
Default tab: Bubble Map
User can switch between:
Bubble Map
Holders
Control Structure
Metrics
History (future)
✅ SCREEN 1 – LANDING PAGE
Top navigation:

Left: CHR Logo
Clanker Holder Radar

Right: Docs
About
Network selector (Base default)

Hero Section:

Headline: Onchain Cap Table Intelligence

Subtext: Understand who really controls a token.

Large centered search input: [ Paste contract address 0x… ]

Primary button: Analyze

Background: Very subtle radar‑style radial gradient effect.

Minimal design. No clutter.

✅ SCREEN 2 – TOKEN DASHBOARD
Layout:

Top token info strip: • Token Name
• Symbol
• Total Supply
• Network
• Deployer address
• Risk badge (Low / Medium / High)

Below that:

Tab navigation: Bubble Map | Holders | Control | Metrics | History

Default active tab: Bubble Map.

✅ BUBBLE MAP PAGE (CORE FEATURE)
Main layout:

Left side (70% width): Large interactive bubble visualization.

Right side (30% width): Control Insights Panel.

Bubble Map Design Requirements
• Dark background (#0B0F14) • No visible grid • Subtle radial glow in center • Soft smooth bubble edges • No hard outlines • Slight glow per classification type • Physics-based spacing • Largest bubble slightly off-center

Bubble size = % of supply.

Color coding:

EOA – Green
Liquidity Pool – Blue
Smart Wallet – Purple
DAO – Orange
Staking – Cyan
Burn – Gray

Add legend under map.

Interaction Design
On hover: • Tooltip card with:

Address
Type
% of supply
Balance
Label (if exists) • Other bubbles slightly fade.
On click: • Right panel updates with:

Address details
Classification
Concentration impact
Control notes
Add filter toggles above map:

All | EOAs | LPs | DAO | Staking | Smart Wallet

Smooth transitions when filtering.

✅ RIGHT SIDE PANEL – CONTROL INSIGHTS
Clean vertical card layout.

Section 1: Adjusted Concentration

• Top 1 (EOA only) • Top 5 (EOA only) • Raw Top 1 • Raw Top 5

Section 2: Supply Breakdown

Segmented horizontal bar showing:

• Liquidity Pools % • EOAs % • DAO % • Staking % • Smart Wallet % • Burn %

Section 3: Insights

Short bullet points:

Example: • 28% held in Liquidity Pools • 14% DAO-controlled • 34% EOA concentration • 3 Smart wallets detected

Minimal text. Clean layout.

✅ HOLDERS PAGE
Sortable table with:

Rank
Address
Label
Type
% of supply
Balance

Type has small colored dot indicator.

Dark table. Thin borders. No heavy grid lines.

✅ CONTROL STRUCTURE PAGE
Large segmented donut or bar chart.

Breakdown by:

EOA
LP
DAO
Staking
Smart Wallet
Burn

Below: Short explanation of control distribution.

✅ DESIGN SYSTEM
Typography: Inter or Satoshi

Background: #0B0F14

Card background: #11161D

Borders: #1E2630

Primary accent: Electric Blue or Teal

Risk badge: Red (High)
Yellow (Medium)
Green (Low)

Spacing: Generous padding. Auto layout. Rounded corners 8–12px.

No emojis. No meme aesthetics. No over-glow.

✅ OVERALL FEEL
This should feel like:

A serious capital allocation intelligence tool.

Not a rug detector. Not a degen dashboard. Not playful.

Professional. Analytical. Trustworthy.