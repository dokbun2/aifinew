# AIFI Modern Dark Design System

Based on the concept art page's aesthetics, this design system provides a cohesive visual language for the entire AIFI application.

## Design Philosophy

- **Modern Dark Theme**: Sophisticated dark backgrounds with vibrant gradient accents
- **Glassmorphism Elements**: Subtle transparency and backdrop filters for depth
- **Smooth Animations**: Elegant transitions and micro-interactions
- **Visual Hierarchy**: Clear content organization with strategic use of space and contrast

## Color Palette

### Primary Colors
```css
/* Gradient Accents */
--primary-gradient: linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%);
--secondary-gradient: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
--accent-gradient: linear-gradient(135deg, #F59E0B 0%, #EF4444 100%);

/* Base Colors */
--bg-primary: #0F0F0F;      /* Main background */
--bg-secondary: #1A1A1A;    /* Card backgrounds */
--bg-tertiary: #242424;     /* Nested elements */
--bg-hover: #2A2A2A;        /* Hover states */

/* Text Colors */
--text-primary: #FFFFFF;     /* Main text */
--text-secondary: #A1A1AA;   /* Secondary text */
--text-tertiary: #71717A;    /* Muted text */

/* Accent Colors */
--accent-purple: #A855F7;    /* Primary accent */
--accent-blue: #3B82F6;      /* Secondary accent */
--accent-pink: #EC4899;      /* Tertiary accent */
--accent-orange: #F59E0B;    /* Warning/highlight */
--accent-green: #10B981;     /* Success */
```

## Typography

### Font Family
- **Primary**: Paperlogy (Korean optimized)
- **Weights**: 100-900 (Thin to Black)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Type Scale
```css
/* Headings */
--font-h1: 3rem / 800;       /* Page titles */
--font-h2: 2rem / 700;       /* Section headers */
--font-h3: 1.5rem / 600;     /* Subsections */
--font-h4: 1.125rem / 600;   /* Card titles */

/* Body */
--font-body: 1rem / 400;     /* Regular text */
--font-small: 0.95rem / 400; /* Secondary text */
--font-tiny: 0.85rem / 400;  /* Metadata */
```

## Spacing System

```css
--space-xs: 0.5rem;   /* 8px */
--space-sm: 1rem;     /* 16px */
--space-md: 1.5rem;   /* 24px */
--space-lg: 2rem;     /* 32px */
--space-xl: 3rem;     /* 48px */
```

## Layout Components

### Container
```css
.container {
    max-width: 1600px;
    margin: 0 auto;
    padding: var(--space-lg);
    position: relative;
    z-index: 1;
}
```

### Cards
```css
.card {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all var(--transition-base);
}

.card:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
    border-color: var(--accent-purple);
}
```

### Fixed Header
```css
.header-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 72px;
    background: rgba(15, 15, 15, 0.9);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
}
```

## Interactive Elements

### Buttons
```css
/* Primary Button */
.btn-primary {
    background: var(--primary-gradient);
    color: white;
    padding: var(--space-sm) var(--space-lg);
    border-radius: var(--radius-md);
    font-weight: 600;
    transition: all var(--transition-base);
    box-shadow: 0 4px 15px rgba(168, 85, 247, 0.3);
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(168, 85, 247, 0.4);
}

/* Secondary Button */
.btn-secondary {
    background: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-secondary:hover {
    background: var(--bg-hover);
    border-color: var(--accent-purple);
    box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
}
```

### Tabs
```css
.tab-button {
    position: relative;
    color: var(--text-secondary);
    transition: all var(--transition-base);
}

.tab-button::after {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--primary-gradient);
    transform: scaleX(0);
    transition: transform var(--transition-base);
}

.tab-button.active::after {
    transform: scaleX(1);
}
```

## Effects & Animations

### Shadows
```css
--shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
--shadow-md: 0 4px 12px rgba(0,0,0,0.15);
--shadow-lg: 0 8px 24px rgba(0,0,0,0.2);
--shadow-glow: 0 0 20px rgba(168, 85, 247, 0.4);
```

### Transitions
```css
--transition-fast: 0.15s ease;
--transition-base: 0.3s ease;
--transition-slow: 0.5s ease;
```

### Hover Effects
- **Lift**: `transform: translateY(-4px)`
- **Glow**: `box-shadow: var(--shadow-glow)`
- **Border Highlight**: `border-color: var(--accent-purple)`

### Background Effects
```css
/* Gradient Mesh Background */
.gradient-bg::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
        radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 50% 100%, rgba(236, 72, 153, 0.1) 0%, transparent 50%);
    pointer-events: none;
}
```

## Component Patterns

### List Items
```css
.list-item {
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-sm);
    transition: all var(--transition-base);
    position: relative;
    overflow: hidden;
}

.list-item:hover {
    background: var(--bg-hover);
    border-color: var(--accent-purple);
    transform: translateX(4px);
}
```

### Modal/Dialog
```css
.modal {
    background: rgba(0, 0, 0, 0.9);
    backdrop-filter: blur(10px);
}

.modal-content {
    background: var(--bg-secondary);
    border-radius: var(--radius-lg);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 0 40px rgba(168, 85, 247, 0.5);
}
```

### Tables
```css
.table {
    background: var(--bg-tertiary);
    border-radius: var(--radius-md);
    overflow: hidden;
}

.table thead {
    background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(59, 130, 246, 0.2));
}

.table tr:hover {
    background: rgba(255, 255, 255, 0.05);
}
```

## Responsive Breakpoints

```css
/* Desktop First */
@media (max-width: 1200px) { /* Tablet landscape */ }
@media (max-width: 768px) { /* Tablet portrait / Mobile */ }
@media (max-width: 480px) { /* Mobile small */ }
```

## Accessibility

- **Focus States**: `outline: 2px solid var(--accent-purple); outline-offset: 2px;`
- **Reduced Motion**: Disable animations for users who prefer reduced motion
- **Color Contrast**: All text meets WCAG AA standards on dark backgrounds
- **Interactive Areas**: Minimum 44x44px touch targets

## Implementation Guidelines

1. **Consistency**: Use design tokens throughout the application
2. **Dark Mode First**: Design for dark theme as primary
3. **Smooth Interactions**: Apply transitions to all interactive elements
4. **Visual Hierarchy**: Use spacing and contrast to guide users
5. **Performance**: Use CSS transforms for animations (GPU accelerated)