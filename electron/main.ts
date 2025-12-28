import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";
import {
	initDatabase,
	closeDatabase,
	getAllExpenses,
	addExpense,
	deleteExpense,
	getRecurringExpenses,
	getAllBudgets,
	setBudget,
	getAllLoans,
	addLoan,
	updateLoan,
	deleteLoan,
	getLoanPayments,
	addLoanPayment,
	migrateFromJSON,
	type Expense,
	type Budget,
	type Loan,
	type LoanPayment,
} from "./database";

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Get user data path for storing database
const userDataPath = app.getPath("userData");
const dbPath = path.join(userDataPath, "spendora.db");
const oldJsonPath = path.join(userDataPath, "spendora-data.json");

// Initialize database
function setupDatabase() {
	initDatabase(dbPath);

	// Check if old JSON file exists and migrate
	if (fs.existsSync(oldJsonPath)) {
		try {
			const jsonData = JSON.parse(fs.readFileSync(oldJsonPath, "utf-8"));
			console.log("Found existing JSON data, migrating to SQLite...");
			migrateFromJSON(jsonData);

			// Backup old JSON file
			const backupPath = path.join(
				userDataPath,
				`spendora-data.json.backup.${Date.now()}`,
			);
			fs.renameSync(oldJsonPath, backupPath);
			console.log(`Old data backed up to: ${backupPath}`);
		} catch (error) {
			console.error("Error migrating from JSON:", error);
		}
	}
}

function createWindow() {
	mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, "preload.js"),
		},
	});

	if (isDev) {
		mainWindow.loadURL("http://localhost:5173");
		mainWindow.webContents.openDevTools();
	} else {
		mainWindow.loadFile(path.join(__dirname, "index.html"));
	}

	mainWindow.on("closed", () => {
		mainWindow = null;
	});
}

app.whenReady().then(() => {
	setupDatabase();
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	closeDatabase();
	if (process.platform !== "darwin") {
		app.quit();
	}
});

app.on("before-quit", () => {
	closeDatabase();
});

// IPC Handlers
ipcMain.handle("get-expenses", () => {
	try {
		return getAllExpenses();
	} catch (error) {
		console.error("Error getting expenses:", error);
		return [];
	}
});

ipcMain.handle("add-expense", (_event, expense: Expense) => {
	try {
		return addExpense(expense);
	} catch (error) {
		console.error("Error adding expense:", error);
		throw error;
	}
});

ipcMain.handle("delete-expense", (_event, id: string) => {
	try {
		return deleteExpense(id);
	} catch (error) {
		console.error("Error deleting expense:", error);
		return false;
	}
});

ipcMain.handle("get-budgets", () => {
	try {
		return getAllBudgets();
	} catch (error) {
		console.error("Error getting budgets:", error);
		return [];
	}
});

ipcMain.handle("set-budget", (_event, budget: Budget) => {
	try {
		return setBudget(budget);
	} catch (error) {
		console.error("Error setting budget:", error);
		throw error;
	}
});

ipcMain.handle("get-recurring-expenses", () => {
	try {
		return getRecurringExpenses();
	} catch (error) {
		console.error("Error getting recurring expenses:", error);
		return [];
	}
});

// Loan Handlers
ipcMain.handle("get-loans", () => {
	try {
		return getAllLoans();
	} catch (error) {
		console.error("Error getting loans:", error);
		return [];
	}
});

ipcMain.handle("add-loan", (_event, loan: Loan) => {
	try {
		return addLoan(loan);
	} catch (error) {
		console.error("Error adding loan:", error);
		throw error;
	}
});

ipcMain.handle("update-loan", (_event, id: string, updates: Partial<Loan>) => {
	try {
		return updateLoan(id, updates);
	} catch (error) {
		console.error("Error updating loan:", error);
		throw error;
	}
});

ipcMain.handle("delete-loan", (_event, id: string) => {
	try {
		return deleteLoan(id);
	} catch (error) {
		console.error("Error deleting loan:", error);
		return false;
	}
});

ipcMain.handle("get-loan-payments", (_event, loanId: string) => {
	try {
		return getLoanPayments(loanId);
	} catch (error) {
		console.error("Error getting loan payments:", error);
		return [];
	}
});

ipcMain.handle("add-loan-payment", (_event, payment: LoanPayment) => {
	try {
		return addLoanPayment(payment);
	} catch (error) {
		console.error("Error adding loan payment:", error);
		throw error;
	}
});
