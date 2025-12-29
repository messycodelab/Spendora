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
		<div className="space-y-4">
			<div className="flex items-center justify-between px-2">
				<div>
					<h2 className="text-lg font-bold text-slate-900 tracking-tight">Transactions</h2>
					<p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{sortedExpenses.length} total entries</p>
				</div>
				<Receipt className="h-5 w-5 text-slate-300" />
			</div>

			{sortedExpenses.length === 0 ? (
				<div className="modern-card py-16 rounded-[2rem] border-dashed text-center">
					<div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
						<Receipt className="h-8 w-8" />
					</div>
					<p className="text-slate-400 text-sm font-bold uppercase tracking-widest">No transactions yet</p>
				</div>
			) : (
				<div className="space-y-2 max-h-[500px] overflow-y-auto pr-1 scrollbar-hide">
					{dateGroups.map(({ date, expenses, dailyTotal }) => {
						const isExpanded = expandedDates.has(date);
						
						return (
							<div key={date} className="modern-card rounded-2xl overflow-hidden">
								{/* Collapsible Header */}
								<button
									type="button"
									onClick={() => toggleDate(date)}
									className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
								>
									<div className="flex items-center gap-2">
										{isExpanded ? (
											<ChevronDown className="h-4 w-4 text-[#062163]" />
										) : (
											<ChevronRight className="h-4 w-4 text-slate-400" />
										)}
										<span className="text-xs font-black text-slate-900 uppercase tracking-tighter">
											{formatDateHeader(date)}
										</span>
										<span className="px-1.5 py-0.5 bg-slate-200/50 text-slate-500 rounded text-[9px] font-black">
											{expenses.length}
										</span>
									</div>
									<span className="text-sm font-black text-[#062163]">
										{formatCurrency(dailyTotal)}
									</span>
								</button>

								{/* Expanded Content - Table Style */}
								{isExpanded && (
									<div className="bg-white border-t border-slate-100">
										<table className="w-full">
											<tbody>
												{expenses.map((expense) => {
													const PaymentIcon = paymentIcons[expense.paymentMethod as keyof typeof paymentIcons] || Smartphone;
													const categoryInfo =
														categoryConfig[expense.category as keyof typeof categoryConfig] ||
														categoryConfig["Others"];
													const CategoryIcon = categoryInfo.icon;

													return (
														<tr
															key={expense.id}
															className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors"
														>
															<td className="py-2.5 pl-4 w-10">
																<div className={`h-8 w-8 rounded-xl ${categoryInfo.color} flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
																	<CategoryIcon className="h-4 w-4 text-white" />
																</div>
															</td>
															<td className="py-2.5 px-3">
																<div className="flex flex-col">
																	<span className="text-xs font-bold text-slate-900 leading-tight">
																		{expense.description}
																	</span>
																	<div className="flex items-center gap-2 mt-0.5">
																		<span className={`text-[9px] font-black uppercase tracking-widest ${categoryInfo.text}`}>
																			{expense.category}
																		</span>
																		<span className="h-1 w-1 rounded-full bg-slate-200" />
																		<div className="flex items-center gap-1 text-slate-400">
																			<PaymentIcon className="h-2.5 w-2.5" />
																			<span className="uppercase text-[9px] font-bold">{expense.paymentMethod}</span>
																		</div>
																		{expense.type === "recurring" && (
																			<>
																				<span className="h-1 w-1 rounded-full bg-slate-200" />
																				<div className="flex items-center gap-1 text-[#062163]">
																					<Repeat className="h-2.5 w-2.5" />
																					<span className="text-[9px] font-bold uppercase">{expense.recurringDetails?.frequency}</span>
																				</div>
																			</>
																		)}
																	</div>
																</div>
															</td>
															<td className="py-2.5 px-3 text-right">
																<span className="text-sm font-black text-slate-900 tracking-tight">
																	{formatCurrency(expense.amount)}
																</span>
															</td>
															<td className="py-2.5 pr-4 w-8">
																<button
																	type="button"
																	onClick={(e) => {
																		e.stopPropagation();
																		onDeleteExpense(expense.id);
																	}}
																	className="h-7 w-7 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
																>
																	<Trash2 className="h-3.5 w-3.5" />
																</button>
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
