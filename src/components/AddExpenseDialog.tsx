import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import {
	CATEGORIES,
	PAYMENT_METHODS,
	RECURRING_FREQUENCIES,
	type Expense,
} from "@/types";
import {
	Plus,
	DollarSign,
	Tag,
	FileText,
	CreditCard,
	Repeat,
	Calendar,
} from "lucide-react";

interface AddExpenseDialogProps {
	onAddExpense: (expense: Expense) => void;
}

export function AddExpenseDialog({ onAddExpense }: AddExpenseDialogProps) {
	const [open, setOpen] = useState(false);
	const [amount, setAmount] = useState("");
	const [category, setCategory] = useState("");
	const [description, setDescription] = useState("");
	const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
	const [paymentMethod, setPaymentMethod] = useState<"upi" | "cash" | "card">(
		"upi",
	);
	const [type, setType] = useState<"one-time" | "recurring">("one-time");
	const [frequency, setFrequency] = useState<
		"daily" | "weekly" | "monthly" | "yearly"
	>("monthly");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!amount || !category || !description) {
			alert("Please fill all required fields");
			return;
		}

		const expense: Expense = {
			id: crypto.randomUUID(),
			amount: parseFloat(amount),
			category,
			description,
			date: new Date(date).toISOString(),
			paymentMethod,
			type,
		};

		if (type === "recurring") {
			const nextDate = new Date(date);
			if (frequency === "daily") nextDate.setDate(nextDate.getDate() + 1);
			if (frequency === "weekly") nextDate.setDate(nextDate.getDate() + 7);
			if (frequency === "monthly") nextDate.setMonth(nextDate.getMonth() + 1);
			if (frequency === "yearly")
				nextDate.setFullYear(nextDate.getFullYear() + 1);

			expense.recurringDetails = {
				frequency,
				nextDate: nextDate.toISOString(),
			};
		}

		onAddExpense(expense);
		setOpen(false);
		resetForm();
	};

	const resetForm = () => {
		setAmount("");
		setCategory("");
		setDescription("");
		setDate(new Date().toISOString().slice(0, 10));
		setPaymentMethod("upi");
		setType("one-time");
		setFrequency("monthly");
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild data-add-expense-trigger>
				<Button className="gap-2 gradient-purple shadow-lg hover:shadow-xl transition-all text-white">
					<Plus className="h-5 w-5" />
					Add Expense
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[550px] border-2 border-purple-200">
				<DialogHeader className="pb-4 border-b">
					<div className="flex items-center gap-3">
						<div className="gradient-purple p-2 rounded-lg">
							<Plus className="h-5 w-5 text-white" />
						</div>
						<div>
							<DialogTitle className="text-2xl">Add New Expense</DialogTitle>
							<DialogDescription>
								Record your expense with details below
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>
				<form onSubmit={handleSubmit}>
					<div className="grid gap-5 py-4">
						<div className="grid gap-2">
							<Label
								htmlFor="amount"
								className="flex items-center gap-2 text-purple-900"
							>
								<DollarSign className="h-4 w-4" />
								Amount (₹)
							</Label>
							<Input
								id="amount"
								type="number"
								step="0.01"
								placeholder="0.00"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								required
								className="text-lg font-semibold border-2 focus:border-purple-500"
							/>
						</div>

						<div className="grid gap-2">
							<Label
								htmlFor="category"
								className="flex items-center gap-2 text-purple-900"
							>
								<Tag className="h-4 w-4" />
								Category
							</Label>
							<Select value={category} onValueChange={setCategory} required>
								<SelectTrigger className="border-2 focus:border-purple-500">
									<SelectValue placeholder="Select category" />
								</SelectTrigger>
								<SelectContent>
									{CATEGORIES.map((cat) => (
										<SelectItem key={cat} value={cat}>
											{cat}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="grid gap-2">
							<Label
								htmlFor="description"
								className="flex items-center gap-2 text-purple-900"
							>
								<FileText className="h-4 w-4" />
								Description
							</Label>
							<Input
								id="description"
								placeholder="e.g., Grocery shopping"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								required
								className="border-2 focus:border-purple-500"
							/>
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div className="grid gap-2">
								<Label
									htmlFor="date"
									className="flex items-center gap-2 text-purple-900"
								>
									<Calendar className="h-4 w-4" />
									Date
								</Label>
								<Input
									id="date"
									type="date"
									value={date}
									onChange={(e) => setDate(e.target.value)}
									required
									className="border-2 focus:border-purple-500"
								/>
							</div>

							<div className="grid gap-2">
								<Label
									htmlFor="paymentMethod"
									className="flex items-center gap-2 text-purple-900"
								>
									<CreditCard className="h-4 w-4" />
									Payment Method
								</Label>
								<Select
									value={paymentMethod}
									onValueChange={(v) =>
										setPaymentMethod(v as "upi" | "cash" | "card")
									}
								>
									<SelectTrigger className="border-2 focus:border-purple-500">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{PAYMENT_METHODS.map((method) => (
											<SelectItem key={method} value={method}>
												{method.toUpperCase()}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						<div className="grid gap-2">
							<Label
								htmlFor="type"
								className="flex items-center gap-2 text-purple-900"
							>
								<Repeat className="h-4 w-4" />
								Expense Type
							</Label>
							<Select
								value={type}
								onValueChange={(v) => setType(v as "one-time" | "recurring")}
							>
								<SelectTrigger className="border-2 focus:border-purple-500">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="one-time">One-time</SelectItem>
									<SelectItem value="recurring">Recurring</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{type === "recurring" && (
							<div className="grid gap-2 p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
								<Label
									htmlFor="frequency"
									className="flex items-center gap-2 text-purple-900"
								>
									<Repeat className="h-4 w-4" />
									Frequency
								</Label>
								<Select
									value={frequency}
									onValueChange={(v) =>
										setFrequency(v as "daily" | "weekly" | "monthly" | "yearly")
									}
								>
									<SelectTrigger className="bg-white border-2 focus:border-purple-500">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{RECURRING_FREQUENCIES.map((freq) => (
											<SelectItem key={freq} value={freq}>
												{freq.charAt(0).toUpperCase() + freq.slice(1)}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>
					<DialogFooter className="gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="border-2"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="gradient-purple text-white shadow-lg hover:shadow-xl transition-all"
						>
							<Plus className="h-4 w-4 mr-2" />
							Add Expense
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
