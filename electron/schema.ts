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

// Types inferred from schema
export type Expense = typeof expenses.$inferSelect;
export type NewExpense = typeof expenses.$inferInsert;
export type Budget = typeof budgets.$inferSelect;
export type NewBudget = typeof budgets.$inferInsert;

// Export types for compatibility with existing code
export type ExpenseType = "one-time" | "recurring";
export type PaymentMethod = "upi" | "cash" | "card";
export type RecurringFrequency = "daily" | "weekly" | "monthly" | "yearly";
