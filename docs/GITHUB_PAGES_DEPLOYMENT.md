# GitHub Pages Deployment Guide

## 🚀 Deploying LaFontaine Noise Pulse to GitHub Pages

This guide will help you deploy your noise monitoring application to GitHub Pages under your personal GitHub account.

### Prerequisites

1. **GitHub Repository Setup**
   - Repository: `https://github.com/carlosdenner/papineau-noise-pulse`
   - Repository should be public (required for GitHub Pages on free plans)

### Step-by-Step Deployment

#### 1. **Push Your Code to GitHub**
```bash
# If you haven't initialized git yet
git init
git add .
git commit -m "Initial commit - LaFontaine Noise Pulse app"

# Add your GitHub repository as origin
git remote add origin https://github.com/carlosdenner/papineau-noise-pulse.git
git branch -M main
git push -u origin main
```

#### 2. **Enable GitHub Pages**
1. Go to your repository: `https://github.com/carlosdenner/papineau-noise-pulse`
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. The workflow will automatically deploy when you push to main

#### 3. **Verify Deployment**
- Your app will be available at: `https://carlosdenner.github.io/papineau-noise-pulse/`
- First deployment may take 2-3 minutes
- Check the **Actions** tab to monitor deployment progress

### 🔧 Local Development Commands

```bash
# Development server
npm run dev

# Build for GitHub Pages
npm run build:gh-pages

# Preview GitHub Pages build locally
npm run preview:gh-pages

# Full pre-deployment (cleanup + build)
npm run pre-deploy
```

### 📊 Analytics Configuration

The app includes privacy-compliant analytics that work with:

1. **Local Storage** (Default for GitHub Pages)
   - No additional setup required
   - Data stays on user's device
   - Perfect for privacy compliance

2. **Azure Integration** (Optional)
   - Run `npm run setup-azure` for Azure setup
   - Configure environment variables
   - Suitable for production deployments

### 🔧 Customization

#### Changing the Base URL
If you want to deploy to a different repository name:

1. Update `vite.config.ts`:
```typescript
base: process.env.NODE_ENV === 'production' ? '/your-repo-name/' : '/',
```

2. Update the GitHub workflow in `.github/workflows/deploy.yml`:
```yaml
env:
  PUBLIC_URL: /your-repo-name
```

#### Custom Domain
To use a custom domain:

1. Add a `CNAME` file to the `public/` directory:
```
your-domain.com
```

2. Configure DNS to point to `carlosdenner.github.io`

### 🐛 Troubleshooting

#### Build Fails
- Check the Actions tab for error details
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

#### Assets Not Loading
- Check that `base` is correctly set in `vite.config.ts`
- Ensure asset paths are relative (start with `./` or `/`)

#### Analytics Not Working
- Check browser console for errors
- Verify storage permissions
- Test with local storage first

### 🚀 Next Steps

1. **Monitor Performance**: Use the built-in analytics dashboard
2. **Add Custom Domain**: Configure DNS for professional URL
3. **Enable Azure Analytics**: For advanced data collection
4. **Set up CI/CD**: Automatic deployments on code changes

### 📞 Support

For deployment issues:
- Check GitHub Actions logs
- Verify repository permissions
- Ensure organization settings allow Pages

---

**Your app will be live at**: `https://carlosdenner.github.io/papineau-noise-pulse/`
