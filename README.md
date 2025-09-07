# Resumify - Professional Resume Builder

A modern, intuitive resume builder application built with Next.js 15 that helps users create professional, ATS-optimized resumes in minutes.

## ✨ Features

### 🎨 Modern Design
- **Dark Veil Background**: Stunning animated background with customizable effects
- **Responsive Layout**: Optimized for all device sizes (mobile, tablet, desktop)
- **Interactive Preview Card**: Live preview of the resume builder interface
- **Smooth Animations**: Blur text effects, rotating text, and hover animations
- **Gradient Buttons**: Beautiful rounded buttons with hover effects

### 🚀 User Experience
- **Intuitive Interface**: Easy-to-use resume building experience
- **Live Preview**: Real-time preview as users build their resume
- **Professional Templates**: Multiple ATS-friendly resume templates
- **Mobile Optimized**: Responsive design with mobile-specific optimizations
- **Fast Performance**: Built with Next.js 15 and optimized for speed

### 🤖 AI-Powered Content Generation
- **Professional Summaries**: AI-generated professional summaries based on user information
- **Work Experience Enhancement**: AI-powered enhancement of work experience descriptions
- **Skills Suggestions**: AI-generated relevant skills based on work experience and education
- **Content Optimization**: AI assistance to make resumes more impactful and ATS-friendly

### 🛠️ Technical Features
- **Server-Side Rendering**: Fast initial page loads with SSR
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Component Architecture**: Reusable UI components with shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Animations**: CSS transforms and transitions
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **AI Integration**: Gemini AI for content generation

## 🏗️ Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Fonts**: Geist Sans & Geist Mono
- **Animations**: CSS transforms and transitions
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **AI**: Google Gemini AI

## 📁 Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with theme provider
│   ├── page.tsx            # Homepage with hero section
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── blur-text.tsx
│   │   ├── rotating-blur-text.tsx
│   │   ├── dark-veil.tsx
│   │   └── parallax-hero.tsx
│   ├── navbar.tsx          # Navigation component
│   └── theme-provider.tsx  # Theme context provider
├── lib/
│   ├── supabase.ts         # Supabase client and helper functions
│   └── gemini.ts           # Gemini AI integration for content generation
└── README.md
```

## 🎯 Key Components

### Hero Section
- **Dynamic Text**: Rotating blur text with multiple career-focused messages
- **Preview Card**: Interactive resume builder interface preview
- **Call-to-Action**: Prominent buttons for creating resumes and viewing templates
- **Responsive Design**: Adapts beautifully across all screen sizes

### Resume Builder Preview
- **Browser Interface**: Realistic browser window with URL bar
- **Form Sections**: Personal information, work experience, and skills
- **Live Preview**: Mini resume preview with real-time updates
- **Interactive Elements**: Animated form fields and skill tags

### Visual Effects
- **Skew Transforms**: Dynamic card tilting on hover
- **Gradient Backgrounds**: Beautiful color transitions
- **Blur Effects**: Sophisticated backdrop blur effects
- **Smooth Animations**: 500ms transitions for elegant interactions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd resumify
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file based on `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` and add your:
   - Supabase credentials
   - Gemini AI API key (get it from https://aistudio.google.com/)

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🤖 AI Features

Resumify now includes AI-powered content generation using Google Gemini AI to help users create more impactful resumes:

### Professional Summary Generation
- Automatically generates a professional summary based on user's personal information
- Creates concise, value-driven summaries that highlight key qualifications

### Work Experience Enhancement
- Improves work experience descriptions to be more impactful
- Uses action verbs and quantifies results where possible
- Converts basic job descriptions into compelling narratives

### Skills Suggestions
- Provides relevant skill suggestions based on work experience and education
- Helps users identify technical and soft skills they may have overlooked

### How to Use AI Features
1. Complete your resume information in the create/edit forms
2. Click the "Generate with AI" button next to sections that support AI enhancement
3. Review and edit the AI-generated content as needed
4. Save your updated resume

## 📱 Responsive Design

### Mobile (< 640px)
- Compact button sizing with reduced padding
- Smaller preview card (288px × 320px)
- Stacked layout for hero content
- Optimized touch targets

### Tablet (640px - 1024px)
- Medium-sized preview card (320px × 384px)
- Side-by-side layout begins
- Balanced spacing and typography

### Desktop (> 1024px)
- Full-sized preview card (384px × 500px)
- Complete side-by-side hero layout
- Enhanced hover effects and animations
- Optimal reading experience

## 🎨 Design System

### Colors
- **Primary**: Purple to Blue gradient (`from-purple-600 to-blue-600`)
- **Background**: Dynamic dark veil with customizable hue
- **Text**: White on dark backgrounds, proper contrast ratios
- **Accents**: Various colored skill tags and progress indicators

### Typography
- **Headings**: Geist Sans with bold weights
- **Body**: Geist Sans regular
- **Code**: Geist Mono for technical elements
- **Responsive**: Scales from `text-sm` on mobile to `text-base` on desktop

### Spacing
- **Mobile**: Compact spacing with `px-3` button padding
- **Desktop**: Generous spacing with `px-6` button padding
- **Consistent**: 4px base unit system throughout

## 🔧 Customization

### Theme Configuration
The project uses a theme provider that supports:
- System theme detection
- Light/dark mode switching
- Smooth transitions between themes

### Component Customization
All UI components are built with Tailwind CSS and can be easily customized by modifying the className props or extending the design system.

### Animation Tuning
Animation durations and effects can be adjusted in the component files:
- Hover transitions: `duration-500`
- Text animations: `duration-0.8`
- Transform effects: `transform hover:scale-105`

## 🗄️ Database Setup

For database configuration, see [README_DATABASE.md](README_DATABASE.md)

## 📦 Storage Setup

For profile image storage configuration, see [README_STORAGE.md](README_STORAGE.md)

## 📈 Performance

- **Lighthouse Score**: Optimized for 90+ scores across all metrics
- **Core Web Vitals**: Excellent LCP, FID, and CLS scores
- **Bundle Size**: Optimized with Next.js automatic code splitting
- **Image Optimization**: Next.js Image component for optimal loading

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments