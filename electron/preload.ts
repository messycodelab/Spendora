import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electron", {
	// Expense operations
	getExpenses: () => ipcRenderer.invoke("get-expenses"),
	addExpense: (expense: any) => ipcRenderer.invoke("add-expense", expense),
	deleteExpense: (id: string) => ipcRenderer.invoke("delete-expense", id),

	// Budget operations
	getBudgets: () => ipcRenderer.invoke("get-budgets"),
	setBudget: (budget: any) => ipcRenderer.invoke("set-budget", budget),

	// Recurring expenses
	getRecurringExpenses: () => ipcRenderer.invoke("get-recurring-expenses"),

	// Loan operations
	getLoans: () => ipcRenderer.invoke("get-loans"),
	addLoan: (loan: any) => ipcRenderer.invoke("add-loan", loan),
	updateLoan: (id: string, updates: any) =>
		ipcRenderer.invoke("update-loan", id, updates),
	deleteLoan: (id: string) => ipcRenderer.invoke("delete-loan", id),
	getLoanPayments: (loanId: string) =>
		ipcRenderer.invoke("get-loan-payments", loanId),
	addLoanPayment: (payment: any) =>
		ipcRenderer.invoke("add-loan-payment", payment),

	// Asset operations
	getAssets: () => ipcRenderer.invoke("get-assets"),
	addAsset: (asset: any) => ipcRenderer.invoke("add-asset", asset),
	updateAsset: (id: string, updates: any) =>
		ipcRenderer.invoke("update-asset", id, updates),
	deleteAsset: (id: string) => ipcRenderer.invoke("delete-asset", id),
	getAssetValueHistory: (assetId: string) =>
		ipcRenderer.invoke("get-asset-value-history", assetId),
	getAssetsByGoal: (goalId: string) =>
		ipcRenderer.invoke("get-assets-by-goal", goalId),

	// Goal operations
	getGoals: () => ipcRenderer.invoke("get-goals"),
	addGoal: (goal: any) => ipcRenderer.invoke("add-goal", goal),
	updateGoal: (id: string, updates: any) =>
		ipcRenderer.invoke("update-goal", id, updates),
	deleteGoal: (id: string) => ipcRenderer.invoke("delete-goal", id),

	// Net Worth operations
	getNetWorthHistory: () => ipcRenderer.invoke("get-net-worth-history"),
	calculateNetWorth: () => ipcRenderer.invoke("calculate-net-worth"),
	recordNetWorthSnapshot: () => ipcRenderer.invoke("record-net-worth-snapshot"),
});
