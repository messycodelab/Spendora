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
});
