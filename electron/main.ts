import { app, BrowserWindow, ipcMain } from "electron";
import * as path from "path";
import * as fs from "fs";

let mainWindow: BrowserWindow | null = null;
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

// Get user data path for storing expenses data
const userDataPath = app.getPath("userData");
const dataPath = path.join(userDataPath, "spendora-data.json");

// Initialize data store
interface Expense {
	id: string;
	amount: number;
	category: string;
	description: string;
	date: string;
	paymentMethod: "upi" | "cash" | "card";
	type: "one-time" | "recurring";
	recurringDetails?: {
		frequency: "daily" | "weekly" | "monthly" | "yearly";
		nextDate: string;
	};
}

interface Budget {
	id: string;
	category: string;
	monthlyLimit: number;
	currentSpend: number;
	month: string;
}

interface DataStore {
	expenses: Expense[];
	budgets: Budget[];
}

// Load data from file
function loadData(): DataStore {
	try {
		if (fs.existsSync(dataPath)) {
			const data = fs.readFileSync(dataPath, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Error loading data:", error);
	}
	return { expenses: [], budgets: [] };
}

// Save data to file
function saveData(data: DataStore): void {
	try {
		fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), "utf-8");
	} catch (error) {
		console.error("Error saving data:", error);
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
	createWindow();

	app.on("activate", () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		app.quit();
	}
});

// IPC Handlers
ipcMain.handle("get-expenses", () => {
	const data = loadData();
	return data.expenses;
});

ipcMain.handle("add-expense", (_event, expense: Expense) => {
	const data = loadData();
	data.expenses.push(expense);

	// Update budget if exists
	const currentMonth = new Date().toISOString().slice(0, 7);
	const budgetIndex = data.budgets.findIndex(
		(b) => b.category === expense.category && b.month === currentMonth,
	);

	if (budgetIndex !== -1) {
		data.budgets[budgetIndex].currentSpend += expense.amount;
	}

	saveData(data);
	return expense;
});

ipcMain.handle("delete-expense", (_event, id: string) => {
	const data = loadData();
	const expenseIndex = data.expenses.findIndex((e) => e.id === id);

	if (expenseIndex !== -1) {
		const expense = data.expenses[expenseIndex];
		const currentMonth = new Date().toISOString().slice(0, 7);

		// Update budget if exists
		const budgetIndex = data.budgets.findIndex(
			(b) => b.category === expense.category && b.month === currentMonth,
		);

		if (budgetIndex !== -1) {
			data.budgets[budgetIndex].currentSpend -= expense.amount;
		}

		data.expenses.splice(expenseIndex, 1);
		saveData(data);
		return true;
	}

	return false;
});

ipcMain.handle("get-budgets", () => {
	const data = loadData();
	return data.budgets;
});

ipcMain.handle("set-budget", (_event, budget: Budget) => {
	const data = loadData();
	const existingIndex = data.budgets.findIndex(
		(b) => b.category === budget.category && b.month === budget.month,
	);

	if (existingIndex !== -1) {
		data.budgets[existingIndex] = budget;
	} else {
		data.budgets.push(budget);
	}

	saveData(data);
	return budget;
});

ipcMain.handle("get-recurring-expenses", () => {
	const data = loadData();
	return data.expenses.filter((e) => e.type === "recurring");
});
