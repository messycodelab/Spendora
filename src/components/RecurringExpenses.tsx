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
		daily: "from-rose-400 to-pink-500",
		weekly: "from-orange-400 to-amber-500",
		monthly: "from-indigo-400 to-blue-500",
		yearly: "from-emerald-400 to-teal-500",
	};

	return (
		<div className="space-y-8">
			<div className="flex items-center justify-between px-2">
				<div>
					<h2 className="text-lg font-bold text-slate-900">
						Automatic Subscriptions
					</h2>
					<p className="text-xs text-slate-400 font-medium">
						Tracking your repetitive commitments
					</p>
				</div>
				<Repeat className="h-5 w-5 text-slate-300" />
			</div>

			<div className="grid lg:grid-cols-3 gap-8">
				<div className="lg:col-span-1">
					<div className="gradient-purple p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
						<div className="relative z-10">
							<div className="bg-white/20 h-12 w-12 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
								<TrendingUp className="h-6 w-6" />
							</div>
							<p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mb-1">
								Monthly Committed
							</p>
							<h3 className="text-3xl font-black tracking-tighter mb-2">
								{formatCurrency(totalMonthlyRecurring)}
							</h3>
							<p className="text-indigo-200/60 text-[10px] font-medium leading-relaxed">
								Aggregated based on daily, weekly, and annual cycles.
							</p>
						</div>
						<Repeat className="absolute -right-8 -bottom-8 h-40 w-40 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
					</div>
				</div>

				<div className="lg:col-span-2 space-y-3">
					{recurringExpenses.length === 0 ? (
						<div className="text-center py-20 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100">
							<div className="bg-white h-16 w-16 rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-4">
								<Clock className="h-8 w-8 text-slate-100" />
							</div>
							<p className="text-slate-400 text-sm font-medium">
								No recurring items configured
							</p>
						</div>
					) : (
						recurringExpenses.map((expense) => {
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
									className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:bg-slate-50 transition-all duration-200 group"
								>
									{/* Icon Group */}
									<div className="relative shrink-0">
										<div
											className={`h-10 w-10 rounded-xl bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform duration-300`}
										>
											<CategoryIcon className="h-4 w-4" />
										</div>
										<div
											className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-gradient-to-br ${frequencyGradient} flex items-center justify-center border-2 border-white`}
										>
											<Repeat className="h-2 w-2 text-white" />
										</div>
									</div>

									{/* Details Group */}
									<div className="min-w-0 flex-1">
										<h4 className="font-bold text-slate-800 text-sm truncate leading-tight">
											{expense.description}
										</h4>
										<div className="flex items-center gap-2 mt-1">
											<span
												className={`text-[9px] font-bold uppercase tracking-wider ${categoryInfo.text}`}
											>
												{expense.category}
											</span>
											<span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
												{frequency}
											</span>
										</div>
									</div>

									{/* Next Payment */}
									<div className="hidden sm:flex flex-col items-center px-4 border-x border-slate-100">
										<span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">
											Next Payment
										</span>
										<div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600">
											<Calendar className="h-2.5 w-2.5" />
											<span>
												{formatDate(expense.recurringDetails?.nextDate || "")}
											</span>
										</div>
									</div>

									{/* Amount Group */}
									<div className="text-right shrink-0 min-w-[100px]">
										<div className="text-base font-black text-slate-900 leading-tight">
											{formatCurrency(expense.amount)}
										</div>
										<p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
											per cycle
										</p>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</div>
	);
}
