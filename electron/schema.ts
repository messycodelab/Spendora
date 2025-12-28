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

// Types inferred from schema
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;
export type Loan = typeof loans.$inferSelect;
export type NewLoan = typeof loans.$inferInsert;
export type LoanPayment = typeof loanPayments.$inferSelect;
export type NewLoanPayment = typeof loanPayments.$inferInsert;

// Export types for compatibility with existing code
export type ExpenseType = "one-time" | "recurring";
export type PaymentMethod = "upi" | "cash" | "card";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
export type LoanType = "home" | "car" | "personal" | "credit_card" | "other";
