# LaFontaine Noise Pulse 🎵🌿

A real-time environmental noise monitoring application for Lafontaine Park in Montreal, tracking the positive impact of electric vehicle adoption on urban noise pollution.

## 🌟 Live Demo

**Deployed App**: `https://carlosdenner.github.io/papineau-noise-pulse/`

## 🚀 Quick Start

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:8080
```

### GitHub Pages Deployment
```bash
# Build for production
npm run build:gh-pages

# Deploy (automatic via GitHub Actions)
git push origin main
```

## 📊 Features

- **Real-time Noise Monitoring**: Live sound level tracking at Papineau & Cartier intersection
- **EV Impact Analysis**: Correlates electric vehicle adoption with noise reduction
- **Privacy-Compliant Analytics**: Anonymized data collection respecting Quebec's Bill 64
- **Bilingual Support**: English and French interfaces
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Environmental Focus**: Tracks positive environmental impact in Montreal's Plateau

## 🛠️ How can I edit this code?

There are several ways of editing your application.

**Use **

Simply visit the [ Project](https://.dev/projects/728dbb75-a49c-4767-a13f-cb670f9380ce) and start prompting.

Changes made via will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone https://github.com/carlosdenner/papineau-noise-pulse.git

# Step 2: Navigate to the project directory
cd papineau-noise-pulse

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # UI components (shadcn/ui)
│   ├── ConsentDialog.tsx
│   ├── NoiseChart.tsx
│   └── NoiseDisplay.tsx
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
│   ├── analytics.ts    # Privacy-compliant analytics
│   └── storage/        # Storage adapters
├── data/               # Data models and adapters
└── pages/              # Page components
```

## 📈 Analytics & Privacy

This application implements privacy-first analytics:

- **Local Storage**: Data stays on user's device
- **Anonymized Data**: No personal information collected
- **Quebec Bill 64 Compliant**: Respects privacy regulations
- **Optional Azure Integration**: For advanced analytics

## 🔧 Available Scripts

```bash
# Development
npm run dev                 # Start development server
npm run build              # Build for production
npm run build:gh-pages     # Build for GitHub Pages
npm run preview           # Preview production build

# Deployment
npm run pre-deploy        # Clean + build for deployment
npm run setup-azure       # Setup Azure analytics (optional)

# Analytics
npm run analytics:local   # Use local storage
npm run analytics:azure   # Use Azure storage
```

## 🌍 Deployment

### GitHub Pages (Current)
- **URL**: `https://carlosdenner.github.io/papineau-noise-pulse/`
- **Automatic deployment** via GitHub Actions
- **Perfect for**: Public demonstrations, testing

### Azure (Optional)
- Enhanced analytics capabilities
- Custom domain support
- Advanced monitoring

See [GitHub Pages Deployment Guide](./docs/GITHUB_PAGES_DEPLOYMENT.md) for detailed instructions.

## 📊 Data Sources

- **EV Adoption**: Montreal/Quebec/Canada statistics
- **Noise Modeling**: DRSP noise maps validation
- **Traffic Patterns**: Papineau & Cartier intersection data
- **Environmental Impact**: Real-time correlation analysis

## 🤝 Contributing

This project is part of Carlos Denner's environmental monitoring initiative for Montreal.

## 📧 Contact

For questions about this project, contact the data-sciencetech team.

---

**Made with ❤️ for Montreal's environmental future**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [](https://.dev/projects/728dbb75-a49c-4767-a13f-cb670f9380ce) and click on Share -> Publish.

## Can I connect a custom domain to my project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs..dev/tips-tricks/custom-domain#step-by-step-guide)