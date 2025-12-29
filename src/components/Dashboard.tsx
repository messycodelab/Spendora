import { formatCurrency } from "@/lib/utils";
import {
	type Expense,
	type Budget,
	type Asset,
	type Loan,
	type NetWorthHistory,
	type Goal,
} from "@/types";
import {
	Wallet,
	TrendingUp,
	Repeat,
	PieChart as PieChartIcon,
	BarChart3,
	LayoutDashboard,
	ArrowUpRight,
	ArrowDownRight,
	Camera,
	Shield,
	Building2,
	PiggyBank,
	Target,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Button } from "./ui/button";

interface DashboardProps {
	expenses: Expense[];
	budgets: Budget[];
	assets: Asset[];
	loans: Loan[];
	goals: Goal[];
	netWorthHistory: NetWorthHistory[];
	onRecordSnapshot: () => Promise<void>;
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

export function Dashboard({
	expenses,
	budgets,
	assets,
	loans: allLoans,
	goals,
	netWorthHistory,
	onRecordSnapshot,
}: DashboardProps) {
	const currentMonth = new Date().toISOString().slice(0, 7);
	const activeLoans = allLoans.filter((l) => l.isPaidOff === 0);

	// Spending Calculations
	const currentMonthExpenses = expenses.filter((e) =>
		e.date.startsWith(currentMonth),
	);
	const totalSpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
	const totalBudget = budgets
		.filter((b) => b.month === currentMonth)
		.reduce((sum, b) => sum + b.monthlyLimit, 0);
	const budgetUsedPercent =
		totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

	// Recurring Calculation
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

	// Daily Data for Trend
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
		return { day: day.toString(), amount: amount };
	});

	// Category Data for Pie
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

	// Net Worth Calculations
	const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
	const totalLiabilities = activeLoans.reduce(
		(sum, l) => sum + l.remainingPrincipal,
		0,
	);
	const netWorth = totalAssets - totalLiabilities;
	const lastSnapshot = netWorthHistory[0];
	const previousSnapshot = netWorthHistory[1];
	const netWorthChange =
		lastSnapshot && previousSnapshot
			? lastSnapshot.netWorth - previousSnapshot.netWorth
			: 0;
	const netWorthChangePercent =
		previousSnapshot && previousSnapshot.netWorth !== 0
			? (netWorthChange / Math.abs(previousSnapshot.netWorth)) * 100
			: 0;

	// Emergency Fund
	const emergencyFund = assets
		.filter((a) => ["cash", "fd", "rd"].includes(a.type))
		.reduce((sum, a) => sum + a.currentValue, 0);
	const monthlyExpensesEstimate =
		totalLiabilities > 0 ? totalLiabilities * 0.05 : 50000;
	const emergencyFundMonths =
		monthlyExpensesEstimate > 0 ? emergencyFund / monthlyExpensesEstimate : 0;

	return (
		<Tabs defaultValue="spending" className="w-full space-y-6">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-2">
					<div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
						<LayoutDashboard className="h-5 w-5" />
					</div>
					<h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
				</div>

				<TabsList className="bg-slate-100/80 p-1 rounded-xl h-10 border-none">
					<TabsTrigger
						value="spending"
						className="rounded-lg px-4 h-8 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
					>
						Spending
					</TabsTrigger>
					<TabsTrigger
						value="wealth"
						className="rounded-lg px-4 h-8 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-sm transition-all"
					>
						Wealth
					</TabsTrigger>
				</TabsList>
			</div>

			<TabsContent value="spending" className="mt-0 space-y-6 outline-none">
				<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					<div className="modern-card p-5 rounded-2xl lg:col-span-2">
						<div className="flex items-center gap-3 mb-4">
							<div className="h-9 w-9 rounded-xl gradient-purple flex items-center justify-center text-white shadow-sm">
								<TrendingUp className="h-4 w-4" />
							</div>
							<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
								Spent vs Budget
							</span>
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
							{totalSpent > 0 ? (
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
												<stop
													offset="5%"
													stopColor="#6366f1"
													stopOpacity={0.1}
												/>
												<stop
													offset="95%"
													stopColor="#6366f1"
													stopOpacity={0}
												/>
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
											tickFormatter={(v) => `₹${v}`}
										/>
										<Tooltip
											contentStyle={{
												borderRadius: "16px",
												border: "none",
												boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
												fontSize: "12px",
												fontWeight: "bold",
											}}
											formatter={(value: number | string | undefined) => [
												formatCurrency(Number(value) || 0),
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
							{categoryData.length > 0 ? (
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
											{categoryData.map((_entry, index) => (
												<Cell
													key={`cell-${COLORS[index % COLORS.length]}`}
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
											formatter={(value: number | string | undefined) => [
												formatCurrency(Number(value) || 0),
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
						{categoryData.length > 0 && (
							<div className="mt-4 space-y-2 max-h-[120px] overflow-y-auto px-2 scrollbar-hide">
								{categoryData.slice(0, 5).map((entry, index) => (
									<div
										key={entry.name}
										className="flex items-center justify-between text-[11px] font-bold"
									>
										<div className="flex items-center gap-2">
											<div
												className="h-2 w-2 rounded-full"
												style={{
													backgroundColor: COLORS[index % COLORS.length],
												}}
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
			</TabsContent>

			<TabsContent value="wealth" className="mt-0 space-y-6 outline-none">
				<div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden">
					<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
					<div className="relative">
						<div className="flex items-center justify-between mb-4">
							<div className="flex items-center gap-2">
								<Wallet className="h-5 w-5 opacity-80" />
								<span className="text-sm font-bold opacity-80 uppercase tracking-wider">
									Net Worth
								</span>
							</div>
							<Button
								onClick={onRecordSnapshot}
								size="sm"
								className="h-7 px-3 bg-white/20 hover:bg-white/30 text-white rounded-lg text-[10px] font-bold border-none backdrop-blur-md"
							>
								<Camera className="h-3 w-3 mr-1" /> Snapshot
							</Button>
						</div>
						<div className="flex items-end gap-4 mb-6">
							<p className="text-4xl font-black">{formatCurrency(netWorth)}</p>
							{netWorthChange !== 0 && (
								<div
									className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${netWorthChange >= 0 ? "bg-emerald-400/20" : "bg-red-400/20"}`}
								>
									{netWorthChange >= 0 ? (
										<ArrowUpRight className="h-4 w-4" />
									) : (
										<ArrowDownRight className="h-4 w-4" />
									)}
									{netWorthChangePercent.toFixed(1)}%
								</div>
							)}
						</div>
						<div className="grid grid-cols-3 gap-4">
							<div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
								<p className="text-[10px] opacity-70 mb-1">Total Assets</p>
								<p className="text-base font-bold">
									{formatCurrency(totalAssets)}
								</p>
							</div>
							<div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
								<p className="text-[10px] opacity-70 mb-1">Total Liabilities</p>
								<p className="text-base font-bold">
									{formatCurrency(totalLiabilities)}
								</p>
							</div>
							<div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
								<p className="text-[10px] opacity-70 mb-1">Asset/Debt Ratio</p>
								<p className="text-base font-bold">
									{totalLiabilities > 0
										? (totalAssets / totalLiabilities).toFixed(2)
										: "∞"}
									x
								</p>
							</div>
						</div>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="bg-white border border-slate-100 rounded-2xl p-5">
						<div className="flex items-center gap-2 mb-3">
							<div
								className={`h-9 w-9 rounded-xl flex items-center justify-center ${emergencyFundMonths >= 6 ? "bg-emerald-50" : "bg-amber-50"}`}
							>
								<Shield
									className={`h-5 w-5 ${emergencyFundMonths >= 6 ? "text-emerald-500" : "text-amber-500"}`}
								/>
							</div>
							<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
								Emergency Fund
							</span>
						</div>
						<p className="text-2xl font-black text-slate-900">
							{formatCurrency(emergencyFund)}
						</p>
						<div className="mt-2 flex items-center gap-2">
							<div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
								<div
									className={`h-full rounded-full transition-all ${emergencyFundMonths >= 6 ? "bg-emerald-500" : "bg-amber-400"}`}
									style={{
										width: `${Math.min((emergencyFundMonths / 6) * 100, 100)}%`,
									}}
								/>
							</div>
							<span
								className={`text-xs font-bold ${emergencyFundMonths >= 6 ? "text-emerald-500" : "text-amber-500"}`}
							>
								{emergencyFundMonths.toFixed(1)}m
							</span>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-2xl p-5">
						<div className="flex items-center gap-2 mb-3">
							<div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
								<TrendingUp className="h-5 w-5 text-emerald-500" />
							</div>
							<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
								Assets
							</span>
						</div>
						<p className="text-2xl font-black text-slate-900">
							{formatCurrency(totalAssets)}
						</p>
						<p className="text-[10px] text-slate-400 mt-1">
							{assets.length} active holdings
						</p>
					</div>

					<div className="bg-white border border-slate-100 rounded-2xl p-5">
						<div className="flex items-center gap-2 mb-3">
							<div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
								<Building2 className="h-5 w-5 text-red-500" />
							</div>
							<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
								Liabilities
							</span>
						</div>
						<p className="text-2xl font-black text-slate-900">
							{formatCurrency(totalLiabilities)}
						</p>
						<p className="text-[10px] text-slate-400 mt-1">
							{activeLoans.length} active loans
						</p>
					</div>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div className="bg-white border border-slate-100 rounded-2xl p-5">
						<h3 className="text-sm font-bold text-slate-900 mb-4">
							Net Worth Trend
						</h3>
						<div className="h-[250px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart
									data={netWorthHistory
										.slice(0, 12)
										.reverse()
										.map((h) => ({
											date: new Date(h.date).toLocaleDateString("en-US", {
												month: "short",
											}),
											netWorth: h.netWorth,
										}))}
								>
									<defs>
										<linearGradient id="nwGrad" x1="0" y1="0" x2="0" y2="1">
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
										dataKey="date"
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 10, fill: "#94a3b8" }}
									/>
									<YAxis
										axisLine={false}
										tickLine={false}
										tick={{ fontSize: 10, fill: "#94a3b8" }}
										tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`}
									/>
									<Tooltip
										contentStyle={{
											borderRadius: "12px",
											border: "none",
											boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
											fontSize: "12px",
										}}
									/>
									<Area
										type="monotone"
										dataKey="netWorth"
										stroke="#6366f1"
										strokeWidth={3}
										fillOpacity={1}
										fill="url(#nwGrad)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</div>
					</div>

					<div className="bg-white border border-slate-100 rounded-2xl p-5">
						<h3 className="text-sm font-bold text-slate-900 mb-4">
							Financial Health Summary
						</h3>
						<div className="space-y-4">
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
										<TrendingUp className="h-4 w-4 text-emerald-500" />
									</div>
									<span className="text-xs font-bold text-slate-600">
										Growth
									</span>
								</div>
								<span
									className={`text-xs font-black ${netWorthChange >= 0 ? "text-emerald-500" : "text-red-500"}`}
								>
									{netWorthChange >= 0 ? "+" : ""}
									{netWorthChangePercent.toFixed(1)}%
								</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
										<Shield className="h-4 w-4 text-blue-500" />
									</div>
									<span className="text-xs font-bold text-slate-600">
										Assets/Debt
									</span>
								</div>
								<span className="text-xs font-black text-blue-500">
									{totalLiabilities > 0
										? (totalAssets / totalLiabilities).toFixed(1)
										: "Debt Free"}
								</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
										<PiggyBank className="h-4 w-4 text-purple-500" />
									</div>
									<span className="text-xs font-bold text-slate-600">
										Emergency
									</span>
								</div>
								<span
									className={`text-xs font-black ${emergencyFundMonths >= 6 ? "text-emerald-500" : "text-amber-500"}`}
								>
									{emergencyFundMonths.toFixed(1)} months
								</span>
							</div>
							<div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center">
										<Target className="h-4 w-4 text-violet-500" />
									</div>
									<span className="text-xs font-bold text-slate-600">
										Goals
									</span>
								</div>
								<span className="text-xs font-black text-violet-500">
									{goals.filter((g) => g.status === "active").length} Active
								</span>
							</div>
						</div>
					</div>
				</div>
			</TabsContent>
		</Tabs>
	);
}
