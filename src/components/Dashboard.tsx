import { formatCurrency } from "@/lib/utils";
import { type Expense, type Budget } from "@/types";
import {
	Wallet,
	TrendingUp,
	Receipt,
	Repeat,
	PieChart as PieChartIcon,
	BarChart3,
} from "lucide-react";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	PieChart,
	Pie,
	Cell,
} from "recharts";

interface DashboardProps {
	expenses: Expense[];
	budgets: Budget[];
}

const COLORS = [
	"#6366f1",
	"#3b82f6",
	"#10b981",
	"#f59e0b",
	"#ec4899",
	"#8b5cf6",
	"#06b6d4",
	"#14b8a6",
	"#f43f5e",
	"#64748b",
];

export function Dashboard({ expenses, budgets }: DashboardProps) {
	const currentMonth = new Date().toISOString().slice(0, 7);

	const currentMonthExpenses = expenses.filter((e) =>
		e.date.startsWith(currentMonth),
	);

	const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);

	const totalBudget = budgets
		.filter((b) => b.month === currentMonth)
		.reduce((sum, b) => sum + b.monthlyLimit, 0);

	const budgetUsedPercent =
		totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

	// Calculate recurring monthly total
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

	// Get current month name
	const currentMonthName = new Date().toLocaleDateString("en-US", {
		month: "long",
		year: "numeric",
	});

	// Prepare data for Daily Spending Area Chart
	const daysInMonth = new Date(
		new Date().getFullYear(),
		new Date().getMonth() + 1,
		0,
	).getDate();
	const dailyData = Array.from({ length: daysInMonth }, (_, i) => {
		const day = i + 1;
		const dayStr = `${currentMonth}-${day.toString().padStart(2, "0")}`;
		const amount = currentMonthExpenses
			.filter((e) => e.date.startsWith(dayStr))
			.reduce((sum, e) => sum + e.amount, 0);
		return {
			day: day.toString(),
			amount: amount,
		};
	});

	// Prepare data for Category Distribution Pie Chart
	const categoryDataMap = currentMonthExpenses.reduce(
		(acc, e) => {
			acc[e.category] = (acc[e.category] || 0) + e.amount;
			return acc;
		},
		{} as Record<string, number>,
	);

	const categoryData = Object.entries(categoryDataMap)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value);

	const hasData = currentMonthExpenses.length > 0;

	return (
		<div className="space-y-6">
			{/* Month Header */}
			<div className="flex items-center justify-between px-1">
				<h2 className="text-sm font-bold text-slate-900">{currentMonthName}</h2>
				<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
					{currentMonthExpenses.length} transactions
				</span>
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
				{/* Spent vs Budget Card - Main Focus */}
				<div className="modern-card p-5 rounded-2xl lg:col-span-2">
					<div className="flex items-center gap-3 mb-4">
						<div className="h-9 w-9 rounded-xl gradient-purple flex items-center justify-center text-white shadow-sm">
							<TrendingUp className="h-4 w-4" />
						</div>
						<div>
							<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
								Spent vs Budget
							</span>
						</div>
					</div>

					<div className="flex items-end justify-between mb-3">
						<div>
							<span className="text-3xl font-black text-slate-900 tracking-tight">
								{formatCurrency(totalSpent)}
							</span>
							<span className="text-slate-400 text-sm font-medium ml-2">
								/ {formatCurrency(totalBudget)}
							</span>
						</div>
						<span
							className={`text-sm font-bold ${budgetUsedPercent > 100 ? "text-red-500" : budgetUsedPercent > 80 ? "text-orange-500" : "text-emerald-500"}`}
						>
							{budgetUsedPercent.toFixed(0)}% used
						</span>
					</div>

					<div className="relative h-2 w-full bg-slate-100 rounded-full overflow-hidden">
						<div
							className={`absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ${budgetUsedPercent > 100 ? "bg-red-500" : budgetUsedPercent > 80 ? "bg-orange-400" : "bg-emerald-500"}`}
							style={{ width: `${Math.min(budgetUsedPercent, 100)}%` }}
						/>
					</div>

					{totalBudget > 0 && (
						<p className="text-[11px] font-medium text-slate-400 mt-2">
							{totalBudget - totalSpent >= 0
								? `${formatCurrency(totalBudget - totalSpent)} remaining this month`
								: `${formatCurrency(Math.abs(totalBudget - totalSpent))} over budget`}
						</p>
					)}
				</div>

				{/* Recurring Card */}
				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-3 mb-4">
						<div className="h-9 w-9 rounded-xl gradient-blue flex items-center justify-center text-white shadow-sm">
							<Repeat className="h-4 w-4" />
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Recurring
						</span>
					</div>
					<div>
						<span className="text-2xl font-black text-slate-900 tracking-tight">
							{formatCurrency(totalMonthlyRecurring)}
						</span>
						<p className="text-[11px] font-medium text-slate-400 mt-1">
							{recurringExpenses.length} spends/month
						</p>
					</div>
				</div>
			</div>

			<div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{/* Spending Trend Chart */}
				<div className="modern-card p-6 rounded-[2.5rem] lg:col-span-2">
					<div className="flex items-center justify-between mb-6 px-2">
						<div>
							<h3 className="text-lg font-bold text-slate-900">
								Spending Trend
							</h3>
							<p className="text-xs text-slate-400 font-medium">
								Daily expenses this month
							</p>
						</div>
						<BarChart3 className="h-5 w-5 text-slate-300" />
					</div>
					<div className="h-[300px] w-full flex items-center justify-center">
						{hasData ? (
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={dailyData}>
									<defs>
										<linearGradient
											id="colorAmount"
											x1="0"
											y1="0"
											x2="0"
											y2="1"
										>
											<stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
											<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid
										strokeDasharray="3 3"
										vertical={false}
										stroke="#f1f5f9"
									/>
									<XAxis
										dataKey="day"
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 10, fill: "#94a3b8" }}
										dy={10}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 10, fill: "#94a3b8" }}
										tickFormatter={(value) => `₹${value}`}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: "16px",
											border: "none",
											boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
										formatter={(value: number) => [
											formatCurrency(value),
											"Amount",
										]}
									/>
									<Area
										type="monotone"
										dataKey="amount"
										stroke="#6366f1"
										strokeWidth={3}
										fillOpacity={1}
										fill="url(#colorAmount)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						) : (
							<div className="text-center">
								<div className="bg-slate-50 h-16 w-16 rounded-3xl flex items-center justify-center mb-4 mx-auto">
									<BarChart3 className="h-8 w-8 text-slate-200" />
								</div>
								<p className="text-slate-400 text-sm font-medium">
									No data for this month
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Category Distribution Chart */}
				<div className="modern-card p-6 rounded-[2.5rem]">
					<div className="flex items-center justify-between mb-6 px-2">
						<div>
							<h3 className="text-lg font-bold text-slate-900">Categories</h3>
							<p className="text-xs text-slate-400 font-medium">
								Spending by category
							</p>
						</div>
						<PieChartIcon className="h-5 w-5 text-slate-300" />
					</div>
					<div className="h-[250px] w-full flex items-center justify-center">
						{hasData ? (
							<ResponsiveContainer width="100%" height="100%">
								<PieChart>
									<Pie
										data={categoryData}
										cx="50%"
										cy="50%"
										innerRadius={60}
										outerRadius={80}
										paddingAngle={5}
										dataKey="value"
									>
										{categoryData.map((entry, index) => (
											<Cell
												key={`cell-${index}`}
												fill={COLORS[index % COLORS.length]}
											/>
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: "16px",
											border: "none",
											boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
											fontSize: "12px",
											fontWeight: "bold",
										}}
										formatter={(value: number) => [
											formatCurrency(value),
											"Spent",
										]}
									/>
								</PieChart>
							</ResponsiveContainer>
						) : (
							<div className="text-center">
								<div className="bg-slate-50 h-16 w-16 rounded-3xl flex items-center justify-center mb-4 mx-auto">
									<PieChartIcon className="h-8 w-8 text-slate-200" />
								</div>
								<p className="text-slate-400 text-sm font-medium">
									No expenses yet
								</p>
							</div>
						)}
					</div>
					{hasData && (
						<div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto px-2 scrollbar-hide">
							{categoryData.slice(0, 5).map((entry, index) => (
								<div
									key={entry.name}
									className="flex items-center justify-between text-[11px] font-bold"
								>
									<div className="flex items-center gap-2">
										<div
											className="h-2 w-2 rounded-full"
											style={{ backgroundColor: COLORS[index % COLORS.length] }}
										/>
										<span className="text-slate-600 truncate max-w-[100px]">
											{entry.name}
										</span>
									</div>
									<span className="text-slate-400">
										{((entry.value / (totalSpent || 1)) * 100).toFixed(0)}%
									</span>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
