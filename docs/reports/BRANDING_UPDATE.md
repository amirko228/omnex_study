# OMNEX STUDY Branding Update

## Overview
Successfully rebranded the platform from "AI Learning" to "OMNEX STUDY" with premium corporate design inspired by omnexai.ru, featuring dark theme by default, red accent colors, and Montserrat font family.

## Design Philosophy
- **Premium Dark Theme**: Corporate dark design by default, reflecting OMNEX brand identity
- **Red Accent Colors**: Vibrant red (#DC2626) used throughout for consistency with OMNEX brand
- **Modern Typography**: Montserrat font family for professional, clean look
- **Glass Morphism**: Subtle backdrop blur effects for depth and premium feel
- **Animated Elements**: Smooth animations and micro-interactions for enhanced UX

## Changes Made

### 1. **Brand Colors**
- **Primary Color**: Changed to OMNEX Red (#DC2626)
- **Hover State**: #B91C1C
- Applied to all buttons, links, and accent elements throughout the platform

### 2. **Typography**
- **Font Family**: Montserrat (imported from Google Fonts with Cyrillic support)
- **Logo Font**: Montserrat Extra Bold
- **Body Font**: Montserrat Regular (400-800 weights available)
- Full support for Latin and Cyrillic characters

### 3. **Logo Design**
- **Created**: `/components/layout/omnex-logo.tsx`
- **Design**: 
  - Red geometric icon (3D cube/package symbol)
  - "OMNEX" in red (Extra Bold)
  - "STUDY" in white/foreground color (Extra Bold)
- **Variants**:
  - Full logo with icon and text
  - Icon-only version for compact spaces
  - Text-only version (optional)

### 4. **Updated Components**

#### Navigation (`/components/layout/navbar.tsx`)
- Replaced "AI Learning" logo with OMNEX STUDY logo
- Imported and integrated OmnexLogo component

#### Footer (`/App.tsx`)
- Updated logo in footer
- Changed copyright text to "OMNEX STUDY"

#### SEO (`/components/marketing/seo-head.tsx`)
- Updated all meta tags:
  - Title: "OMNEX STUDY - AI-Powered Learning Platform"
  - Author: "OMNEX STUDY"
  - Site Name: "OMNEX STUDY"
  - Organization Name: "OMNEX STUDY"

### 5. **Global Styles** (`/styles/globals.css`)
- Added Montserrat font import with Cyrillic support
- Set Montserrat as default body font
- Created CSS variables for OMNEX brand colors:
  - `--omnex-red: #DC2626`
  - `--omnex-red-hover: #B91C1C`
- Updated `--primary` color to OMNEX Red
- Applied red color scheme to both light and dark modes

### 6. **Dark Mode Support**
- Maintained OMNEX Red as primary color in dark mode
- Ensured proper contrast for readability
- Logo "STUDY" text switches to white in dark mode

## Color Palette

### Light Mode
- **Primary (OMNEX Red)**: #DC2626
- **Primary Hover**: #B91C1C
- **Foreground**: Dark gray/black
- **Background**: White

### Dark Mode
- **Primary (OMNEX Red)**: #DC2626
- **Primary Hover**: #B91C1C
- **Foreground**: White
- **Background**: Dark gray/black

## File Structure
```
/components/layout/
  └── omnex-logo.tsx           # New logo component

/styles/
  └── globals.css              # Updated with Montserrat font and OMNEX colors

/components/layout/
  └── navbar.tsx               # Updated with new logo

/components/marketing/
  └── seo-head.tsx             # Updated meta tags

/App.tsx                        # Updated footer logo and copyright
```

## Usage Examples

### Using the Logo Component

```tsx
import { OmnexLogo } from '@/components/layout/omnex-logo';

// Full logo with icon and text
<OmnexLogo />

// Without icon
<OmnexLogo showIcon={false} />

// Icon only
<OmnexLogo iconOnly />

// With custom className
<OmnexLogo className="mb-4" />
```

### Using Brand Colors

```tsx
// In CSS/Tailwind
<div className="bg-primary text-primary-foreground">
  OMNEX Red Button
</div>

// With CSS variables
<div style={{ backgroundColor: 'var(--omnex-red)' }}>
  Custom red element
</div>
```

## Testing Checklist

- [✓] Logo displays correctly in navbar (desktop & mobile)
- [✓] Logo displays correctly in footer
- [✓] All buttons use OMNEX Red color
- [✓] Montserrat font loads properly
- [✓] Cyrillic characters render correctly
- [✓] Dark mode preserves brand colors
- [✓] SEO meta tags updated
- [✓] Copyright footer updated
- [✓] Brand consistency across all pages

## Next Steps (Optional)

1. **Favicon**: Create and add OMNEX STUDY favicon using the red cube icon
2. **Loading Screen**: Update loading animation colors to OMNEX Red
3. **Email Templates**: Update email templates with new branding
4. **Social Media**: Create social media assets with OMNEX STUDY branding
5. **Documentation**: Update user guides and help documentation with new brand name

## Notes

- The red color (#DC2626) provides excellent contrast and visibility
- Montserrat Extra Bold creates a strong, modern brand presence
- All existing functionality remains unchanged - only visual branding updated
- Platform fully supports 5 languages (RU/EN/DE/ES/FR) with proper font rendering