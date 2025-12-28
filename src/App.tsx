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
		<div className="min-h-screen pb-12 bg-slate-50/30">
			<div className="container mx-auto p-6 max-w-6xl">
				{/* Modern Integrated Header */}
				<header className="flex items-center justify-between mb-10 px-2">
					<div className="flex items-center gap-4">
						<div className="w-12 h-12 rounded-2xl gradient-purple flex items-center justify-center shadow-indigo-200 shadow-xl">
							<Wallet className="h-6 w-6 text-white" />
						</div>
						<div>
							<h1 className="text-2xl font-bold text-slate-900 tracking-tight">
								Spendora
							</h1>
							<p className="text-slate-400 text-sm font-medium">
								Personal Finance Hub
							</p>
						</div>
					</div>
					<AddExpenseDialog onAddExpense={handleAddExpense} />
				</header>

				<section className="mb-10">
					<Dashboard expenses={expenses} budgets={budgets} />
				</section>

				<main className="modern-card rounded-[2.5rem] p-2">
					<Tabs defaultValue="expenses" className="w-full">
						<div className="flex justify-center mb-6 pt-4">
							<TabsList className="bg-slate-100/80 p-1 rounded-2xl h-12 inline-flex border-none">
								<TabsTrigger
									value="expenses"
									className="rounded-xl px-8 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all"
								>
									Expenses
								</TabsTrigger>
								<TabsTrigger
									value="budgets"
									className="rounded-xl px-8 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all"
								>
									Budgets
								</TabsTrigger>
								<TabsTrigger
									value="recurring"
									className="rounded-xl px-8 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all"
								>
									Recurring
								</TabsTrigger>
							</TabsList>
						</div>

						<div className="px-4 pb-4">
							<TabsContent value="expenses" className="mt-0 outline-none">
								<ExpenseList
									expenses={expenses}
									onDeleteExpense={handleDeleteExpense}
								/>
							</TabsContent>

							<TabsContent value="budgets" className="mt-0 outline-none">
								<BudgetManager
									budgets={budgets}
									onSetBudget={handleSetBudget}
								/>
							</TabsContent>

							<TabsContent value="recurring" className="mt-0 outline-none">
								<RecurringExpenses expenses={expenses} />
							</TabsContent>
						</div>
					</Tabs>
				</main>
			</div>
		</div>
	);
}

export default App;
