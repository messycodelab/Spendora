# 🎉 Spendora - Complete Personal Finance Hub

## ✨ What Has Been Built

A fully functional **Electron desktop application** for comprehensive personal finance management with expense tracking, investment portfolio management, net worth tracking, and financial goal planning.

## 📦 Core Features Implemented

### 1. 💰 Manual Expense Entry
- ✅ Add expenses with amount, category, and description
- ✅ Support for multiple payment methods:
  - UPI (PhonePe, Google Pay, etc.)
  - Cash
  - Card (Credit/Debit)
- ✅ One-time or recurring expense types
- ✅ Date selection for expense logging
- ✅ Beautiful dialog-based form with validation

### 2. 📊 Category-wise Budgeting
- ✅ Set monthly spending limits per category
- ✅ Visual progress bars showing budget utilization
- ✅ Color-coded alerts:
  - 🟢 Green: Under 80% of budget
  - 🟡 Yellow: 80-99% of budget
  - 🔴 Red: Over budget
- ✅ Real-time budget tracking
- ✅ Shows remaining budget for each category
- ✅ 2-column compact card layout

### 3. 🔄 Recurring Expenses Tracking
- ✅ Track subscriptions and regular payments
- ✅ Support for multiple frequencies:
  - Daily
  - Weekly
  - Monthly
  - Yearly
- ✅ Automatic calculation of monthly impact
- ✅ Next payment date tracking
- ✅ Estimated monthly total display
- ✅ 2-column compact card layout

### 4. 📈 Dashboard Overview
- ✅ Total spending vs budget for current month
- ✅ Visual progress bar with color coding
- ✅ Recurring expenses summary
- ✅ Daily spending trend chart (Area Chart)
- ✅ Category distribution (Pie Chart)
- ✅ Transaction counts
- ✅ Beautiful card-based layout

### 5. 📝 Expense List
- ✅ Collapsible date-grouped transactions
- ✅ Ultra-compact table layout
- ✅ Payment method icons
- ✅ Recurring expense indicators
- ✅ Delete functionality
- ✅ Category and date display
- ✅ Formatted currency (INR)

### 6. 🏦 Loans & Liabilities Tracking
- ✅ Track multiple loan types (Home, Car, Personal, Credit Card, Other)
- ✅ Automatic EMI calculation using built-in calculator
- ✅ Track Principal and Interest (P&I) split for every payment
- ✅ Visual repayment progress bars
- ✅ Automatic next EMI date tracking
- ✅ Total monthly debt obligation snapshot
- ✅ Log EMI payments with prominent button
- ✅ Payment history tracking

### 7. 📊 Investments & Assets Portfolio
- ✅ Portfolio tracking across all asset types:
  - 📈 **Market**: Stocks, Mutual Funds, ETFs
  - 🥇 **Gold**: Physical Gold, Digital Gold
  - 🏠 **Property**: Real Estate, Land
  - 🏦 **Fixed Income**: FD, RD, PPF, EPF, NPS, Bonds
  - 💼 **Alternative**: ESOPs, Private Equity, Crypto
  - 💵 **Cash**: Cash & Savings
- ✅ Asset-wise allocation pie chart
- ✅ Manual valuation and appreciation tracking
- ✅ Gain/Loss calculation with percentage
- ✅ Category-based filtering
- ✅ Link assets to financial goals
- ✅ Value history tracking

### 8. 💎 Net Worth & Financial Health
- ✅ Complete net-worth calculation (Assets - Liabilities)
- ✅ Beautiful gradient summary card
- ✅ Net-worth trend over time (Area Chart)
- ✅ Assets vs Liabilities breakdown (Bar Chart)
- ✅ Asset/Debt ratio visualization
- ✅ Emergency fund tracking:
  - Shows months of coverage
  - Health indicator (6+ months = healthy)
- ✅ Take snapshot feature for historical tracking
- ✅ Financial health summary:
  - Net Worth status (Positive/Negative)
  - Asset/Debt ratio health
  - Emergency fund coverage
  - Portfolio diversification

### 9. 🎯 Financial Goals & Planning
- ✅ Create financial goals:
  - 🏠 House
  - 🚗 Car
  - 🏖️ Retirement
  - ✈️ Travel
  - 🎓 Education
  - 💒 Wedding
  - 🛡️ Emergency Fund
  - 🎯 Custom goals
- ✅ Goal-linked investments
- ✅ Progress tracking with visual bars
- ✅ Priority levels (High, Medium, Low)
- ✅ Timeline tracking:
  - Target date
  - Time remaining
  - Monthly savings needed
- ✅ Status management (Active, Paused, Completed)
- ✅ Add contributions to goals
- ✅ Linked assets display

## 🛠️ Technology Stack

| Component | Technology |
|-----------|-----------|
| Desktop Framework | **Electron 28** |
| UI Framework | **React 18** |
| Language | **TypeScript** |
| Build Tool | **Vite 5** |
| UI Components | **shadcn/ui** |
| Styling | **Tailwind CSS** |
| Database | **SQLite** |
| ORM | **Drizzle ORM** |
| Icons | **Lucide React** |
| Charts | **Recharts** |
| State Management | **React Hooks** |
| Data Storage | **Better-SQLite3** |

## 📁 Project Structure

```
Spendora/
├── electron/                 # Electron main process
│   ├── main.ts              # Main process with IPC handlers
│   ├── preload.ts           # Secure IPC bridge
│   ├── database.ts          # Database operations (CRUD)
│   ├── schema.ts            # Drizzle ORM schema
│   └── tsconfig.json        # Electron TypeScript config
├── src/
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── select.tsx
│   │   │   └── tabs.tsx
│   │   ├── LoansLiabilities/    # Loans feature
│   │   │   ├── LoansLiabilities.tsx
│   │   │   ├── LoanCard.tsx
│   │   │   ├── AddLoanDialog.tsx
│   │   │   └── AddPaymentDialog.tsx
│   │   ├── Investments/         # Portfolio tracking
│   │   │   ├── Investments.tsx
│   │   │   ├── AssetCard.tsx
│   │   │   └── AddAssetDialog.tsx
│   │   ├── NetWorth/            # Net worth tracking
│   │   │   └── NetWorth.tsx
│   │   ├── Goals/               # Financial goals
│   │   │   ├── Goals.tsx
│   │   │   ├── GoalCard.tsx
│   │   │   └── AddGoalDialog.tsx
│   │   ├── AddExpenseDialog.tsx    # Expense entry form
│   │   ├── ExpenseList.tsx         # Transaction list
│   │   ├── BudgetManager.tsx       # Budget management
│   │   ├── RecurringExpenses.tsx   # Recurring payments
│   │   └── Dashboard.tsx           # Overview dashboard
│   ├── lib/
│   │   ├── utils.ts         # Utility functions
│   │   └── expense-adapter.ts # Data normalization
│   ├── types/
│   │   └── index.ts         # TypeScript types
│   ├── App.tsx              # Main application
│   ├── main.tsx             # React entry point
│   └── index.css            # Global styles
├── index.html               # HTML template
├── package.json             # Dependencies & scripts
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── drizzle.config.ts        # Drizzle ORM configuration
├── tsconfig.json            # React TypeScript config
└── README.md                # Documentation
```

## 🎨 UI Features

- **Modern Design**: Clean, professional interface with shadcn/ui
- **Docker-style Navbar**: Dark header with search, notifications, settings
- **Responsive Layout**: Adapts to different window sizes
- **Color-Coded Feedback**: Visual indicators for budget/goal status
- **Floating Action Button**: Quick access to add expenses
- **Icon-Based Navigation**: Clear visual communication
- **Smooth Animations**: Tailwind CSS animations
- **Gradient Cards**: Beautiful summary cards with gradients
- **Interactive Charts**: Recharts-powered data visualization
- **Accessible**: Built on Radix UI primitives

## 🔐 Data & Privacy

- **Local Storage**: All data stored on your computer in SQLite
- **No Cloud**: Complete privacy, no data leaves your device
- **SQLite Database**: Robust, reliable data storage
- **IPC Security**: Context isolation and secure preload bridge
- **WAL Mode**: Better performance with Write-Ahead Logging

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `expenses` | One-time and recurring expenses |
| `budgets` | Monthly category budgets |
| `loans` | Loan/liability tracking |
| `loan_payments` | EMI payment history |
| `assets` | Investment portfolio |
| `asset_value_history` | Asset valuation history |
| `goals` | Financial goals |
| `net_worth_history` | Net worth snapshots |

## 🚀 How to Run

### Development Mode
```bash
pnpm dev
```
Opens the app with hot reload for development.

### Build for Production
```bash
pnpm build
```
Creates distributable application in the `release/` folder.

## 📋 Available Categories

1. Food & Dining
2. Transportation
3. Shopping
4. Entertainment
5. Bills & Utilities
6. Healthcare
7. Education
8. Rent
9. Subscriptions
10. Others

## 🎯 Key Features Highlights

### Smart Budget Tracking
- Automatically updates budget spend when expenses are added/deleted
- Monthly budget resets
- Multi-category support

### Comprehensive Portfolio
- Track 18+ asset types
- Real-time gain/loss calculation
- Category-wise allocation view

### Net Worth Intelligence
- Complete financial picture
- Historical trend analysis
- Health indicators

### Goal-Based Planning
- Link investments to goals
- Progress tracking
- Monthly savings recommendations

### Beautiful Dashboard
- At-a-glance financial overview
- Interactive charts
- Color-coded status indicators

## 📱 App Navigation

The app features 7 main tabs:
1. **Expenses**: View and manage all transactions
2. **Budgets**: Set and track category budgets
3. **Recurring**: Manage subscriptions and recurring payments
4. **Loans**: Track EMIs and liabilities
5. **Investments**: Portfolio and asset tracking
6. **Net Worth**: Complete financial health view
7. **Goals**: Financial planning and milestones

## 🎊 Ready to Use!

Your Spendora personal finance hub is **100% complete** and ready to use. Simply run:

```bash
pnpm dev
```

Start tracking your finances, build your investment portfolio, monitor your net worth, and achieve your financial goals! 💪

---

**Built with ❤️ using Electron, React, SQLite, and shadcn/ui**
