import { useState } from "react";
import { Button } from "./ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";
import { type Expense } from "@/types";
import {
	Trash2,
	CreditCard,
	Banknote,
	Smartphone,
	Repeat,
	UtensilsCrossed,
	Car,
	ShoppingBag,
	Film,
	Lightbulb,
	Heart,
	GraduationCap,
	Home,
	Tv,
	MoreHorizontal,
	Receipt,
	ChevronDown,
	ChevronRight,
} from "lucide-react";

interface ExpenseListProps {
	expenses: Expense[];
	onDeleteExpense: (id: string) => void;
}

const paymentIcons = {
	upi: Smartphone,
	cash: Banknote,
	card: CreditCard,
};

const categoryConfig = {
	"Food & Dining": { icon: UtensilsCrossed, color: "bg-orange-500", text: "text-orange-600" },
	Transportation: { icon: Car, color: "bg-blue-500", text: "text-blue-600" },
	Shopping: { icon: ShoppingBag, color: "bg-pink-500", text: "text-pink-600" },
	Entertainment: { icon: Film, color: "bg-purple-500", text: "text-purple-600" },
	"Bills & Utilities": { icon: Lightbulb, color: "bg-amber-500", text: "text-amber-600" },
	Healthcare: { icon: Heart, color: "bg-red-500", text: "text-red-600" },
	Education: { icon: GraduationCap, color: "bg-green-500", text: "text-green-600" },
	Rent: { icon: Home, color: "bg-cyan-500", text: "text-cyan-600" },
	Subscriptions: { icon: Tv, color: "bg-indigo-500", text: "text-indigo-600" },
	Others: { icon: MoreHorizontal, color: "bg-gray-500", text: "text-gray-600" },
} as const;

export function ExpenseList({ expenses, onDeleteExpense }: ExpenseListProps) {
	const sortedExpenses = [...expenses].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);

	// Group expenses by date
	const groupedByDate = sortedExpenses.reduce(
		(acc, expense) => {
			const dateKey = expense.date.split("T")[0];
			if (!acc[dateKey]) {
				acc[dateKey] = [];
			}
			acc[dateKey].push(expense);
			return acc;
		},
		{} as Record<string, Expense[]>,
	);

	const dateGroups = Object.entries(groupedByDate)
		.sort(([dateA], [dateB]) => new Date(dateB).getTime() - new Date(dateA).getTime())
		.map(([date, expenses]) => ({
			date,
			expenses,
			dailyTotal: expenses.reduce((sum, e) => sum + e.amount, 0),
		}));

	// Today's date key
	const todayKey = new Date().toISOString().slice(0, 10);
	
	// Initialize expanded state - only today is expanded by default
	const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set([todayKey]));

	const toggleDate = (date: string) => {
		setExpandedDates((prev) => {
			const next = new Set(prev);
			if (next.has(date)) {
				next.delete(date);
			} else {
				next.add(date);
			}
			return next;
		});
	};

	const formatDateHeader = (dateStr: string) => {
		const date = new Date(dateStr);
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);

		if (date.toDateString() === today.toDateString()) return "Today";
		if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
		return formatDate(dateStr);
	};

	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between px-1 mb-3">
				<div>
					<h2 className="text-sm font-bold text-slate-900">Transactions</h2>
					<p className="text-[10px] text-slate-400">{sortedExpenses.length} total</p>
				</div>
				<Receipt className="h-4 w-4 text-slate-300" />
			</div>

			{sortedExpenses.length === 0 ? (
				<div className="text-center py-8 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
					<Receipt className="h-5 w-5 text-slate-200 mx-auto mb-1" />
					<p className="text-slate-400 text-xs">No transactions</p>
				</div>
			) : (
				<div className="max-h-[400px] overflow-y-auto space-y-1 pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
					{dateGroups.map(({ date, expenses, dailyTotal }) => {
						const isExpanded = expandedDates.has(date);
						
						return (
							<div key={date} className="rounded-lg overflow-hidden border border-slate-100">
								{/* Collapsible Header */}
								<button
									onClick={() => toggleDate(date)}
									className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 hover:bg-slate-100 transition-colors"
								>
									<div className="flex items-center gap-2">
										{isExpanded ? (
											<ChevronDown className="h-3 w-3 text-slate-400" />
										) : (
											<ChevronRight className="h-3 w-3 text-slate-400" />
										)}
										<span className="text-xs font-semibold text-slate-700">
											{formatDateHeader(date)}
										</span>
										<span className="text-[10px] text-slate-400 bg-slate-200 px-1.5 py-0.5 rounded">
											{expenses.length}
										</span>
									</div>
									<span className="text-xs font-bold text-slate-900">
										{formatCurrency(dailyTotal)}
									</span>
								</button>

								{/* Expanded Content - Table Style */}
								{isExpanded && (
									<div className="bg-white">
										<table className="w-full text-xs">
											<tbody>
												{expenses.map((expense) => {
													const PaymentIcon = paymentIcons[expense.paymentMethod];
													const categoryInfo =
														categoryConfig[expense.category as keyof typeof categoryConfig] ||
														categoryConfig["Others"];
													const CategoryIcon = categoryInfo.icon;

													return (
														<tr
															key={expense.id}
															className="group border-t border-slate-50 hover:bg-slate-50/50"
														>
															<td className="py-1.5 pl-3 w-6">
																<div className={`h-5 w-5 rounded ${categoryInfo.color} flex items-center justify-center`}>
																	<CategoryIcon className="h-2.5 w-2.5 text-white" />
																</div>
															</td>
															<td className="py-1.5 pl-2">
																<div className="flex items-center gap-1.5">
																	<span className="font-medium text-slate-800 truncate max-w-[120px]">
																		{expense.description}
																	</span>
																	{expense.type === "recurring" && (
																		<Repeat className="h-2.5 w-2.5 text-indigo-500 flex-shrink-0" />
																	)}
																</div>
															</td>
															<td className={`py-1.5 px-2 hidden sm:table-cell ${categoryInfo.text} text-[10px] font-medium truncate max-w-[80px]`}>
																{expense.category}
															</td>
															<td className="py-1.5 px-2 text-slate-400 hidden md:table-cell">
																<div className="flex items-center gap-1">
																	<PaymentIcon className="h-2.5 w-2.5" />
																	<span className="uppercase text-[9px]">{expense.paymentMethod}</span>
																</div>
															</td>
															<td className="py-1.5 px-2 text-right font-semibold text-slate-900 whitespace-nowrap">
																{formatCurrency(expense.amount)}
															</td>
															<td className="py-1.5 pr-2 w-6">
																<Button
																	variant="ghost"
																	size="icon"
																	onClick={(e) => {
																		e.stopPropagation();
																		onDeleteExpense(expense.id);
																	}}
																	className="h-5 w-5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
																>
																	<Trash2 className="h-2.5 w-2.5" />
																</Button>
															</td>
														</tr>
													);
												})}
											</tbody>
										</table>
									</div>
								)}
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
