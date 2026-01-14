# Property Scraper Frontend

A modern Next.js dashboard for viewing and managing scraped property data from SalesWeb.

## Features

- 📊 **Counties Dashboard** - View all counties with property counts and scraping status
- 🏘️ **County Details** - Explore properties within each county
- 🏠 **Property Details** - View comprehensive information about each property
- 🔄 **Scraping Control** - Start scrapes and refetch failed items
- 🌓 **Dark Mode** - Full light and dark theme support
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://localhost:3000`

### Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Copy .env.local and update if needed
# Default API URL is http://localhost:3000
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Project Structure

```
property-scraper-fe/
├── app/
│   ├── counties/
│   │   └── [countyId]/
│   │       └── page.tsx          # County details page
│   ├── properties/
│   │   └── [propertyId]/
│   │       └── page.tsx          # Property details page
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with header/footer
│   └── page.tsx                  # Home page (counties list)
├── components/
│   ├── CountyCard.tsx            # County card component
│   ├── PropertyCard.tsx          # Property card component
│   ├── ErrorMessage.tsx          # Error display component
│   ├── Loading.tsx               # Loading states
│   ├── ThemeProvider.tsx         # Theme context provider
│   └── ThemeToggle.tsx           # Dark mode toggle button
├── types/
│   └── index.ts                  # TypeScript type definitions
└── package.json
```

## API Endpoints Used

- `GET /api/counties` - List all counties
- `GET /api/counties/:countyId` - County details
- `GET /api/counties/:countyId/properties` - County properties
- `POST /api/counties/:countyId/refetch` - Refetch county data
- `GET /api/properties/:propertyId` - Property details
- `POST /api/properties/:propertyId/refetch` - Refetch property data
- `POST /api/scrape` - Start scraping
- `GET /api/failed/counties` - Get failed counties
- `GET /api/failed/properties` - Get failed properties

## Technologies

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **next-themes** - Dark mode support

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3000` | Backend API URL |

## License

MIT
