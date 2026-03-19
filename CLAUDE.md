# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

The main application code is in the `web/` directory. All development commands should be run from there.

## Build and Development Commands

```bash
cd web
npm install
npm run dev      # Start development server at http://localhost:3001
npm run build    # Production build
npm run lint     # Run ESLint
```

## Project Overview

This is the official website for **きたげん（居酒屋）** - a Japanese izakaya restaurant.

**Purpose:**
- Convey the restaurant's atmosphere to first-time visitors
- Create trust and a "proper, reliable shop" impression
- Serve as entry point to the customer survey system

**Planned pages:** Top, Menu, Shop Info, News/Announcements, Survey Link

## Technical Stack

- **Framework:** Next.js (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Design Principles

- Simple and stable over advanced features
- Easy for non-technical owner to edit text/images
- No complex CMS or state management
- Avoid over-engineering
