# Vercel Deployment Instructions for Stock Advisor App

This document provides step-by-step instructions for deploying the Stock Advisor application to Vercel.

## Prerequisites

- GitHub account
- Vercel account (you can sign up for free at https://vercel.com using your GitHub account)

## Deployment Steps

### 1. Prepare Your GitHub Repository

1. Create a new repository on GitHub
2. Unzip the provided `stock-advisor-vercel.zip` file to a local directory
3. Initialize a Git repository and push the code to GitHub:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/stock-advisor.git
git push -u origin main
```

### 2. Deploy to Vercel

#### Option 1: Deploy directly from the Vercel dashboard (Recommended)

1. Log in to your Vercel account at https://vercel.com
2. Click "Add New..." and select "Project"
3. Import your GitHub repository (you may need to connect your GitHub account first)
4. Keep all default settings - Vercel will automatically detect that it's a Next.js project
5. Click "Deploy"

#### Option 2: Deploy using the Vercel CLI

1. Install the Vercel CLI:
```bash
npm install -g vercel
```

2. Navigate to your project directory and run:
```bash
vercel
```

3. Follow the prompts to log in and configure your project

### 3. Access Your Deployed Application

Once the deployment is complete, Vercel will provide you with a URL to access your application (typically something like `https://stock-advisor.vercel.app`).

## Features of Your Deployed Application

- Real-time stock data from Yahoo Finance API
- Hourly updates of stock recommendations
- Focus on technical indicators and insider trading for US stocks
- Special emphasis on tech stocks as requested
- Responsive web interface with detailed analysis pages

## Making Updates

To update your application:

1. Make changes to your local code
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Description of changes"
git push
```

3. Vercel will automatically detect the changes and redeploy your application

## Troubleshooting

If you encounter any issues with the deployment:

1. Check the build logs in the Vercel dashboard
2. Ensure your GitHub repository is public or properly connected to Vercel
3. Verify that you haven't exceeded Vercel's free tier limits

## Additional Configuration (Optional)

### Custom Domain

1. Go to your project settings in the Vercel dashboard
2. Navigate to "Domains"
3. Add your custom domain and follow the instructions to configure DNS

### Environment Variables

If you need to add API keys or other environment variables:

1. Go to your project settings in the Vercel dashboard
2. Navigate to "Environment Variables"
3. Add your variables as needed
