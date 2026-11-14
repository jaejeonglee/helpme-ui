---
version: alpha
name: "Product name"
description: "Who it serves, in one line."
colors:
  primary: "#2457D6"
  on-primary: "#FFFFFF"
  surface: "#FFFFFF"
  surface-alt: "#F2F4F7"
  on-surface: "#191F28"
  muted: "#5B6472"
typography:
  title:
    fontFamily: "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: 22px
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "Pretendard, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
rounded:
  md: 10px
  lg: 16px
spacing:
  sm: 8px
  md: 16px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.md}"
    padding: 12px
  button-secondary:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.lg}"
    padding: 16px
  helper-text:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
x-helpme:
  register: haeyo
  density: comfortable
  motion: subtle
  host: none
  platforms: [web-mobile, web-desktop]
  locale: ko-KR
---
<!-- Use when a project has no DESIGN.md: copy to the repo root, take every value from brand assets or shipped CSS, keep text/background pairs AA, lint. -->

## Overview
Who, device, job. Bet: optimizes X, gives up Y. Signature.

## Colors
Roles, not hues. `primary` = main action only.

## Typography
Pretendard (OFL), system fallbacks, `keep-all`.

## Layout
8 px scale; phone composed separately.

## Elevation & Depth
One light source.

## Shapes
Child radius ≤ parent radius.

## Components
One `button-primary` per screen.

## Do's and Don'ts
- Do write 해요체; dialog dismiss is 닫기.
- Don't add values outside these tokens.
