# Clones Website

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 7.1.4
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion, Lenis
- **Routing**: React Router DOM
- **3D Graphics**: Spline
- **Web3**: Wagmi, RainbowKit, Viem
- **Data Fetching**: TanStack Query
- **Testing**: Jest, React Testing Library

## Getting Started

### Prerequisites
- Node.js 18+

### Setup

1. Copy environment template:
```bash
cp .env.example .env
```

2. Edit `.env` and configure required values:
```bash
VITE_API_URL=http://localhost:8001
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
VITE_FAUCET_CONTRACT_ADDRESS=0x...
```

3. Install dependencies:
```bash
npm install
```

4. Start development server:
```bash
npm run dev
```

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run lint         # Run linter
```

