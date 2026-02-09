# OMNEX STUDY Premium Design System

## Design Inspiration
Inspired by omnexai.ru corporate identity, this design system creates a premium, modern SaaS experience with dark-first approach, red accent colors, and sophisticated animations.

## Core Design Principles

### 1. **Dark-First Philosophy**
- Default theme: **Dark Mode** (#0A0A0A background)
- Reflects premium, corporate identity
- Reduces eye strain for extended learning sessions
- Light mode available for user preference

### 2. **Red Accent System**
- **Primary Red**: `#DC2626` - Main brand color for CTAs, links, and highlights
- **Hover Red**: `#B91C1C` - Darker shade for interactive states
- Used consistently across all interactive elements
- Creates strong visual hierarchy and brand recognition

### 3. **Glass Morphism Effects**
- Backdrop blur: `blur(20px)`
- Semi-transparent backgrounds: `rgba(17, 17, 17, 0.8)`
- Subtle borders: `rgba(255, 255, 255, 0.1)`
- Creates depth and premium feel

### 4. **Premium Typography**
- **Font**: Montserrat (400-800 weights)
- **Logo**: Montserrat Extra Bold (800)
- Supports Latin and Cyrillic scripts
- Professional, clean, and highly readable

## Color System

### Dark Theme (Default)
```css
Background:       #0A0A0A  (Very dark gray)
Foreground:       #FFFFFF  (Pure white)
Card Background:  #111111  (Dark card)
Primary:          #DC2626  (OMNEX Red)
Secondary:        #1A1A1A  (Dark gray)
Muted:            #262626  (Medium gray)
Muted Foreground: #A3A3A3  (Light gray)
Border:           rgba(255, 255, 255, 0.1)
```

### Light Theme (Alternative)
```css
Background:       #FFFFFF  (Pure white)
Foreground:       #0A0A0A  (Very dark gray)
Card Background:  #FFFFFF  (White card)
Primary:          #DC2626  (OMNEX Red)
Secondary:        #F5F5F5  (Light gray)
Muted:            #F5F5F5  (Light gray)
Muted Foreground: #737373  (Medium gray)
Border:           rgba(0, 0, 0, 0.1)
```

## Custom Utility Classes

### Glass Card
```tsx
<div className="glass-card">
  {/* Content with glass morphism effect */}
</div>
```
- Background: `rgba(17, 17, 17, 0.8)`
- Backdrop filter: `blur(20px)`
- Border: `1px solid rgba(255, 255, 255, 0.1)`

### Gradient Red
```tsx
<div className="gradient-red">
  {/* Content with red gradient background */}
</div>
```
- Gradient: `linear-gradient(135deg, #DC2626 0%, #991B1B 100%)`

### Gradient Text
```tsx
<h1 className="gradient-text">
  {/* Text with red gradient */}
</h1>
```
- Gradient: `linear-gradient(135deg, #DC2626 0%, #EF4444 100%)`
- Text fill: Gradient clipped to text

### Glow Red
```tsx
<div className="glow-red">
  {/* Content with red glow effect */}
</div>
```
- Shadow: `0 0 40px rgba(220, 38, 38, 0.3)`

### Border Gradient
```tsx
<div className="border-gradient">
  {/* Content with gradient border */}
</div>
```
- Creates gradient border effect with transparency

## Animation Patterns

### 1. **Floating Blobs**
- Large gradient orbs that slowly move and rotate
- Creates ambient, dynamic background
- Red theme: `bg-primary/20`, `bg-primary/15`, `bg-primary/10`

### 2. **Particle System**
- Small dots floating upward
- Simulates energy and activity
- Opacity fades in/out for subtlety

### 3. **Hover Effects**
- Scale: `1.05` on hover
- Translate Y: `-5px` to `-10px`
- Smooth transitions: `0.3s`

### 4. **Button Animations**
- Shimmer effect: Gradient slides across
- Hover scale: `1.05`
- Tap scale: `0.95`
- Shadow increases on hover

### 5. **Card Animations**
- Hover lift: `-8px` to `-10px`
- Rotate slightly: `[-1deg, 1deg, 0]`
- Shadow intensity increases
- Border color transitions to primary

## Component Patterns

### Premium CTA Button
```tsx
<Button 
  size="lg" 
  className="px-10 h-14 text-lg shadow-xl shadow-primary/20 rounded-full font-semibold"
>
  <span>Get Started</span>
  <ArrowRight className="ml-2" />
</Button>
```

### Glass Card
```tsx
<div className="glass-card rounded-2xl p-6 hover:shadow-2xl transition-all">
  {/* Content */}
</div>
```

### Gradient Heading
```tsx
<h1 className="text-5xl font-bold gradient-text">
  OMNEX STUDY
</h1>
```

### Animated Badge
```tsx
<Badge className="backdrop-blur-sm shadow-lg hover:shadow-primary/50">
  <Sparkles className="mr-2 text-primary" />
  AI-Powered
</Badge>
```

## Navbar Design

### Features
- Sticky positioning: `sticky top-0 z-50`
- Glass effect: `bg-background/80 backdrop-blur-xl`
- Subtle border: `border-b border-border`
- Clean navigation with proper spacing

### Structure
```
[OMNEX STUDY Logo] [Nav Links] -------- [Language] [Theme] [Auth/User]
```

## Landing Page Sections

### 1. **Hero Section**
- Large animated blobs in background
- Floating particles
- Prominent CTA with animations
- Trust indicators (checkmarks)

### 2. **Stats Section**
- Large numbers with primary color
- Animated on scroll
- Hover effects on each stat card

### 3. **Features Section**
- Grid layout (4 columns on desktop)
- Icon with gradient background
- Pulsing animation on icons
- Glass card hover effects

### 4. **How It Works**
- 3-step process
- Animated icons with gradients
- Vertical flow on mobile, horizontal on desktop

### 5. **Testimonials**
- Avatar with gradient background
- Star ratings with individual animations
- Glass card effect

### 6. **CTA Footer**
- Prominent gradient background
- Multiple layers of animation
- Shimmer effect on button
- Trust indicators

## Responsive Design

### Breakpoints
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

### Mobile Optimizations
- Hamburger menu for navigation
- Stacked layouts
- Larger touch targets
- Simplified animations (reduced motion)

## Performance Considerations

### Optimizations
- CSS variables for theme switching
- Hardware-accelerated transforms
- `will-change` for animated elements
- Lazy loading for images
- Reduced motion support

### Best Practices
- Use `motion.div` for complex animations
- Implement `viewport={{ once: true }}` to prevent re-animations
- Keep backdrop blur to minimum necessary
- Optimize gradient usage

## Accessibility

### Standards
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- Proper contrast ratios (4.5:1 minimum)

### Features
- `sr-only` classes for screen readers
- ARIA labels on interactive elements
- Focus indicators visible
- Reduced motion support via `prefers-reduced-motion`

## Brand Consistency

### Logo Usage
- Always use official OMNEX STUDY logo
- Maintain color: Red "OMNEX", White/Foreground "STUDY"
- Never distort or recolor
- Minimum clear space around logo

### Color Usage
- Primary red for CTAs and important elements
- Use sparingly for maximum impact
- Maintain contrast for readability
- Test in both light and dark modes

### Typography
- Headings: Montserrat Bold/Extra Bold
- Body: Montserrat Regular/Medium
- Never use all caps except for logo
- Maintain proper hierarchy

## Implementation Examples

### Premium Card Component
```tsx
<motion.div
  whileHover={{ y: -10, scale: 1.02 }}
  className="glass-card rounded-2xl p-6 border-gradient"
>
  <div className="flex items-center gap-4 mb-4">
    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center">
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="text-xl font-bold">Title</h3>
  </div>
  <p className="text-muted-foreground">Description text</p>
</motion.div>
```

### Animated Hero Title
```tsx
<motion.h1
  className="text-6xl font-bold mb-6"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
>
  <span className="gradient-text">Transform Your Learning</span>
</motion.h1>
```

### Premium Button with Effects
```tsx
<motion.div
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  <Button 
    size="lg" 
    className="gradient-red glow-red rounded-full px-10 h-14 text-lg font-semibold"
  >
    Get Started
    <ArrowRight className="ml-2" />
  </Button>
</motion.div>
```

## Future Enhancements

### Potential Additions
1. **Micro-interactions**: Subtle feedback on all interactions
2. **Loading States**: Skeleton screens with shimmer effect
3. **Toast Notifications**: Styled to match theme
4. **Modal Dialogs**: Glass morphism with blur
5. **Form Fields**: Premium input styling with focus states
6. **Progress Indicators**: Animated with red gradients
7. **Data Visualizations**: Charts with red color scheme
8. **Empty States**: Engaging illustrations with brand colors

### Advanced Features
1. **Theme Customization**: User-adjustable accent colors
2. **Animation Preferences**: Toggle for reduced motion
3. **Density Options**: Compact/comfortable/spacious modes
4. **Font Size Control**: Accessibility scaling
5. **High Contrast Mode**: Enhanced visibility option

## Maintenance

### Regular Updates
- Review color contrast periodically
- Test on new devices/browsers
- Update animations for performance
- Gather user feedback on design
- A/B test design variants

### Version Control
- Document all design changes
- Maintain design system changelog
- Version CSS utility classes
- Track component updates

## Resources

### Tools Used
- **Figma**: Design prototyping
- **Tailwind CSS v4**: Utility-first styling
- **Motion/React**: Animation library
- **Google Fonts**: Montserrat font family

### References
- OMNEX AI website: https://omnexai.ru/
- Material Design guidelines
- Apple Human Interface Guidelines
- Stripe design system
- Notion design patterns
