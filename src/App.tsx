import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { ExpenseList } from "./components/ExpenseList";
import { BudgetManager } from "./components/BudgetManager";
import { RecurringExpenses } from "./components/RecurringExpenses";
import { Dashboard } from "./components/Dashboard";
import type { Expense, Budget } from "./types";
import { normalizeExpense, toStorageFormat } from "./lib/expense-adapter";
import { Wallet } from "lucide-react";

declare global {
	interface Window {
		electron: {
			getExpenses: () => Promise<Expense[]>;
			addExpense: (expense: Expense) => Promise<Expense>;
			deleteExpense: (id: string) => Promise<boolean>;
			getBudgets: () => Promise<Budget[]>;
			setBudget: (budget: Budget) => Promise<Budget>;
			getRecurringExpenses: () => Promise<Expense[]>;
		};
	}
}

function App() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [budgets, setBudgets] = useState<Budget[]>([]);
	const [loading, setLoading] = useState(true);

	const loadData = useCallback(async () => {
		try {
			const [loadedExpenses, loadedBudgets] = await Promise.all([
				window.electron.getExpenses(),
				window.electron.getBudgets(),
			]);
			// Normalize expenses to ensure backward compatibility
			const normalizedExpenses = loadedExpenses.map(normalizeExpense);
			setExpenses(normalizedExpenses);
			setBudgets(loadedBudgets);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleAddExpense = async (expense: Expense) => {
		try {
			// Convert to storage format before sending
			const storageExpense = toStorageFormat(expense);
			await window.electron.addExpense(storageExpense);
			await loadData();
		} catch (error) {
			console.error("Error adding expense:", error);
		}
	};

	const handleDeleteExpense = async (id: string) => {
		try {
			await window.electron.deleteExpense(id);
			await loadData();
		} catch (error) {
			console.error("Error deleting expense:", error);
		}
	};

	const handleSetBudget = async (budget: Budget) => {
		try {
			await window.electron.setBudget(budget);
			await loadData();
		} catch (error) {
			console.error("Error setting budget:", error);
		}
	};

	if (loading) {
		return (
			<div className="h-screen flex items-center justify-center">
				<div className="text-center">
					<Wallet className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
					<p className="text-muted-foreground">Loading Spendora...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-background">
			<div className="container mx-auto p-6 max-w-7xl">
				<div className="flex items-center justify-between mb-8">
					<div className="flex items-center gap-3">
						<Wallet className="h-8 w-8 text-primary" />
						<div>
							<h1 className="text-3xl font-bold">Spendora</h1>
							<p className="text-muted-foreground">Smart Expense Tracking</p>
						</div>
					</div>
					<AddExpenseDialog onAddExpense={handleAddExpense} />
				</div>

				<Dashboard expenses={expenses} budgets={budgets} />

				<Tabs defaultValue="expenses" className="mt-6">
					<TabsList className="grid w-full max-w-md grid-cols-3">
						<TabsTrigger value="expenses">Expenses</TabsTrigger>
						<TabsTrigger value="budgets">Budgets</TabsTrigger>
						<TabsTrigger value="recurring">Recurring</TabsTrigger>
					</TabsList>

					<TabsContent value="expenses" className="mt-6">
						<ExpenseList
							expenses={expenses}
							onDeleteExpense={handleDeleteExpense}
						/>
					</TabsContent>

					<TabsContent value="budgets" className="mt-6">
						<BudgetManager budgets={budgets} onSetBudget={handleSetBudget} />
					</TabsContent>

					<TabsContent value="recurring" className="mt-6">
						<RecurringExpenses expenses={expenses} />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

export default App;
