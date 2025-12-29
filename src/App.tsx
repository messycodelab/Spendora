import { useState, useEffect, useCallback } from "react";
import { AddExpenseDialog } from "./components/AddExpenseDialog";
import { ExpenseList } from "./components/ExpenseList";
import { BudgetManager } from "./components/BudgetManager";
import { RecurringExpenses } from "./components/RecurringExpenses";
import { Dashboard } from "./components/Dashboard";
import { LoansLiabilities } from "./components/LoansLiabilities/LoansLiabilities";
import { Investments } from "./components/Investments/Investments";
import { Goals } from "./components/Goals/Goals";
import type {
	Expense,
	Budget,
	Loan,
	LoanPayment,
	Asset,
	AssetValueHistory,
	Goal,
	NetWorthHistory,
} from "./types";
import { normalizeExpense, toStorageFormat } from "./lib/expense-adapter";
import {
	Search,
	Settings,
	Bell,
	HelpCircle,
	Plus,
	LayoutDashboard,
	Receipt,
	PieChart,
	Building2,
	Wallet,
	Target,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";

declare global {
	interface Window {
		electron: {
			// Expense operations
			getExpenses: () => Promise<Expense[]>;
			addExpense: (expense: Expense) => Promise<Expense>;
			deleteExpense: (id: string) => Promise<boolean>;
			// Budget operations
			getBudgets: () => Promise<Budget[]>;
			setBudget: (budget: Budget) => Promise<Budget>;
			// Recurring expenses
			getRecurringExpenses: () => Promise<Expense[]>;
			// Loan operations
			getLoans: () => Promise<Loan[]>;
			addLoan: (loan: Loan) => Promise<Loan>;
			updateLoan: (id: string, updates: Partial<Loan>) => Promise<Loan>;
			deleteLoan: (id: string) => Promise<boolean>;
			getLoanPayments: (loanId: string) => Promise<LoanPayment[]>;
			addLoanPayment: (payment: LoanPayment) => Promise<LoanPayment>;
			// Asset operations
			getAssets: () => Promise<Asset[]>;
			addAsset: (asset: Asset) => Promise<Asset>;
			updateAsset: (id: string, updates: Partial<Asset>) => Promise<Asset>;
			deleteAsset: (id: string) => Promise<boolean>;
			getAssetValueHistory: (assetId: string) => Promise<AssetValueHistory[]>;
			getAssetsByGoal: (goalId: string) => Promise<Asset[]>;
			// Goal operations
			getGoals: () => Promise<Goal[]>;
			addGoal: (goal: Goal) => Promise<Goal>;
			updateGoal: (id: string, updates: Partial<Goal>) => Promise<Goal>;
			deleteGoal: (id: string) => Promise<boolean>;
			// Net Worth operations
			getNetWorthHistory: () => Promise<NetWorthHistory[]>;
			calculateNetWorth: () => Promise<{
				totalAssets: number;
				totalLiabilities: number;
				netWorth: number;
				assetsBreakdown: Record<string, number>;
				liabilitiesBreakdown: Record<string, number>;
			}>;
			recordNetWorthSnapshot: () => Promise<NetWorthHistory>;
		};
	}
}

function App() {
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [budgets, setBudgets] = useState<Budget[]>([]);
	const [loans, setLoans] = useState<Loan[]>([]);
	const [assets, setAssets] = useState<Asset[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [netWorthHistory, setNetWorthHistory] = useState<NetWorthHistory[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState("dashboard");

	const loadData = useCallback(async () => {
		try {
			const [
				loadedExpenses,
				loadedBudgets,
				loadedLoans,
				loadedAssets,
				loadedGoals,
				loadedNetWorthHistory,
			] = await Promise.all([
				window.electron.getExpenses(),
				window.electron.getBudgets(),
				window.electron.getLoans(),
				window.electron.getAssets(),
				window.electron.getGoals(),
				window.electron.getNetWorthHistory(),
			]);
			// Normalize expenses to ensure backward compatibility
			const normalizedExpenses = loadedExpenses.map(normalizeExpense);
			setExpenses(normalizedExpenses);
			setBudgets(loadedBudgets);
			setLoans(loadedLoans);
			setAssets(loadedAssets);
			setGoals(loadedGoals);
			setNetWorthHistory(loadedNetWorthHistory);
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

	const handleRecordSnapshot = async () => {
		try {
			await window.electron.recordNetWorthSnapshot();
			await loadData();
		} catch (error) {
			console.error("Error recording snapshot:", error);
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

	const sidebarItems = [
		{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
		{ id: "expenses", label: "Expenses", icon: Receipt },
		{ id: "budgets", label: "Budgets", icon: PieChart },
		{ id: "loans", label: "Loans", icon: Building2 },
		{ id: "investments", label: "Investments", icon: Wallet },
		{ id: "goals", label: "Goals", icon: Target },
	];

	return (
		<div className="flex min-h-screen bg-slate-50">
			{/* Sidebar */}
			<aside className="w-64 bg-[#062163] text-white flex flex-col fixed inset-y-0 left-0 z-50">
				<div className="p-6">
					<h1 className="text-xl font-bold tracking-tight">Spendora</h1>
					<p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">
						Personal Finance
					</p>
				</div>

				<nav className="flex-1 px-4 space-y-1 mt-4">
					{sidebarItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeTab === item.id;
						return (
							<button
								key={item.id}
								type="button"
								onClick={() => setActiveTab(item.id)}
								className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
									isActive
										? "bg-white text-[#062163] shadow-lg"
										: "text-white/60 hover:text-white hover:bg-white/5"
								}`}
							>
								<Icon
									className={`h-5 w-5 ${isActive ? "text-[#062163]" : "text-white/40"}`}
								/>
								{item.label}
							</button>
						);
					})}
				</nav>

				<div className="p-4 mt-auto space-y-1">
					<button
						type="button"
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
					>
						<Settings className="h-5 w-5 text-white/40" />
						Settings
					</button>
					<button
						type="button"
						className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-all"
					>
						<HelpCircle className="h-5 w-5 text-white/40" />
						Help Center
					</button>
				</div>
			</aside>

			{/* Main Content */}
			<div className="flex-1 ml-64 flex flex-col min-h-screen">
				{/* Top Navbar */}
				<header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
					<div className="max-w-xl flex-1">
						<div className="relative group">
							<div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
								<Search className="h-4 w-4 text-slate-400" />
							</div>
							<input
								type="text"
								placeholder="Search anything..."
								className="w-full h-10 bg-slate-50 border-none rounded-xl pl-10 pr-12 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-slate-100 focus:ring-2 focus:ring-[#062163]/10 transition-all"
							/>
							<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
								<div className="flex items-center gap-1 px-1.5 py-1 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-400 shadow-sm">
									<span>⌘</span>
									<span>K</span>
								</div>
							</div>
						</div>
					</div>

					<div className="flex items-center gap-4">
						<div className="relative">
							<div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center hover:bg-slate-100 cursor-pointer transition-all">
								<Bell className="h-5 w-5 text-slate-600" />
							</div>
							<div className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></div>
						</div>
						<div className="h-10 w-10 rounded-xl gradient-brand flex items-center justify-center text-white font-bold text-sm shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all">
							S
						</div>
					</div>
				</header>

				{/* Page Content */}
				<main className="p-8 pb-24">
					<div className="max-w-5xl mx-auto">
						{activeTab === "dashboard" && (
							<Dashboard
								expenses={expenses}
								budgets={budgets}
								assets={assets}
								loans={loans}
								goals={goals}
								netWorthHistory={netWorthHistory}
								onRecordSnapshot={handleRecordSnapshot}
							/>
						)}
						{activeTab === "expenses" && (
							<div className="space-y-6">
								<Tabs defaultValue="daily" className="w-full space-y-6">
									<div className="flex items-center justify-between px-1">
										<div className="flex items-center gap-2">
											<div className="h-8 w-8 rounded-lg bg-[#062163] flex items-center justify-center text-white">
												<Receipt className="h-5 w-5" />
											</div>
											<h2 className="text-xl font-bold text-slate-900">
												Expenses
											</h2>
										</div>

										<div className="flex items-center gap-4">
											<TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 border-none">
												<TabsTrigger
													value="daily"
													className="rounded-lg px-4 h-8 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-[#062163] data-[state=active]:shadow-sm transition-all"
												>
													Daily
												</TabsTrigger>
												<TabsTrigger
													value="recurring"
													className="rounded-lg px-4 h-8 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-[#062163] data-[state=active]:shadow-sm transition-all"
												>
													Recurring
												</TabsTrigger>
											</TabsList>

											<button
												type="button"
												onClick={() =>
													(
														document.querySelector(
															"[data-add-expense-trigger]",
														) as HTMLElement
													)?.click()
												}
												className="h-9 px-4 bg-[#062163] text-white rounded-xl shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all font-bold text-xs"
											>
												<Plus className="h-4 w-4" />
												Add Expense
											</button>
										</div>
									</div>

									<TabsContent value="daily" className="mt-0 outline-none">
										<div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
											<ExpenseList
												expenses={expenses}
												onDeleteExpense={handleDeleteExpense}
											/>
										</div>
									</TabsContent>

									<TabsContent value="recurring" className="mt-0 outline-none">
										<div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
											<RecurringExpenses expenses={expenses} />
										</div>
									</TabsContent>
								</Tabs>
							</div>
						)}
						{activeTab === "budgets" && (
							<div className="space-y-6">
								<h2 className="text-xl font-bold text-slate-900">Budgets</h2>
								<div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
									<BudgetManager
										expenses={expenses}
										budgets={budgets}
										onSetBudget={handleSetBudget}
									/>
								</div>
							</div>
						)}
						{activeTab === "loans" && (
							<div className="space-y-6">
								<h2 className="text-xl font-bold text-slate-900">Loans</h2>
								<div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
									<LoansLiabilities />
								</div>
							</div>
						)}
						{activeTab === "investments" && (
							<div className="space-y-6">
								<h2 className="text-xl font-bold text-slate-900">
									Investments
								</h2>
								<div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
									<Investments />
								</div>
							</div>
						)}
						{activeTab === "goals" && (
							<div className="space-y-6">
								<h2 className="text-xl font-bold text-slate-900">Goals</h2>
								<div className="bg-white rounded-3xl p-2 shadow-sm border border-slate-100">
									<Goals />
								</div>
							</div>
						)}
					</div>
				</main>

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

				{/* Hidden AddExpenseDialog trigger */}
				<div className="hidden">
					<AddExpenseDialog onAddExpense={handleAddExpense} />
				</div>
			</div>
		</div>
	);
}

export default App;
