# Clones Website

## Architecture

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.1.4
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion (lazy-loaded)
- **Routing**: React Router DOM
- **Smooth Scrolling**: Lenis
- **3D Graphics**: Spline (conditionally loaded)

## Development

### Prerequisites
- Node.js 18+ (for local development)
- Docker & Docker Compose (recommended)

### Docker Development (Recommended)

#### Quick Start
```bash
# Clone the repository
git clone <repository-url>
cd clones-website-launch

# Development with hot reload
docker-compose up clones-website-dev

# Production build and serve
docker-compose up clones-website-prod

# Build all services
docker-compose build
```

#### Available Docker Services
- **clones-website-dev**: Development server with hot reload (port 5173)
- **clones-website-prod**: Production build with preview server (port 3000)

#### Environment Variables
```bash
PUBLIC_API_URL=http://localhost:8001  # API endpoint for development
NODE_ENV=production                   # Automatically set for prod service
```

### Local Development (Alternative)
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

#### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Performance & Analysis
```bash
npm run lighthouse           # Run Lighthouse audit on all pages
npm run bundle:analyze       # Analyze bundle size and composition
npm run images:analyze       # Analyze image optimization opportunities
npm run images:convert       # Convert images to WebP format
npm run audit:complete       # Complete performance audit
```

#### Performance Monitoring
```bash
npm run perf:save [label]    # Save current performance metrics
npm run perf:compare [before] [after]  # Compare performance metrics
npm run perf:current         # Show current metrics
```

## Styling System

### Tailwind Configuration
- **Glass Morphism**: Custom ultra-premium glass card components
- **Color Palette**: Consistent primary/secondary color system
- **Typography**: Responsive font scaling with proper hierarchy
- **Animations**: GPU-optimized with conditional loading

### CSS Architecture
- **Component-based**: Shared styles in dedicated CSS files
- **Performance-first**: Minimal unused CSS with purging
- **Mobile-optimized**: Touch-friendly interactions and spacing

## Deployment

### Docker Production (Recommended)
```bash
# Build production image
docker-compose build clones-website-prod

# Run production container
docker-compose up clones-website-prod

# Run in background
docker-compose up -d clones-website-prod
```

### Local Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

### Environment Setup
- **Docker**: Recommended for consistent environments
- **Node.js**: 18+ required (for local builds)
- **Memory**: 2GB+ recommended for build process
- **CDN**: Recommended for static assets

### Performance Monitoring
The application includes built-in performance monitoring:
- Real-time Core Web Vitals tracking
- Device capability detection
- GPU usage optimization
- Scroll performance monitoring

## Monitoring & Analytics

### Built-in Monitoring
- **PerformanceMonitor**: Real-time metrics display (development)
- **Core Web Vitals**: Automatic tracking and logging
- **Error Boundaries**: Comprehensive error handling
- **Device Detection**: Capability-based optimization

### Production Recommendations
- **Real User Monitoring**: Implement web-vitals tracking
- **Error Tracking**: Sentry integration recommended
- **Performance Budgets**: CI/CD pipeline integration
- **A/B Testing**: UX optimization framework

## Security

- **Zero Vulnerabilities**: All npm packages secured
- **Content Security Policy**: Ready for implementation
- **XSS Protection**: No innerHTML usage
- **Supply Chain**: Local bundling, no external CDN dependencies

## Browser Support

- **Modern Browsers**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile**: iOS 14+, Android 10+
- **Progressive Enhancement**: Graceful degradation for older browsers
