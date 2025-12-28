# Spendora Quick Start Guide

## 🚀 Getting Started

You're all set! The project has been initialized with all dependencies installed.

### Start Development Mode

To run the application in development mode:

```bash
pnpm dev
```

This will:
1. Start the Vite development server (React UI) on `http://localhost:5173`
2. Compile the Electron TypeScript code
3. Launch the Electron desktop application

### What You Can Do

#### ✅ Manual Expense Entry
- Click "Add Expense" button
- Enter amount, category, description
- Choose payment method (UPI, Cash, or Card)
- Select if it's a one-time or recurring expense
- For recurring expenses, set the frequency

#### ✅ Budget Management
- Go to the "Budgets" tab
- Select a category and set a monthly limit
- Visual progress bars show your spending status
- Get alerts when approaching or exceeding limits

#### ✅ Recurring Expenses
- Go to the "Recurring" tab
- View all your subscription and recurring payments
- See estimated monthly totals
- Track next payment dates

#### ✅ Dashboard Overview
- View total spending for the current month
- Track budget vs. actual spending
- See remaining budget
- Monitor daily average spending

### Available Categories

- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Rent
- Subscriptions
- Others

### Payment Methods

- **UPI**: PhonePe, Google Pay, Paytm, etc.
- **Cash**: Physical currency
- **Card**: Credit/Debit cards

### Data Storage

All your expense and budget data is stored locally on your computer at:
- **macOS**: `~/Library/Application Support/spendora/spendora-data.json`
- **Windows**: `%APPDATA%/spendora/spendora-data.json`
- **Linux**: `~/.config/spendora/spendora-data.json`

Your data is completely private and never leaves your device!

### Building for Production

When you're ready to create a distributable application:

```bash
pnpm build
```

The built application will be in the `release` folder.

### Troubleshooting

**Issue**: App doesn't start
- Make sure all dependencies are installed: `pnpm install`
- Check if port 5173 is already in use

**Issue**: Changes not reflected
- The app uses hot reload. If it doesn't work, restart the dev server

**Issue**: Data not persisting
- Check if the app has write permissions to the application data directory

### Next Steps

1. Start the app with `pnpm dev`
2. Add your first expense
3. Set up budgets for your regular spending categories
4. Add your recurring expenses (rent, subscriptions, etc.)

Enjoy tracking your expenses with Spendora! 💰

