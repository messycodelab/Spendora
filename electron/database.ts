import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, sql } from "drizzle-orm";
import * as path from "path";
import * as fs from "fs";
import * as schema from "./schema";
import { expenses, budgets, type Expense, type Budget } from "./schema";

let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export type { Expense, Budget };

export function initDatabase(dbPath: string): ReturnType<typeof drizzle> {
	// Ensure directory exists
	const dbDir = path.dirname(dbPath);
	if (!fs.existsSync(dbDir)) {
		fs.mkdirSync(dbDir, { recursive: true });
	}

	// Initialize better-sqlite3
	sqlite = new Database(dbPath);

	// Enable WAL mode for better performance
	sqlite.pragma("journal_mode = WAL");

	// Initialize Drizzle with the schema
	db = drizzle(sqlite, { schema });

	// Create tables if they don't exist
	createTables(sqlite);

	return db;
}

function createTables(database: Database.Database): void {
	// Create expenses table
	database.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      payment_method TEXT NOT NULL CHECK(payment_method IN ('upi', 'cash', 'card')),
      type TEXT NOT NULL CHECK(type IN ('one-time', 'recurring')),
      recurring_frequency TEXT CHECK(recurring_frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
      recurring_next_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Create budgets table
	database.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      monthly_limit REAL NOT NULL,
      current_spend REAL NOT NULL DEFAULT 0,
      month TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(category, month)
    );
  `);

	// Create indexes for better query performance
	database.exec(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
  `);
}

export function getDatabase(): ReturnType<typeof drizzle> {
	if (!db) {
		throw new Error("Database not initialized. Call initDatabase first.");
	}
	return db;
}

export function closeDatabase(): void {
	if (sqlite) {
		sqlite.close();
		sqlite = null;
		db = null;
	}
}

// Expense operations using Drizzle ORM
export function getAllExpenses(): Expense[] {
	const database = getDatabase();

	const results = database
		.select({
			id: expenses.id,
			amount: expenses.amount,
			category: expenses.category,
			description: expenses.description,
			date: expenses.date,
			paymentMethod: expenses.paymentMethod,
			type: expenses.type,
			recurringFrequency: expenses.recurringFrequency,
			recurringNextDate: expenses.recurringNextDate,
			createdAt: expenses.createdAt,
		})
		.from(expenses)
		.orderBy(sql`${expenses.date} DESC`)
		.all();

	return results;
}

export function addExpense(expense: Omit<Expense, "createdAt">): Expense {
	const database = getDatabase();

	// Insert the expense
	database.insert(expenses).values(expense).run();

	// Update budget if exists
	const currentMonth = new Date().toISOString().slice(0, 7);

	database
		.update(budgets)
		.set({
			currentSpend: sql`${budgets.currentSpend} + ${expense.amount}`,
		})
		.where(
			and(
				eq(budgets.category, expense.category),
				eq(budgets.month, currentMonth),
			),
		)
		.run();

	// Return the inserted expense
	const inserted = database
		.select()
		.from(expenses)
		.where(eq(expenses.id, expense.id))
		.get();

	if (!inserted) {
		throw new Error("Failed to insert expense");
	}

	return inserted;
}

export function deleteExpense(id: string): boolean {
	const database = getDatabase();

	// Get expense details before deleting
	const expense = database
		.select({
			amount: expenses.amount,
			category: expenses.category,
			date: expenses.date,
		})
		.from(expenses)
		.where(eq(expenses.id, id))
		.get();

	if (!expense) {
		return false;
	}

	// Delete expense
	database.delete(expenses).where(eq(expenses.id, id)).run();

	// Update budget
	const currentMonth = new Date().toISOString().slice(0, 7);

	database
		.update(budgets)
		.set({
			currentSpend: sql`${budgets.currentSpend} - ${expense.amount}`,
		})
		.where(
			and(
				eq(budgets.category, expense.category),
				eq(budgets.month, currentMonth),
			),
		)
		.run();

	return true;
}

export function getRecurringExpenses(): Expense[] {
	const database = getDatabase();

	return database
		.select()
		.from(expenses)
		.where(eq(expenses.type, "recurring"))
		.orderBy(sql`${expenses.date} DESC`)
		.all();
}

// Budget operations using Drizzle ORM
export function getAllBudgets(): Budget[] {
	const database = getDatabase();

	return database
		.select()
		.from(budgets)
		.orderBy(sql`${budgets.month} DESC, ${budgets.category}`)
		.all();
}

export function setBudget(budget: Omit<Budget, "createdAt">): Budget {
	const database = getDatabase();

	// Try to update existing budget
	const existing = database
		.select()
		.from(budgets)
		.where(
			and(
				eq(budgets.category, budget.category),
				eq(budgets.month, budget.month),
			),
		)
		.get();

	if (existing) {
		// Update existing
		database
			.update(budgets)
			.set({
				monthlyLimit: budget.monthlyLimit,
				currentSpend: budget.currentSpend,
			})
			.where(eq(budgets.id, existing.id))
			.run();

		const updated = database
			.select()
			.from(budgets)
			.where(eq(budgets.id, existing.id))
			.get();

		if (!updated) {
			throw new Error("Failed to update budget");
		}

		return updated;
	} else {
		// Insert new budget
		database.insert(budgets).values(budget).run();

		const inserted = database
			.select()
			.from(budgets)
			.where(eq(budgets.id, budget.id))
			.get();

		if (!inserted) {
			throw new Error("Failed to insert budget");
		}

		return inserted;
	}
}

// Migration utility - import from JSON
export function migrateFromJSON(jsonData: {
	expenses: Expense[];
	budgets: Budget[];
}): void {
	const database = getDatabase();

	// Use transaction for atomic migration
	if (sqlite) {
		const migrate = sqlite.transaction(() => {
			// Migrate expenses
			for (const expense of jsonData.expenses) {
				database
					.insert(expenses)
					.values({
						id: expense.id,
						amount: expense.amount,
						category: expense.category,
						description: expense.description,
						date: expense.date,
						paymentMethod: expense.paymentMethod,
						type: expense.type,
						recurringFrequency: expense.recurringFrequency || null,
						recurringNextDate: expense.recurringNextDate || null,
					})
					.onConflictDoNothing()
					.run();
			}

			// Migrate budgets
			for (const budget of jsonData.budgets) {
				database
					.insert(budgets)
					.values({
						id: budget.id,
						category: budget.category,
						monthlyLimit: budget.monthlyLimit,
						currentSpend: budget.currentSpend,
						month: budget.month,
					})
					.onConflictDoNothing()
					.run();
			}
		});

		migrate();
		console.log(
			`Migration complete: ${jsonData.expenses.length} expenses, ${jsonData.budgets.length} budgets`,
		);
	}
}
