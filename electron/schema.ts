import { sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Expenses table
export const expenses = sqliteTable("expenses", {
	id: text("id").primaryKey(),
	amount: real("amount").notNull(),
	category: text("category").notNull(),
	description: text("description").notNull(),
	date: text("date").notNull(),
	paymentMethod: text("payment_method", {
		enum: ["upi", "cash", "card"],
	}).notNull(),
	type: text("type", { enum: ["one-time", "recurring"] }).notNull(),
	recurringFrequency: text("recurring_frequency", {
		enum: ["daily", "weekly", "monthly", "yearly"],
	}),
	recurringNextDate: text("recurring_next_date"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Budgets table
export const budgets = sqliteTable("budgets", {
	id: text("id").primaryKey(),
	category: text("category").notNull(),
	monthlyLimit: real("monthly_limit").notNull(),
	currentSpend: real("current_spend").notNull().default(0),
	month: text("month").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Loans table
export const loans = sqliteTable("loans", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	type: text("type", {
		enum: ["home", "car", "personal", "credit_card", "other"],
	}).notNull(),
	principalAmount: real("principal_amount").notNull(),
	interestRate: real("interest_rate").notNull(),
	tenureMonths: real("tenure_months").notNull(),
	startDate: text("start_date").notNull(),
	emiAmount: real("emi_amount").notNull(),
	remainingPrincipal: real("remaining_principal").notNull(),
	nextEmiDate: text("next_emi_date"),
	isPaidOff: real("is_paid_off").notNull().default(0), // 0 for false, 1 for true
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Loan Payments table to track each EMI
export const loanPayments = sqliteTable("loan_payments", {
	id: text("id").primaryKey(),
	loanId: text("loan_id")
		.notNull()
		.references(() => loans.id, { onDelete: "cascade" }),
	amount: real("amount").notNull(),
	principalComponent: real("principal_component").notNull(),
	interestComponent: real("interest_component").notNull(),
	date: text("date").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Assets table for investments & portfolio tracking
export const assets = sqliteTable("assets", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	type: text("type", {
		enum: [
			"stocks",
			"mutual_funds",
			"etf",
			"gold_physical",
			"gold_digital",
			"real_estate",
			"land",
			"cash",
			"fd",
			"rd",
			"esop",
			"private_equity",
			"ppf",
			"epf",
			"nps",
			"bonds",
			"crypto",
			"other",
		],
	}).notNull(),
	investedAmount: real("invested_amount").notNull(), // Purchase/invested value
	currentValue: real("current_value").notNull(), // Current market value
	units: real("units"), // For stocks, MF, etc.
	purchaseDate: text("purchase_date").notNull(),
	lastUpdated: text("last_updated").notNull(),
	notes: text("notes"),
	// For linked goals
	linkedGoalId: text("linked_goal_id"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Asset value history for tracking appreciation
export const assetValueHistory = sqliteTable("asset_value_history", {
	id: text("id").primaryKey(),
	assetId: text("asset_id")
		.notNull()
		.references(() => assets.id, { onDelete: "cascade" }),
	value: real("value").notNull(),
	date: text("date").notNull(),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Financial goals table
export const goals = sqliteTable("goals", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	type: text("type", {
		enum: [
			"house",
			"car",
			"retirement",
			"travel",
			"education",
			"wedding",
			"emergency_fund",
			"other",
		],
	}).notNull(),
	targetAmount: real("target_amount").notNull(),
	currentAmount: real("current_amount").notNull().default(0),
	targetDate: text("target_date").notNull(),
	priority: text("priority", {
		enum: ["high", "medium", "low"],
	})
		.notNull()
		.default("medium"),
	status: text("status", {
		enum: ["active", "completed", "paused"],
	})
		.notNull()
		.default("active"),
	notes: text("notes"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Net worth snapshots for tracking over time
export const netWorthHistory = sqliteTable("net_worth_history", {
	id: text("id").primaryKey(),
	date: text("date").notNull(),
	totalAssets: real("total_assets").notNull(),
	totalLiabilities: real("total_liabilities").notNull(),
	netWorth: real("net_worth").notNull(),
	// Breakdown
	assetsBreakdown: text("assets_breakdown"), // JSON string
	liabilitiesBreakdown: text("liabilities_breakdown"), // JSON string
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});

// Types inferred from schema
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
export type LoanPayment = typeof loanPayments.$inferSelect;
export type NewLoanPayment = typeof loanPayments.$inferInsert;
export type Asset = typeof assets.$inferSelect;
export type NewAsset = typeof assets.$inferInsert;
export type AssetValueHistory = typeof assetValueHistory.$inferSelect;
export type NewAssetValueHistory = typeof assetValueHistory.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type NetWorthHistory = typeof netWorthHistory.$inferSelect;
export type NewNetWorthHistory = typeof netWorthHistory.$inferInsert;

// Export types for compatibility with existing code
export type ExpenseType = "one-time" | "recurring";
export type PaymentMethod = "upi" | "cash" | "card";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type LoanType = "home" | "car" | "personal" | "credit_card" | "other";
export type AssetType =
	| "stocks"
	| "mutual_funds"
	| "etf"
	| "gold_physical"
	| "gold_digital"
	| "real_estate"
	| "land"
	| "cash"
	| "fd"
	| "rd"
	| "esop"
	| "private_equity"
	| "ppf"
	| "epf"
	| "nps"
	| "bonds"
	| "crypto"
	| "other";
export type GoalType =
	| "house"
	| "car"
	| "retirement"
	| "travel"
	| "education"
	| "wedding"
	| "emergency_fund"
	| "other";
export type GoalPriority = "high" | "medium" | "low";
export type GoalStatus = "active" | "completed" | "paused";
