import type { Expense } from "@/types";

/**
 * Adapter to normalize expense data between old and new formats
 * Old format: recurringDetails.frequency / recurringDetails.nextDate
 * New format: recurringFrequency / recurringNextDate
 */
export function normalizeExpense(expense: Expense): Expense {
	// If using new format, create recurringDetails for backward compatibility
	if (expense.recurringFrequency && expense.recurringNextDate) {
		return {
			...expense,
			recurringDetails: {
				frequency: expense.recurringFrequency,
				nextDate: expense.recurringNextDate,
			},
		};
	}

	// If using old format, extract to new format
	if (expense.recurringDetails) {
		return {
			...expense,
			recurringFrequency: expense.recurringDetails.frequency,
			recurringNextDate: expense.recurringDetails.nextDate,
		};
	}

	return expense;
}

export function toStorageFormat(expense: Expense): Expense {
	// Convert to new flat format for storage
	if (expense.recurringDetails) {
		return {
			...expense,
			recurringFrequency: expense.recurringDetails.frequency,
			recurringNextDate: expense.recurringDetails.nextDate,
			recurringDetails: undefined,
		};
	}
	return expense;
}
