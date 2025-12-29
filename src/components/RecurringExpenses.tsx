import { formatCurrency, formatDate } from "@/lib/utils";
import { type Expense } from "@/types";
import {
	Calendar,
	Repeat,
	Clock,
	TrendingUp,
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
} from "lucide-react";

interface RecurringExpensesProps {
	expenses: Expense[];
}

const categoryConfig = {
	"Food & Dining": {
		icon: UtensilsCrossed,
		color: "from-orange-400 to-red-500",
		bg: "bg-orange-50",
		text: "text-orange-600",
	},
	Transportation: {
		icon: Car,
		color: "from-blue-400 to-blue-600",
		bg: "bg-blue-50",
		text: "text-blue-600",
	},
	Shopping: {
		icon: ShoppingBag,
		color: "from-pink-400 to-purple-500",
		bg: "bg-pink-50",
		text: "text-pink-600",
	},
	Entertainment: {
		icon: Film,
		color: "from-purple-400 to-indigo-500",
		bg: "bg-purple-50",
		text: "text-purple-600",
	},
	"Bills & Utilities": {
		icon: Lightbulb,
		color: "from-yellow-400 to-orange-500",
		bg: "bg-yellow-50",
		text: "text-yellow-600",
	},
	Healthcare: {
		icon: Heart,
		color: "from-red-400 to-pink-500",
		bg: "bg-red-100",
		text: "text-red-600",
	},
	Education: {
		icon: GraduationCap,
		color: "from-green-400 to-teal-500",
		bg: "bg-green-50",
		text: "text-green-600",
	},
	Rent: {
		icon: Home,
		color: "from-cyan-400 to-blue-500",
		bg: "bg-cyan-50",
		text: "text-cyan-600",
	},
	Subscriptions: {
		icon: Tv,
		color: "from-indigo-400 to-purple-500",
		bg: "bg-indigo-50",
		text: "text-indigo-600",
	},
	Others: {
		icon: MoreHorizontal,
		color: "from-gray-400 to-gray-600",
		bg: "bg-gray-50",
		text: "text-gray-600",
	},
} as const;

export function RecurringExpenses({ expenses }: RecurringExpensesProps) {
	const recurringExpenses = expenses.filter((e) => e.type === "recurring");

	const totalMonthlyRecurring = recurringExpenses.reduce((sum, expense) => {
		if (!expense.recurringDetails) return sum;

		const { frequency } = expense.recurringDetails;
		let monthlyAmount = expense.amount;

		if (frequency === "daily") monthlyAmount *= 30;
		if (frequency === "weekly") monthlyAmount *= 4;
		if (frequency === "yearly") monthlyAmount /= 12;

		return sum + monthlyAmount;
	}, 0);

	const frequencyColors = {
		daily: "gradient-danger",
		weekly: "gradient-warning",
		monthly: "gradient-brand",
		yearly: "gradient-success",
	};

	return (
		<div className="space-y-6">
			<div className="grid lg:grid-cols-3 gap-6">
				<div className="lg:col-span-1">
					<div className="gradient-brand p-6 rounded-[2rem] text-white shadow-lg relative overflow-hidden group">
						<div className="relative z-10">
							<div className="bg-white/20 h-10 w-10 rounded-xl flex items-center justify-center mb-4 backdrop-blur-md">
								<TrendingUp className="h-5 w-5" />
							</div>
							<p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest mb-1">
								Monthly Committed
							</p>
							<h3 className="text-2xl font-black tracking-tighter mb-2">
								{formatCurrency(totalMonthlyRecurring)}
							</h3>
							<p className="text-indigo-200/60 text-[9px] font-bold leading-relaxed uppercase tracking-wider">
								Aggregated across all cycles
							</p>
						</div>
						<Repeat className="absolute -right-6 -bottom-6 h-32 w-32 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
					</div>
				</div>

				<div className="lg:col-span-2">
					{recurringExpenses.length === 0 ? (
						<div className="modern-card py-16 rounded-[2rem] border-dashed text-center h-full flex flex-col justify-center">
							<div className="h-12 w-12 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-200">
								<Clock className="h-6 w-6" />
							</div>
							<p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
								No recurring items configured
							</p>
						</div>
					) : (
						<div className="grid md:grid-cols-2 gap-3">
							{recurringExpenses.map((expense) => {
								const frequency =
									expense.recurringDetails?.frequency || "monthly";
								const frequencyGradient =
									frequencyColors[frequency as keyof typeof frequencyColors];
								const categoryInfo =
									categoryConfig[
										expense.category as keyof typeof categoryConfig
									] || categoryConfig["Others"];
								const CategoryIcon = categoryInfo.icon;

								return (
									<div
										key={expense.id}
										className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
									>
										<div className="flex items-start gap-3 mb-3">
											{/* Icon Group */}
											<div className="relative shrink-0">
												<div
													className={`h-8 w-8 rounded-lg bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center text-white shadow-sm`}
												>
													<CategoryIcon className="h-3.5 w-3.5" />
												</div>
												<div
													className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full ${frequencyGradient} flex items-center justify-center border-2 border-white`}
												>
													<Repeat className="h-2 w-2 text-white" />
												</div>
											</div>

											{/* Details Group */}
											<div className="min-w-0 flex-1">
												<h4 className="font-bold text-slate-800 text-sm truncate leading-tight mb-1">
													{expense.description}
												</h4>
												<div className="flex items-center gap-2 flex-wrap">
													<span
														className={`text-[9px] font-black uppercase tracking-widest ${categoryInfo.text}`}
													>
														{expense.category}
													</span>
													<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
														{frequency}
													</span>
												</div>
											</div>
										</div>

										<div className="space-y-2 pt-2 border-t border-slate-50">
											<div className="flex items-center justify-between">
												<div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400">
													<Calendar className="h-3 w-3" />
													<span>
														{formatDate(expense.recurringDetails?.nextDate || "")}
													</span>
												</div>
												<div className="text-right">
													<div className="text-sm font-black text-slate-900 leading-tight tracking-tight">
														{formatCurrency(expense.amount)}
													</div>
													<p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
														per cycle
													</p>
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
