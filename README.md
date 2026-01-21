# Wocon.org

> Experience what you never imagined, starting from here.

Wocon is a travel application that helps you find travel companions. Available on web, Windows, Android, and iOS.

---

## 🌟 Features

- **Find Travel Companions**: Connect with like-minded travelers around the world
- **Multi-Platform Support**: Access Wocon on web, Windows, Android, and iOS
- **Social Map Platform**: Discover and share your travel experiences
- **Trip Planning**: Create and manage your travel trips with friends
- **Interactive Maps**: Explore destinations with our integrated map system

---

## 📥 Download

Choose your platform and start your journey:

- **Web**: Access directly in your browser
- **Windows**: Download for Windows 10 and 11
- **Android**: Available on Google Play Store
- **iOS**: Available on App Store

Visit [wocon.org](https://wocon-org.github.io/) to download.

---

## 🛠 Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **TypeScript** - Type-safe development
- **Pinia** - State management
- **Vue Router** - Official router for Vue.js
- **Leaflet** - Open-source JavaScript library for interactive maps

### Backend
- **Supabase** - Open-source Firebase alternative
  - Authentication (OAuth support: GitHub, Google, Facebook, LinkedIn)
  - PostgreSQL Database
  - Storage (User avatars, trip covers, marker images)
  - Row Level Security (RLS)

### Development Tools
- **ESLint** - Linting utility
- **Vitest** - Unit testing framework
- **Playwright** - End-to-end testing
- **Prettier** - Code formatter

---

## 📦 Project Structure

```
woconapp/
├── src/
│   ├── components/         # Vue components
│   │   ├── common/         # Common components (Button, Input, Modal, etc.)
│   │   ├── map/            # Map components (WoconMap, MapMarker, MapRoute, etc.)
│   │   ├── trip/           # Trip-related components
│   │   └── auth/           # Authentication components
│   ├── views/              # Page components
│   ├── stores/             # Pinia stores
│   ├── composables/        # Composition API functions
│   ├── lib/                # API clients and utilities
│   ├── types/              # TypeScript type definitions
│   ├── router/             # Vue Router configuration
│   └── styles/             # Global styles
├── supabase/               # Database schema and migrations
└── public/                 # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Wocon-org/woconapp.git

# Navigate to project directory
cd woconapp

# Install dependencies
npm install
```

### Development

```bash
# Start development server with hot-reload
npm run dev
```

### Build for Production

```bash
# Type-check, compile and minify
npm run build
```

### Testing

```bash
# Run unit tests
npm run test:unit

# Install browsers for e2e tests (first time)
npx playwright install

# Run e2e tests
npm run test:e2e
```

### Linting

```bash
# Run ESLint
npm run lint
```

---

## 📚 Documentation

For detailed documentation, see:

- [Project Structure](开发参考/PROJECT_STRUCTURE.md)
- [Supabase Setup](开发参考/SUPABASE_SETUP.md)
- [Database Schema](supabase/schema.sql)

---

## 🗺️ Database Schema

Wocon uses PostgreSQL with the following main tables:

- **profiles** - User profiles and information
- **trips** - Trip details and metadata
- **trip_participants** - Trip participant relationships
- **map_markers** - Geographic markers on maps
- **routes** - Trip route planning data
- **geonames_locations** - GeoNames location data
- **geonames_places** - GeoNames place information

All tables use Row Level Security (RLS) to ensure data security.

---

## 🔐 Authentication

Wocon supports multiple authentication methods:

- Email/Password
- OAuth (GitHub, Google, Facebook, LinkedIn)

User profiles are automatically created upon registration with the following fields:
- Username (unique, cannot be changed)
- Nickname (can be changed)
- Email
- Avatar URL
- Bio

---

## 🎨 Design System

- **Primary Colors**: Blue-green gradient (#1e3a8a → #10b981)
- **Style**: Modern minimal design (Notion-inspired)
- **Typography**: System fonts with optimized rendering
- **Components**: Reusable Vue components with scoped styles

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Commit Convention

We follow the conventional commits specification:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Development team information coming soon...

---

## 📧 Contact

- Website: [wocon.org](https://wocon-org.github.io/)
- GitHub: [Wocon-org](https://github.com/Wocon-org)

---

## 🙏 Acknowledgments

- Vue.js team for the amazing framework
- Supabase for the excellent backend solution
- Leaflet for the open-source mapping library
- GeoNames for geographical location data

---

**Built with ❤️ by Wocon Team**
