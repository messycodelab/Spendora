import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, and, sql, desc } from "drizzle-orm";
import * as path from "path";
import * as fs from "fs";
import * as schema from "./schema";
import {
	expenses,
	budgets,
	loans,
	loanPayments,
	assets,
	assetValueHistory,
	goals,
	netWorthHistory,
	type Expense,
	type Budget,
	type Loan,
	type LoanPayment,
	type Asset,
	type AssetValueHistory,
	type Goal,
	type NetWorthHistory,
} from "./schema";

let db: ReturnType<typeof drizzle> | null = null;
let sqlite: Database.Database | null = null;

export type {
	Expense,
	Budget,
	Loan,
	LoanPayment,
	Asset,
	AssetValueHistory,
	Goal,
	NetWorthHistory,
};

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

	// Create loans table
	database.exec(`
    CREATE TABLE IF NOT EXISTS loans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('home', 'car', 'personal', 'credit_card', 'other')),
      principal_amount REAL NOT NULL,
      interest_rate REAL NOT NULL,
      tenure_months REAL NOT NULL,
      start_date TEXT NOT NULL,
      emi_amount REAL NOT NULL,
      remaining_principal REAL NOT NULL,
      next_emi_date TEXT,
      is_paid_off REAL NOT NULL DEFAULT 0,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Create loan_payments table
	database.exec(`
    CREATE TABLE IF NOT EXISTS loan_payments (
      id TEXT PRIMARY KEY,
      loan_id TEXT NOT NULL,
      amount REAL NOT NULL,
      principal_component REAL NOT NULL,
      interest_component REAL NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(loan_id) REFERENCES loans(id) ON DELETE CASCADE
    );
  `);

	// Create assets table
	database.exec(`
    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('stocks', 'mutual_funds', 'etf', 'gold_physical', 'gold_digital', 'real_estate', 'land', 'cash', 'fd', 'rd', 'esop', 'private_equity', 'ppf', 'epf', 'nps', 'bonds', 'crypto', 'other')),
      invested_amount REAL NOT NULL,
      current_value REAL NOT NULL,
      units REAL,
      purchase_date TEXT NOT NULL,
      last_updated TEXT NOT NULL,
      notes TEXT,
      linked_goal_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Create asset_value_history table
	database.exec(`
    CREATE TABLE IF NOT EXISTS asset_value_history (
      id TEXT PRIMARY KEY,
      asset_id TEXT NOT NULL,
      value REAL NOT NULL,
      date TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(asset_id) REFERENCES assets(id) ON DELETE CASCADE
    );
  `);

	// Create goals table
	database.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('house', 'car', 'retirement', 'travel', 'education', 'wedding', 'emergency_fund', 'other')),
      target_amount REAL NOT NULL,
      current_amount REAL NOT NULL DEFAULT 0,
      target_date TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('high', 'medium', 'low')),
      status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'completed', 'paused')),
      notes TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Create net_worth_history table
	database.exec(`
    CREATE TABLE IF NOT EXISTS net_worth_history (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      total_assets REAL NOT NULL,
      total_liabilities REAL NOT NULL,
      net_worth REAL NOT NULL,
      assets_breakdown TEXT,
      liabilities_breakdown TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

	// Create indexes for better query performance
	database.exec(`
    CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
    CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
    CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
    CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);
    CREATE INDEX IF NOT EXISTS idx_loans_type ON loans(type);
    CREATE INDEX IF NOT EXISTS idx_loan_payments_loan_id ON loan_payments(loan_id);
    CREATE INDEX IF NOT EXISTS idx_loan_payments_date ON loan_payments(date);
    CREATE INDEX IF NOT EXISTS idx_assets_type ON assets(type);
    CREATE INDEX IF NOT EXISTS idx_assets_linked_goal ON assets(linked_goal_id);
    CREATE INDEX IF NOT EXISTS idx_asset_value_history_asset_id ON asset_value_history(asset_id);
    CREATE INDEX IF NOT EXISTS idx_goals_status ON goals(status);
    CREATE INDEX IF NOT EXISTS idx_goals_type ON goals(type);
    CREATE INDEX IF NOT EXISTS idx_net_worth_history_date ON net_worth_history(date);
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

// Loan operations
export function getAllLoans(): Loan[] {
	const database = getDatabase();
	return database.select().from(loans).all();
}

export function addLoan(loan: Omit<Loan, "createdAt">): Loan {
	const database = getDatabase();
	database.insert(loans).values(loan).run();

	const inserted = database
		.select()
		.from(loans)
		.where(eq(loans.id, loan.id))
		.get();

	if (!inserted) {
		throw new Error("Failed to insert loan");
	}

	return inserted;
}

export function updateLoan(
	id: string,
	updates: Partial<Omit<Loan, "id" | "createdAt">>,
): Loan {
	const database = getDatabase();
	database.update(loans).set(updates).where(eq(loans.id, id)).run();

	const updated = database.select().from(loans).where(eq(loans.id, id)).get();

	if (!updated) {
		throw new Error("Failed to update loan");
	}

	return updated;
}

export function deleteLoan(id: string): boolean {
	const database = getDatabase();
	database.delete(loans).where(eq(loans.id, id)).run();
	return true;
}

// Loan Payment operations
export function getLoanPayments(loanId: string): LoanPayment[] {
	const database = getDatabase();
	return database
		.select()
		.from(loanPayments)
		.where(eq(loanPayments.loanId, loanId))
		.orderBy(sql`${loanPayments.date} DESC`)
		.all();
}

export function addLoanPayment(
	payment: Omit<LoanPayment, "createdAt">,
): LoanPayment {
	const database = getDatabase();

	// Use transaction to update loan remaining principal
	if (sqlite) {
		const addPayment = sqlite.transaction(() => {
			database.insert(loanPayments).values(payment).run();

			database
				.update(loans)
				.set({
					remainingPrincipal: sql`${loans.remainingPrincipal} - ${payment.principalComponent}`,
				})
				.where(eq(loans.id, payment.loanId))
				.run();
		});

		addPayment();
	}

	const inserted = database
		.select()
		.from(loanPayments)
		.where(eq(loanPayments.id, payment.id))
		.get();

	if (!inserted) {
		throw new Error("Failed to insert loan payment");
	}

	return inserted;
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

// ==================== ASSET OPERATIONS ====================

export function getAllAssets(): Asset[] {
	const database = getDatabase();
	return database
		.select()
		.from(assets)
		.orderBy(desc(assets.currentValue))
		.all();
}

export function addAsset(asset: Omit<Asset, "createdAt">): Asset {
	const database = getDatabase();
	database.insert(assets).values(asset).run();

	// Also add to value history
	database
		.insert(assetValueHistory)
		.values({
			id: `${asset.id}-${Date.now()}`,
			assetId: asset.id,
			value: asset.currentValue,
			date: asset.lastUpdated,
		})
		.run();

	const inserted = database
		.select()
		.from(assets)
		.where(eq(assets.id, asset.id))
		.get();

	if (!inserted) {
		throw new Error("Failed to insert asset");
	}

	return inserted;
}

export function updateAsset(
	id: string,
	updates: Partial<Omit<Asset, "id" | "createdAt">>,
): Asset {
	const database = getDatabase();

	// If current value is being updated, add to history
	if (updates.currentValue !== undefined) {
		const today = new Date().toISOString().slice(0, 10);
		database
			.insert(assetValueHistory)
			.values({
				id: `${id}-${Date.now()}`,
				assetId: id,
				value: updates.currentValue,
				date: today,
			})
			.run();
		updates.lastUpdated = today;
	}

	database.update(assets).set(updates).where(eq(assets.id, id)).run();

	const updated = database.select().from(assets).where(eq(assets.id, id)).get();

	if (!updated) {
		throw new Error("Failed to update asset");
	}

	return updated;
}

export function deleteAsset(id: string): boolean {
	const database = getDatabase();
	database.delete(assets).where(eq(assets.id, id)).run();
	return true;
}

export function getAssetValueHistory(assetId: string): AssetValueHistory[] {
	const database = getDatabase();
	return database
		.select()
		.from(assetValueHistory)
		.where(eq(assetValueHistory.assetId, assetId))
		.orderBy(desc(assetValueHistory.date))
		.all();
}

export function getAssetsByGoal(goalId: string): Asset[] {
	const database = getDatabase();
	return database
		.select()
		.from(assets)
		.where(eq(assets.linkedGoalId, goalId))
		.all();
}

// ==================== GOAL OPERATIONS ====================

export function getAllGoals(): Goal[] {
	const database = getDatabase();
	return database
		.select()
		.from(goals)
		.orderBy(desc(goals.priority), desc(goals.targetDate))
		.all();
}

export function addGoal(goal: Omit<Goal, "createdAt">): Goal {
	const database = getDatabase();
	database.insert(goals).values(goal).run();

	const inserted = database
		.select()
		.from(goals)
		.where(eq(goals.id, goal.id))
		.get();

	if (!inserted) {
		throw new Error("Failed to insert goal");
	}

	return inserted;
}

export function updateGoal(
	id: string,
	updates: Partial<Omit<Goal, "id" | "createdAt">>,
): Goal {
	const database = getDatabase();
	database.update(goals).set(updates).where(eq(goals.id, id)).run();

	const updated = database.select().from(goals).where(eq(goals.id, id)).get();

	if (!updated) {
		throw new Error("Failed to update goal");
	}

	return updated;
}

export function deleteGoal(id: string): boolean {
	const database = getDatabase();
	// Unlink any assets linked to this goal
	database
		.update(assets)
		.set({ linkedGoalId: null })
		.where(eq(assets.linkedGoalId, id))
		.run();
	database.delete(goals).where(eq(goals.id, id)).run();
	return true;
}

// ==================== NET WORTH OPERATIONS ====================

export function getNetWorthHistory(): NetWorthHistory[] {
	const database = getDatabase();
	return database
		.select()
		.from(netWorthHistory)
		.orderBy(desc(netWorthHistory.date))
		.all();
}

export function addNetWorthSnapshot(
	snapshot: Omit<NetWorthHistory, "createdAt">,
): NetWorthHistory {
	const database = getDatabase();
	database.insert(netWorthHistory).values(snapshot).run();

	const inserted = database
		.select()
		.from(netWorthHistory)
		.where(eq(netWorthHistory.id, snapshot.id))
		.get();

	if (!inserted) {
		throw new Error("Failed to insert net worth snapshot");
	}

	return inserted;
}

export function calculateCurrentNetWorth(): {
	totalAssets: number;
	totalLiabilities: number;
	netWorth: number;
	assetsBreakdown: Record<string, number>;
	liabilitiesBreakdown: Record<string, number>;
} {
	const database = getDatabase();

	// Get all assets
	const allAssets = database.select().from(assets).all();
	const totalAssets = allAssets.reduce((sum, a) => sum + a.currentValue, 0);

	// Group assets by type
	const assetsBreakdown: Record<string, number> = {};
	allAssets.forEach((asset) => {
		assetsBreakdown[asset.type] =
			(assetsBreakdown[asset.type] || 0) + asset.currentValue;
	});

	// Get all loans (liabilities)
	const allLoans = database
		.select()
		.from(loans)
		.where(eq(loans.isPaidOff, 0))
		.all();
	const totalLiabilities = allLoans.reduce(
		(sum, l) => sum + l.remainingPrincipal,
		0,
	);

	// Group liabilities by type
	const liabilitiesBreakdown: Record<string, number> = {};
	allLoans.forEach((loan) => {
		liabilitiesBreakdown[loan.type] =
			(liabilitiesBreakdown[loan.type] || 0) + loan.remainingPrincipal;
	});

	return {
		totalAssets,
		totalLiabilities,
		netWorth: totalAssets - totalLiabilities,
		assetsBreakdown,
		liabilitiesBreakdown,
	};
}

export function recordNetWorthSnapshot(): NetWorthHistory {
	const netWorth = calculateCurrentNetWorth();
	const today = new Date().toISOString().slice(0, 10);

	return addNetWorthSnapshot({
		id: `nw-${Date.now()}`,
		date: today,
		totalAssets: netWorth.totalAssets,
		totalLiabilities: netWorth.totalLiabilities,
		netWorth: netWorth.netWorth,
		assetsBreakdown: JSON.stringify(netWorth.assetsBreakdown),
		liabilitiesBreakdown: JSON.stringify(netWorth.liabilitiesBreakdown),
	});
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
