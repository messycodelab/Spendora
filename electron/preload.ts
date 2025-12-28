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
});
