# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

---

## Project Overview

This project is the official website for **きたげん（居酒屋）**.

### Purpose (Most Important)
- Convey the restaurant’s atmosphere to first-time visitors
- Create trust and a “proper, reliable shop” impression
- Serve as a simple entry point to the customer survey system

### Target Audience
- First-time customers
- Repeat customers checking menu / hours
- Customers guided to the survey via QR or button

---

## Content & Pages

The site is intentionally **small and simple**.

Planned pages:
- **Top**: Concept, atmosphere, basic introduction
- **Menu**: Menu images (photo-based, not complex data)
- **Shop Info**: Address, map, opening hours
- **News / Announcements**: Low-frequency updates
- **Survey Link**: Clear CTA button leading to the external survey system

---

## Editing & Operation Policy

- **Primary editor**: Shop owner (father)
- Editing scope:
  - Text replacement
  - Image replacement
- No layout or structural changes by the owner

Design principle:
- Simple
- Hard to break
- No complex CMS unless necessary

If CMS-like behavior is needed, prefer:
- Very simple content structure
- Minimal custom admin logic

---

## Technical Stack

- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Priority**: Stability and simplicity over advanced features

Avoid:
- Over-engineering
- Complex state management
- Heavy backend logic for this site

---

## Build and Development Commands

```bash
npm install
npm run dev
npm run build
npm run lint
