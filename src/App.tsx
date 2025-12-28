import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { ExpenseList } from "./components/ExpenseList";
import { BudgetManager } from "./components/BudgetManager";
import { RecurringExpenses } from "./components/RecurringExpenses";
import { Dashboard } from "./components/Dashboard";
import { LoansLiabilities } from "./components/LoansLiabilities/LoansLiabilities";
import type { Expense, Budget, Loan, LoanPayment } from "./types";
import { normalizeExpense, toStorageFormat } from "./lib/expense-adapter";
import { Search, Settings, Bell, HelpCircle, Plus } from "lucide-react";

declare global {
	interface Window {
		electron: {
			getExpenses: () => Promise<Expense[]>;
			addExpense: (expense: Expense) => Promise<Expense>;
			deleteExpense: (id: string) => Promise<boolean>;
			getBudgets: () => Promise<Budget[]>;
			setBudget: (budget: Budget) => Promise<Budget>;
			getRecurringExpenses: () => Promise<Expense[]>;
			getLoans: () => Promise<Loan[]>;
			addLoan: (loan: Loan) => Promise<Loan>;
			updateLoan: (id: string, updates: Partial<Loan>) => Promise<Loan>;
			deleteLoan: (id: string) => Promise<boolean>;
			getLoanPayments: (loanId: string) => Promise<LoanPayment[]>;
			addLoanPayment: (payment: LoanPayment) => Promise<LoanPayment>;
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
			<div className="h-screen flex items-center justify-center bg-slate-50">
				<div className="text-center">
					<h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 animate-pulse">
						Spendora
					</h1>
					<p className="text-slate-400 font-bold tracking-widest text-[10px] uppercase">
						Launching...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-12 bg-white">
			<nav className="h-12 bg-[#062163] flex items-center justify-between px-4 text-white sticky top-0 z-50">
				<div className="flex items-center gap-6">
					<div className="flex items-center gap-2">
						<h1 className="text-lg font-bold tracking-tight">Spendora</h1>
					</div>
				</div>

				<div className="flex-1 max-w-xl px-8">
					<div className="relative group">
						<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
							<Search className="h-3.5 w-3.5 text-white/50" />
						</div>
						<input
							type="text"
							placeholder="Search"
							className="w-full h-8 bg-white/10 border-none rounded-md pl-9 pr-12 text-xs text-white placeholder:text-white/40 focus:bg-white/20 focus:ring-0 transition-all"
						/>
						<div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
							<div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-white/10 rounded border border-white/10">
								<span className="text-[10px] text-white/60">⌘</span>
								<span className="text-[10px] text-white/60 font-bold">K</span>
							</div>
						</div>
					</div>
				</div>

				<div className="flex items-center gap-4">
					<div className="flex items-center gap-3 pr-2">
						<HelpCircle className="h-4 w-4 text-white/70 hover:text-white cursor-pointer" />
						<div className="relative">
							<Bell className="h-4 w-4 text-white/70 hover:text-white cursor-pointer" />
							<div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full flex items-center justify-center border-2 border-[#062163]">
								<span className="text-[7px] font-bold text-white">2</span>
							</div>
						</div>
						<Settings className="h-4 w-4 text-white/70 hover:text-white cursor-pointer" />
					</div>
				</div>
			</nav>

			<div className="container mx-auto p-6 max-w-6xl">
				{/* Floating Action Button */}
				<button
					type="button"
					onClick={() =>
						(
							document.querySelector(
								"[data-add-expense-trigger]",
							) as HTMLElement
						)?.click()
					}
					className="fixed bottom-8 right-8 h-12 px-6 bg-[#062163] text-white rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all z-50 group font-bold text-sm"
				>
					<Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
					<span>Add Expense</span>
				</button>

				{/* Hidden AddExpenseDialog trigger for navbar button */}
				<div className="hidden">
					<AddExpenseDialog onAddExpense={handleAddExpense} />
				</div>

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
								<TabsTrigger
									value="loans"
									className="rounded-xl px-8 text-xs font-semibold data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 transition-all"
								>
									Loans
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
									expenses={expenses}
									budgets={budgets}
									onSetBudget={handleSetBudget}
								/>
							</TabsContent>

							<TabsContent value="recurring" className="mt-0 outline-none">
								<RecurringExpenses expenses={expenses} />
							</TabsContent>

							<TabsContent value="loans" className="mt-0 outline-none">
								<LoansLiabilities />
							</TabsContent>
						</div>
					</Tabs>
				</main>
			</div>
		</div>
	);
}

export default App;
