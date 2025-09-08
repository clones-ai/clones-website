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

### Environment Setup
**Important**: Copy the environment template before starting development:
```bash
cp .env.example .env
```

Edit `.env` and fill in the required values:
```bash
VITE_API_URL=http://localhost:8001
VITE_AUTH_ENDPOINT=/api/v1/wallet/connect
VITE_DESKTOP_SCHEME=clones-dev
VITE_WALLETCONNECT_PROJECT_ID=your-walletconnect-project-id
VITE_BASESCAN_BASE_URL=https://sepolia.basescan.org/
VITE_FAUCET_CONTRACT_ADDRESS=0xeD3F1269678108AB079641c4d9d59639A7047dC6
```

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
Environment variables are automatically loaded from your `.env` file when using Docker.

**Important**: Make sure you have created your `.env` file from `.env.example` before running Docker containers.

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


### Fly.io Deployment

This project is configured for deployment on Fly.io with two environments:

#### Automatic Deployment

- **Production**: Automatically deploys to `clones-website-prod` when pushing to the `main` branch
- **Test**: Automatically deploys to `clones-website-test` when pushing to the `test` branch

#### Manual Deployment

For manual deployment, ensure you have the Fly CLI installed and configured:

```bash
# Deploy to test environment
flyctl deploy -c fly.test.toml

# Deploy to production environment  
flyctl deploy -c fly.prod.toml
```

