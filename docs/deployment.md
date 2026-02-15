# Deployment Guide

This guide will walk you through deploying your Wocon application to various hosting platforms, with a focus on Cloudflare Pages.

## Prerequisites

Before deploying Wocon, ensure you have:

1. **A Supabase project** set up with the required tables and configuration
2. **Environment variables** configured for your production environment
3. **Node.js** installed (v16.0 or higher)
4. **Git** installed and configured
5. **A GitHub repository** with your Wocon code

## Deployment Options

### Option 1: Cloudflare Pages (Recommended)

Cloudflare Pages is recommended for Wocon due to its:
- **Global CDN** for fast content delivery
- **Automatic HTTPS** with free SSL certificates
- **Git integration** for automatic deployments
- **Preview environments** for testing changes
- **Generous free tier**

#### Step 1: Prepare Your GitHub Repository

1. Ensure your code is pushed to a GitHub repository
2. Create a `.gitignore` file if it doesn't exist:
   ```gitignore
   # Dependencies
   node_modules/
   
   # Environment variables
   .env
   .env.local
   .env.*.local
   
   # Build outputs
   dist/
   
   # IDE files
   .vscode/
   .idea/
   
   # OS files
   .DS_Store
   Thumbs.db
   ```

#### Step 2: Configure Environment Variables

1. In your Supabase Dashboard, navigate to **Project Settings** > **API**
2. Copy your **Project URL** and **Anon Key**
3. In your GitHub repository, go to **Settings** > **Secrets and variables** > **Actions**
4. Add the following secrets:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

#### Step 3: Set Up Cloudflare Pages

1. Log in to the [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** > **Create a project**
3. Select your GitHub repository from the list
4. Click **Begin setup**

#### Step 4: Configure Build Settings

1. **Project name**: Enter a name for your project (e.g., "wocon")
2. **Production branch**: Select your main branch (e.g., "main")
3. **Build settings**:
   - **Framework preset**: Select "Vue"
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: Leave as "="

#### Step 5: Add Environment Variables

1. Under **Environment variables** > **Production**, add:
   - `VITE_SUPABASE_URL` - Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key

2. Click **Save and Deploy**

#### Step 6: Verify Deployment

1. Cloudflare Pages will now build and deploy your application
2. Once deployment is complete, you'll see a success message with your deployment URL
3. Visit the URL to verify your Wocon application is working correctly

### Option 2: Vercel

#### Step 1: Prepare Your Code

Ensure your code is pushed to a GitHub repository.

#### Step 2: Import to Vercel

1. Log in to [Vercel](https://vercel.com)
2. Click **New Project**
3. Import your GitHub repository
4. Click **Deploy**

#### Step 3: Configure Environment Variables

1. After deployment, go to **Settings** > **Environment Variables**
2. Add the required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **Save**
4. Click **Redeploy** to apply the changes

### Option 3: Netlify

#### Step 1: Connect Your Repository

1. Log in to [Netlify](https://www.netlify.com)
2. Click **Add new site** > **Import an existing project**
3. Connect to GitHub and select your repository

#### Step 2: Configure Build Settings

1. **Build command**: `npm run build`
2. **Publish directory**: `dist`
3. Click **Deploy site**

#### Step 3: Set Environment Variables

1. Go to **Site settings** > **Build & deploy** > **Environment**
2. Add the required variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Click **Save**
4. Trigger a new deploy

### Option 4: GitHub Pages

#### Step 1: Configure Your Project

1. Install the `gh-pages` package:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Update `vite.config.ts` to set the base URL:
   ```typescript
   import { defineConfig } from 'vite'
   import vue from '@vitejs/plugin-vue'
   
   export default defineConfig({
     plugins: [vue()],
     base: '/your-repository-name/'
   })
   ```

3. Add deploy scripts to `package.json`:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

#### Step 2: Build and Deploy

1. Build your project:
   ```bash
   npm run build
   ```

2. Deploy to GitHub Pages:
   ```bash
