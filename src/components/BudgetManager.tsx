import { useState } from "react";
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
import { formatCurrency } from "@/lib/utils";
import type { Budget, Expense } from "@/types";
import { CATEGORIES } from "@/types";
import { Target, DollarSign, CheckCircle2 } from "lucide-react";

interface BudgetManagerProps {
	expenses: Expense[];
	budgets: Budget[];
	onSetBudget: (budget: Budget) => void;
}

export function BudgetManager({
	expenses,
	budgets,
	onSetBudget,
}: BudgetManagerProps) {
	const [category, setCategory] = useState("");
	const [limit, setLimit] = useState("");

	const currentMonth = new Date().toISOString().slice(0, 7);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!category || !limit) {
			alert("Please fill all fields");
			return;
		}

		const existingBudget = budgets.find(
			(b) => b.category === category && b.month === currentMonth,
		);

		const budget: Budget = {
			id: existingBudget?.id || crypto.randomUUID(),
			category,
			monthlyLimit: parseFloat(limit),
			currentSpend: existingBudget?.currentSpend || 0,
			month: currentMonth,
		};

		onSetBudget(budget);
		setCategory("");
		setLimit("");
	};

	const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);

	const getCategorySpend = (category: string) => {
		return expenses
			.filter((e) => e.category === category && e.date.startsWith(currentMonth))
			.reduce((sum, e) => sum + e.amount, 0);
	};

	const getPercentage = (spent: number, limit: number) => {
		return (spent / limit) * 100;
	};

	const getStatusColor = (percentage: number) => {
		if (percentage >= 100) return "text-rose-500";
		if (percentage >= 80) return "text-amber-500";
		return "text-emerald-500";
	};

	const getGradient = (percentage: number) => {
		if (percentage >= 100) return "gradient-danger";
		if (percentage >= 80) return "gradient-warning";
		return "gradient-success";
	};

	const getBarColor = (percentage: number) => {
		if (percentage >= 100) return "bg-rose-500";
		if (percentage >= 80) return "bg-amber-500";
		return "bg-emerald-500";
	};

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between px-2">
				<div>
					<h2 className="text-lg font-bold text-slate-900">Budget Targets</h2>
					<p className="text-xs text-slate-400 font-medium">
						Planning your monthly allowances
					</p>
				</div>
				<Target className="h-5 w-5 text-slate-300" />
			</div>

			<div className="grid lg:grid-cols-3 gap-8">
				<form
					onSubmit={handleSubmit}
					className="lg:col-span-1 space-y-5 p-6 rounded-[2rem] bg-slate-50/50 border border-slate-100"
				>
					<div className="space-y-2">
						<Label
							htmlFor="budget-category"
							className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
						>
							Category
						</Label>
						<Select value={category} onValueChange={setCategory}>
							<SelectTrigger className="bg-white rounded-2xl border-slate-100 h-11 focus:ring-offset-0 focus:ring-indigo-100">
								<SelectValue placeholder="Select one" />
							</SelectTrigger>
							<SelectContent className="rounded-2xl border-slate-100 shadow-xl">
								{CATEGORIES.map((cat) => (
									<SelectItem key={cat} value={cat} className="rounded-xl">
										{cat}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div className="space-y-2">
						<Label
							htmlFor="budget-limit"
							className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1"
						>
							Monthly Limit (₹)
						</Label>
						<div className="relative">
							<DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
							<Input
								id="budget-limit"
								type="number"
								step="0.01"
								placeholder="0.00"
								value={limit}
								onChange={(e) => setLimit(e.target.value)}
								className="bg-white rounded-2xl border-slate-100 h-11 pl-9 focus:ring-offset-0 focus:ring-indigo-100"
							/>
						</div>
					</div>
					<Button
						type="submit"
						className="w-full h-11 rounded-2xl gradient-brand text-white shadow-lg shadow-indigo-100 font-bold text-sm tracking-wide active:scale-[0.98] transition-all"
					>
						Update Target
					</Button>
				</form>

				<div className="lg:col-span-2">
					{currentMonthBudgets.length === 0 ? (
						<div className="text-center py-16 bg-white/50 rounded-[2rem] border-2 border-dashed border-slate-100">
							<div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4">
								<Target className="h-8 w-8 text-slate-100" />
							</div>
							<p className="text-slate-400 text-sm font-medium">
								No active targets set
							</p>
						</div>
					) : (
						<div className="grid md:grid-cols-2 gap-3">
							{currentMonthBudgets.map((budget) => {
								const currentSpend = getCategorySpend(budget.category);
								const percentage = getPercentage(
									currentSpend,
									budget.monthlyLimit,
								);
								const statusColor = getStatusColor(percentage);
								const gradientClass = getGradient(percentage);
								const barColor = getBarColor(percentage);

								return (
									<div
										key={budget.id}
										className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
									>
										<div className="flex items-center justify-between mb-3">
											<div className="flex items-center gap-2.5">
												<div
													className={`h-7 w-7 rounded-lg ${gradientClass} flex items-center justify-center text-white shadow-sm shrink-0`}
												>
													<CheckCircle2 className="h-3.5 w-3.5" />
												</div>
												<h4 className="font-bold text-slate-800 text-sm truncate">
													{budget.category}
												</h4>
											</div>
											<span
												className={`font-black text-sm ${statusColor} tracking-tighter shrink-0`}
											>
												{percentage.toFixed(0)}%
											</span>
										</div>

										<div className="space-y-2">
											<div className="relative h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
												<div
													className={`absolute left-0 top-0 h-full ${barColor} transition-all duration-1000 ease-out rounded-full`}
													style={{ width: `${Math.min(percentage, 100)}%` }}
												/>
											</div>

											<div className="space-y-1">
												<div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
													<span className="text-slate-400">
														Spent:{" "}
														<span className="text-slate-600">
															{formatCurrency(currentSpend)}
														</span>
													</span>
													<span className="text-slate-400">
														Limit:{" "}
														<span className="text-slate-600">
															{formatCurrency(budget.monthlyLimit)}
														</span>
													</span>
												</div>
												<div className="text-right">
													<span
														className={`text-[10px] font-bold ${statusColor}`}
													>
														{budget.monthlyLimit - currentSpend > 0
															? `${formatCurrency(budget.monthlyLimit - currentSpend)} left`
															: "Over budget"}
													</span>
												</div>
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
