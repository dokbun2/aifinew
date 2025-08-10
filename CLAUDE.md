# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIFI is an AI-based video production and concept art management web application. It's a pure frontend application using vanilla HTML, CSS, and JavaScript, designed for creating and managing video storyboards and concept art prompts for AI tools.

## Architecture

### Core Components

The application consists of three main pages:
- **Dashboard** (`index.html`): Project overview and navigation hub with stage-based JSON import system
- **Video Framework Storyboard** (`your_title_storyboard_v9.4.html`): Hierarchical storyboard management system with sequence/scene/shot structure
- **Concept Art Prompt Library** (`your_title_storyboard_v9.4_c.html`): Character/location/prop categorized prompt management system

### Technology Stack
- Pure HTML5, CSS3, JavaScript (ES6+)
- No build tools or package managers
- Local storage for data persistence
- Netlify for deployment

### File Structure
```
/
├── index.html                              # Main dashboard
├── your_title_storyboard_v9.4.html       # Video storyboard tool
├── your_title_storyboard_v9.4_c.html     # Concept art prompt library
├── script.js                             # Main dashboard JavaScript
├── styles.css                            # Main dashboard styles
├── simple_video_player.js                # Google Drive video embed player
├── fonts/                                # Custom Paperlogy font files (9 weights)
├── netlify.toml                          # Netlify deployment config
├── _redirects                            # Netlify redirects config
└── 아이파이 백업 v6/                        # Backup directory
```

## Development Commands

### Local Development
```bash
# Serve files locally using any HTTP server
python -m http.server 8000
# or
npx serve .
# or
npx http-server .
# or simply open index.html in browser for basic functionality
```

### Testing
Since this is a client-side application, testing is primarily done through:
- Manual browser testing across different devices/screen sizes
- localStorage data persistence testing
- JSON import/export functionality testing
- Cross-browser compatibility testing

### Deployment
The project is configured for Netlify deployment:
- Files are served from the root directory
- Netlify configuration is in `netlify.toml`
- Live URL: https://aifiwb.netlify.app
- Direct page access configured in `_redirects`

## Architecture Patterns

### Self-Contained Applications
Each HTML file is a complete, self-contained application with:
- Embedded CSS styles (no external stylesheets except for main dashboard)
- Embedded JavaScript functionality (no external scripts except video player)  
- Complete data management within the file

### Data Architecture
- **Dashboard**: Stage-based project workflow with JSON import/export between stages
- **Storyboard**: Hierarchical data structure (Project → Sequence → Scene → Shot)
- **Concept Art**: Category-based organization (Characters/Locations/Props) with image gallery

### Storage Patterns
- localStorage keys follow semantic versioning (e.g., `conceptArtManagerData_v1.2`)
- JSON export/import for cross-device data sharing
- Temporary storage for stage transitions (e.g., `stage4TempJson`)

### UI Patterns
- Fixed header with navigation and action buttons
- Responsive grid layouts using CSS Flexbox/Grid
- Modal dialogs for forms and confirmations
- Card-based information display
- Progressive enhancement with JavaScript

## Data Management

### localStorage Keys
- Main storyboard data: Application-specific keys in embedded JavaScript
- Concept art data: `conceptArtManagerData_v1.2`
- Stage transition data: `stage[N]TempJson` + `stage[N]TempFileName`

### JSON Structure
Each application maintains its own data schema:
- Storyboard: Hierarchical project/sequence/scene/shot structure
- Concept Art: Category-based with character/location/prop classifications
- Stage data: Application-specific staging format for workflow transitions

## Styling and UI

### Typography
- Primary: Paperlogy font family (9 weights: Thin to Black)
- Fallback: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif
- Korean language optimized

### Color Scheme  
- Primary gradient: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- Background: `#f5f5f5`
- Text: `#333`

### Responsive Breakpoints
- Desktop: 1200px+
- Tablet: 768px - 1199px  
- Mobile: 767px and below

## Important Notes

- This is a client-side only application with no backend
- All AI tool integrations are through external APIs/services
- Data persistence relies on browser localStorage
- Files contain embedded CSS and JavaScript (no external dependencies except video player)
- Korean language is the primary interface language
- Google Drive video embeds use official iframe preview method
- Content Security Policy configured for Google Drive iframe embedding

## Common Development Tasks

### Adding New Features
- Modify the respective HTML file (all-in-one approach)
- Update localStorage schema if needed
- Test JSON export/import functionality
- Ensure responsive design compatibility

### Modifying Data Structure
- Update localStorage key versioning
- Implement data migration if needed
- Test backward compatibility with existing data
- Update JSON export/import functions

##  Notes
- Always answer in korean.