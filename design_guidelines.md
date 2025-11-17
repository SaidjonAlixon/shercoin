# SherCoin Telegram Mini App - Design Guidelines

## Design Approach
**Reference-Based**: Modern tap-to-earn games (Hamster Kombat, Notcoin) with Telegram Mini App design patterns. Clean, gamified interface optimized for mobile WebApp experience.

## Color System

### Light Mode (Kunduzgi)
- **Background Gradient**: `#0F7BDA` → `#031C4F` (top to bottom)
- **Card Backgrounds**: `#FFFFFF` with subtle shadows
- **Text**: `#FFFFFF` (on dark backgrounds), `#1B1F3B` (on white cards)
- **SherCoin Gold**: `#FFD43B` → `#F2B600` (gradient)

### Dark Mode (Kechgi)
- **Background Gradient**: `#020617` → `#02020F` (deep dark blue/black)
- **Card Backgrounds**: `#0F172A` / `#111827`
- **Text**: `#E5E7EB` (gray-white)
- **Accents**: Neon cyan `#38BDF8` and gold `#FACC15`

### Common Elements
- **Shadows**: `0 8px 25px rgba(0,0,0,0.35)`
- **Border Radius**: 16-20px for all buttons and cards
- **Coin Effect**: 3D appearance with soft highlight and shadow

## Typography
- **Primary Font**: System font optimized for Telegram WebApp (SF Pro for iOS, Roboto for Android)
- **Heading Sizes**: 24-32px (bold)
- **Body Text**: 14-16px (regular)
- **Small Text**: 12px (medium)
- **Numbers/Balance**: Tabular figures, bold weight

## Layout System
**Spacing Units**: Use consistent Tailwind units: `2, 4, 6, 8, 12, 16, 20, 24`
- Card padding: `p-4` to `p-6`
- Section spacing: `gap-4` to `gap-6`
- Margins between major sections: `mb-6` to `mb-8`

## Navigation Structure

### Bottom Navigation (5 Tabs)
Fixed bar with icons and labels:
1. **Arena** (⚔️) - Main tap page
2. **Topshiriqlar** (✓) - Tasks
3. **SherMaktab** (📚) - Study/Learning
4. **Do'stlar** (👥) - Friends/Referrals
5. **Xazina** (💰) - Wallet/Airdrop

Height: 70px with safe area padding, active tab highlighted with accent color

### Top Header (Universal)
**Left**: Circular avatar (40px) from Telegram profile
**Center**: Balance display with SherCoin icon + formatted number
**Right**: Two icons (24px each) - 🔔 Notifications, ⚙️ Settings

## Component Library

### Bonus Panel (3 Horizontal Cards)
Below header, scrollable horizontally:
- **Card Size**: ~280px width, 100px height
- **Content**: Icon (top), Title (bold), Subtitle/Reward (small)
- **Cards**: "Kundalik kirish" (7-day streak), "Omad kodi" (promo input), "Kundalik vazifa" (daily mission)
- **Spacing**: `gap-4` between cards, `px-4` container padding

### Balance Banner
Full-width card showing:
- Large balance number with SherCoin icon
- Hourly income: "+215,880 / soat" in smaller, muted text
- Gradient background matching theme

### Main Coin (Arena)
- **Size**: 280px diameter
- **Design**: 3D golden coin with SherCoin logo
- **Tap Animation**: Scale 1 → 1.1 → 1 (200ms ease)
- **Floating Effect**: On tap, "+XX SherCoin" text floats up and fades (1s duration)
- **Glow**: Subtle pulse animation when active

### Energy Bar
- **Position**: Below coin
- **Style**: Progress bar with gradient fill
- **Text**: "Energiya: 750 / 1000" above bar
- **Subtext**: "Har 3 sekundda +5 ga to'ldiriladi" (gray, 12px)
- **Bar Height**: 8px with rounded ends

### Task Cards
Vertical list with cards:
- **Icon**: Left-aligned (40px circle)
- **Title**: Bold, 16px
- **Description**: Regular, 14px, muted
- **Reward**: "+500 SherCoin" in gold, right-aligned
- **Button**: Full-width at bottom ("Boshlash", "Tekshirish", "Mukofotni olish")
- **Status Badge**: Top-right corner (Bajarilgan = green checkmark)

### Quick Action Buttons
Two buttons below energy bar:
- **Style**: Rounded, outlined, icons + text
- **Layout**: Side-by-side with `gap-4`
- **Examples**: "SherBoost", "SherDo'stlar"

### Referral Section
- **Link Card**: Copyable invite link with copy button
- **Stats Grid**: 3 metrics in 2-column layout
  - Taklif qilingan: count
  - Faol do'stlar: count
  - Referal daromad: SherCoin amount
- **Friends List**: Avatar + username + earned amount per friend

### Boost Store Cards
Grid layout (2 columns on mobile):
- **Icon**: Large, centered at top
- **Name**: Bold title
- **Duration**: "30 daqiqa" in accent color
- **Price**: SherCoin amount with coin icon
- **Active Timer**: If boost running, show countdown

### Profile Modal
Overlay with:
- Large avatar at top
- Username + ID
- Stats: Registration date, Total taps, Level/XP with progress bar
- Close button (X) top-right

### Settings Modal
- **Theme Toggle**: 3 options (Light/Dark/Auto) as segmented control
- **Language**: Dropdown (O'zbek default)
- **Sound Effects**: Toggle switch
- **Notifications**: Toggle switches for each type

## Animation Guidelines
- **Tap Feedback**: Scale + haptic (if available in Telegram)
- **Page Transitions**: Slide in/out (300ms)
- **Coin Float**: Cubic-bezier easing
- **Energy Refill**: Smooth progress bar animation
- **Loading States**: Skeleton screens with shimmer
- **Success Actions**: Confetti effect (lightweight)

## Images
No hero images needed - this is a Telegram Mini App focused on interactive gameplay. All visuals are UI elements and icons:
- SherCoin 3D rendered coin graphic (main interactive element)
- Task icons (sourced from Heroicons or similar)
- Achievement badges
- Profile avatars (from Telegram)

## Accessibility
- Minimum touch target: 44x44px
- High contrast ratios (WCAG AA)
- Focus states for keyboard navigation
- Screen reader labels for icons
- Toast notifications for feedback

## Mobile Optimization
- Safe area insets for notched devices
- Bottom navigation above iOS home indicator
- Pull-to-refresh on lists
- Optimized for single-hand use
- Landscape mode disabled (portrait only)