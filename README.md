# Spendora - Smart Expense Tracker

A modern, Electron-based expense tracking application built with React, TypeScript, and shadcn/ui.

## Features

### Core Money Management
- **Manual Expense Entry**: Record expenses with support for multiple payment methods (UPI, Cash, Card)
- **Category-wise Budgeting**: Set and track monthly spending limits for different categories
- **Recurring Expenses**: Track subscription and regular payments with automatic frequency management

### Categories
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

## Tech Stack

- **Electron**: Desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe development
- **SQLite + Drizzle ORM**: Fast, type-safe database
- **Vite**: Fast build tool
- **shadcn/ui**: Beautiful UI components
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible components
- **Lucide React**: Icon library

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- pnpm (recommended) or npm

### Installation

1. Clone the repository
```bash
cd Spendora
```

2. Install dependencies
```bash
pnpm install
```

3. Run the development server
```bash
pnpm dev
```

This will start both the Vite development server and the Electron app.

### Building for Production

```bash
pnpm build
```

The built application will be available in the `release` folder.

## Project Structure

```
Spendora/
├── electron/           # Electron main process files
│   ├── main.ts        # Main process entry point
│   ├── database.ts    # Database operations with Drizzle ORM
│   ├── schema.ts      # Drizzle schema definitions
│   └── preload.ts     # Preload script for secure IPC
├── src/
│   ├── components/    # React components
│   │   ├── ui/       # shadcn/ui components
│   │   ├── AddExpenseDialog.tsx
│   │   ├── ExpenseList.tsx
│   │   ├── BudgetManager.tsx
│   │   ├── RecurringExpenses.tsx
│   │   └── Dashboard.tsx
│   ├── lib/          # Utility functions
│   ├── types/        # TypeScript type definitions
│   ├── App.tsx       # Main App component
│   ├── main.tsx      # React entry point
│   └── index.css     # Global styles
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Data Storage

All expense and budget data is stored locally in a **SQLite database** in the user's application data directory. The app uses:
- **SQLite** for fast, reliable data storage with ACID transactions
- **Electron's IPC** for secure communication between UI and database
- **Automatic migration** from old JSON format (if exists)

### Database Location
- **macOS**: `~/Library/Application Support/spendora/spendora.db`
- **Windows**: `%APPDATA%/spendora/spendora.db`
- **Linux**: `~/.config/spendora/spendora.db`

## Features in Detail

### Manual Expense Entry
- Add expenses with amount, category, description
- Choose payment method (UPI, Cash, Card)
- Mark as one-time or recurring expense
- Set frequency for recurring expenses (daily, weekly, monthly, yearly)

### Budget Management
- Set monthly spending limits per category
- Visual progress bars showing budget utilization
- Color-coded alerts when approaching or exceeding limits
- Track remaining budget in real-time

### Recurring Expenses
- Track all recurring payments in one place
- View estimated monthly total from all recurring expenses
- See next payment dates
- Automatic calculation of monthly impact based on frequency

### Dashboard
- Overview of monthly spending
- Total budget vs. actual spending
- Remaining budget
- Daily average spending
- Transaction counts

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

