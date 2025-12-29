import { useState, useEffect, useCallback } from "react";
import type { Asset, Loan, NetWorthHistory, Goal } from "@/types";
import { ASSET_TYPES } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
	TrendingUp,
	TrendingDown,
	Wallet,
	Building2,
	PiggyBank,
	Shield,
	AlertCircle,
	ArrowUpRight,
	ArrowDownRight,
	Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	ResponsiveContainer,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	BarChart,
	Bar,
	Cell,
} from "recharts";

const ASSET_COLORS: Record<string, string> = {
	Market: "#10b981",
	Gold: "#f59e0b",
	Property: "#6366f1",
	"Fixed Income": "#3b82f6",
	Alternative: "#8b5cf6",
	Cash: "#14b8a6",
	Other: "#64748b",
};

const LIABILITY_COLORS: Record<string, string> = {
	home: "#ef4444",
	car: "#f97316",
	personal: "#eab308",
	credit_card: "#f43f5e",
	other: "#94a3b8",
};

export function NetWorth() {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [loans, setLoans] = useState<Loan[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [netWorthHistory, setNetWorthHistory] = useState<NetWorthHistory[]>([]);
	const [loading, setLoading] = useState(true);

	const loadData = useCallback(async () => {
		try {
			const [loadedAssets, loadedLoans, loadedGoals, loadedHistory] =
				await Promise.all([
					window.electron.getAssets(),
					window.electron.getLoans(),
					window.electron.getGoals(),
					window.electron.getNetWorthHistory(),
				]);
			setAssets(loadedAssets);
			setLoans(loadedLoans.filter((l: Loan) => l.isPaidOff === 0));
			setGoals(loadedGoals);
			setNetWorthHistory(loadedHistory);
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleRecordSnapshot = async () => {
		try {
			await window.electron.recordNetWorthSnapshot();
			await loadData();
		} catch (error) {
			console.error("Error recording snapshot:", error);
		}
	};

	// Calculate totals
	const totalAssets = assets.reduce((sum, a) => sum + a.currentValue, 0);
	const totalLiabilities = loans.reduce((sum, l) => sum + l.remainingPrincipal, 0);
	const netWorth = totalAssets - totalLiabilities;

	// Asset vs Debt ratio
	const assetDebtRatio = totalLiabilities > 0 ? totalAssets / totalLiabilities : totalAssets > 0 ? Infinity : 0;

	// Group assets by category
	const assetsByCategory = assets.reduce(
		(acc, asset) => {
			const typeInfo = ASSET_TYPES.find((t) => t.value === asset.type);
			const category = typeInfo?.category || "Other";
			acc[category] = (acc[category] || 0) + asset.currentValue;
			return acc;
		},
		{} as Record<string, number>,
	);

	// Group liabilities by type
	const liabilitiesByType = loans.reduce(
		(acc, loan) => {
			acc[loan.type] = (acc[loan.type] || 0) + loan.remainingPrincipal;
			return acc;
		},
		{} as Record<string, number>,
	);

	// Emergency fund calculation (cash + FD + RD)
	const emergencyFundTypes = ["cash", "fd", "rd"];
	const emergencyFund = assets
		.filter((a) => emergencyFundTypes.includes(a.type))
		.reduce((sum, a) => sum + a.currentValue, 0);

	// Recommended: 6 months of expenses (we'll use a rough estimate)
	const monthlyExpensesEstimate = totalLiabilities > 0 ? totalLiabilities * 0.05 : 50000; // EMI or default
	const emergencyFundMonths = monthlyExpensesEstimate > 0 ? emergencyFund / monthlyExpensesEstimate : 0;
	const emergencyFundHealthy = emergencyFundMonths >= 6;

	// Net worth trend
	const netWorthTrendData = netWorthHistory
		.slice(0, 12)
		.reverse()
		.map((h) => ({
			date: new Date(h.date).toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
			netWorth: h.netWorth,
			assets: h.totalAssets,
			liabilities: h.totalLiabilities,
		}));

	// Calculate change from last snapshot
	const lastSnapshot = netWorthHistory[0];
	const previousSnapshot = netWorthHistory[1];
	const netWorthChange = lastSnapshot && previousSnapshot ? lastSnapshot.netWorth - previousSnapshot.netWorth : 0;
	const netWorthChangePercent = previousSnapshot && previousSnapshot.netWorth !== 0 ? (netWorthChange / Math.abs(previousSnapshot.netWorth)) * 100 : 0;

	// Bar chart data for assets breakdown
	const assetsBarData = Object.entries(assetsByCategory).map(([name, value]) => ({
		name,
		value,
		color: ASSET_COLORS[name] || "#64748b",
	}));

	// Bar chart data for liabilities breakdown
	const liabilitiesBarData = Object.entries(liabilitiesByType).map(([name, value]) => ({
		name: name.replace("_", " ").toUpperCase(),
		value,
		color: LIABILITY_COLORS[name] || "#94a3b8",
	}));

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500 mx-auto mb-4"></div>
					<p className="text-slate-400 text-sm">Loading net worth...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-slate-900">Net Worth & Financial Health</h2>
					<p className="text-xs text-slate-400 mt-0.5">Complete overview of your financial position</p>
				</div>
				<Button onClick={handleRecordSnapshot} size="sm" className="h-8 px-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5">
					<Camera className="h-3.5 w-3.5" />
					Take Snapshot
				</Button>
			</div>

			{/* Main Net Worth Card */}
			<div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-3xl p-6 text-white relative overflow-hidden">
				<div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
				<div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

				<div className="relative">
					<div className="flex items-center gap-2 mb-2">
						<Wallet className="h-5 w-5 opacity-80" />
						<span className="text-sm font-bold opacity-80 uppercase tracking-wider">Net Worth</span>
					</div>

					<div className="flex items-end gap-4 mb-6">
						<p className="text-4xl font-black">{formatCurrency(netWorth)}</p>
						{netWorthChange !== 0 && (
							<div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-sm font-bold ${netWorthChange >= 0 ? "bg-emerald-400/20" : "bg-red-400/20"}`}>
								{netWorthChange >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
								{netWorthChange >= 0 ? "+" : ""}
								{netWorthChangePercent.toFixed(1)}%
							</div>
						)}
					</div>

					<div className="grid grid-cols-3 gap-4">
						<div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
							<p className="text-xs opacity-70 mb-1">Total Assets</p>
							<p className="text-lg font-bold">{formatCurrency(totalAssets)}</p>
						</div>
						<div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
							<p className="text-xs opacity-70 mb-1">Total Liabilities</p>
							<p className="text-lg font-bold">{formatCurrency(totalLiabilities)}</p>
						</div>
						<div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
							<p className="text-xs opacity-70 mb-1">Asset/Debt Ratio</p>
							<p className="text-lg font-bold">
								{assetDebtRatio === Infinity ? "∞" : assetDebtRatio.toFixed(2)}x
							</p>
						</div>
					</div>
				</div>
			</div>

			{/* Health Indicators */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
				{/* Emergency Fund */}
				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<div className={`h-9 w-9 rounded-xl flex items-center justify-center ${emergencyFundHealthy ? "bg-emerald-50" : "bg-amber-50"}`}>
							<Shield className={`h-5 w-5 ${emergencyFundHealthy ? "text-emerald-500" : "text-amber-500"}`} />
						</div>
						<div>
							<span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Emergency Fund</span>
						</div>
					</div>
					<p className="text-2xl font-black text-slate-900">{formatCurrency(emergencyFund)}</p>
					<div className="mt-2 flex items-center gap-2">
						<div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all ${emergencyFundHealthy ? "bg-emerald-500" : "bg-amber-400"}`}
								style={{ width: `${Math.min((emergencyFundMonths / 6) * 100, 100)}%` }}
							/>
						</div>
						<span className={`text-xs font-bold ${emergencyFundHealthy ? "text-emerald-500" : "text-amber-500"}`}>
							{emergencyFundMonths.toFixed(1)} months
						</span>
					</div>
					<p className="text-[10px] text-slate-400 mt-2">
						{emergencyFundHealthy ? "✓ Healthy (6+ months)" : "Build to 6 months of expenses"}
					</p>
				</div>

				{/* Assets Distribution */}
				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center">
							<TrendingUp className="h-5 w-5 text-emerald-500" />
						</div>
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assets</span>
					</div>
					<p className="text-2xl font-black text-slate-900">{formatCurrency(totalAssets)}</p>
					<div className="mt-3 space-y-1.5">
						{Object.entries(assetsByCategory)
							.sort(([, a], [, b]) => b - a)
							.slice(0, 3)
							.map(([category, value]) => (
								<div key={category} className="flex items-center justify-between text-xs">
									<div className="flex items-center gap-1.5">
										<div className="h-2 w-2 rounded-full" style={{ backgroundColor: ASSET_COLORS[category] }} />
										<span className="text-slate-600">{category}</span>
									</div>
									<span className="text-slate-400">{((value / totalAssets) * 100).toFixed(0)}%</span>
								</div>
							))}
					</div>
				</div>

				{/* Liabilities Distribution */}
				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-9 w-9 rounded-xl bg-red-50 flex items-center justify-center">
							<Building2 className="h-5 w-5 text-red-500" />
						</div>
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Liabilities</span>
					</div>
					<p className="text-2xl font-black text-slate-900">{formatCurrency(totalLiabilities)}</p>
					{totalLiabilities > 0 ? (
						<div className="mt-3 space-y-1.5">
							{Object.entries(liabilitiesByType)
								.sort(([, a], [, b]) => b - a)
								.map(([type, value]) => (
									<div key={type} className="flex items-center justify-between text-xs">
										<div className="flex items-center gap-1.5">
											<div className="h-2 w-2 rounded-full" style={{ backgroundColor: LIABILITY_COLORS[type] }} />
											<span className="text-slate-600 capitalize">{type.replace("_", " ")}</span>
										</div>
										<span className="text-slate-400">{formatCurrency(value)}</span>
									</div>
								))}
						</div>
					) : (
						<p className="text-xs text-slate-400 mt-3">🎉 You're debt-free!</p>
					)}
				</div>
			</div>

			{/* Charts Row */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Net Worth Trend */}
				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<h3 className="text-sm font-bold text-slate-900 mb-4">Net Worth Trend</h3>
					{netWorthTrendData.length > 1 ? (
						<div className="h-[250px]">
							<ResponsiveContainer width="100%" height="100%">
								<AreaChart data={netWorthTrendData}>
									<defs>
										<linearGradient id="netWorthGradient" x1="0" y1="0" x2="0" y2="1">
											<stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
											<stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
										</linearGradient>
									</defs>
									<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
									<XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} />
									<YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
									<Tooltip
										contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
										formatter={(value: number) => [formatCurrency(value), "Net Worth"]}
									/>
									<Area type="monotone" dataKey="netWorth" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#netWorthGradient)" />
								</AreaChart>
							</ResponsiveContainer>
						</div>
					) : (
						<div className="h-[250px] flex items-center justify-center">
							<div className="text-center">
								<Camera className="h-8 w-8 text-slate-200 mx-auto mb-2" />
								<p className="text-sm text-slate-400">Take snapshots to track your net worth over time</p>
							</div>
						</div>
					)}
				</div>

				{/* Assets vs Liabilities Bar */}
				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<h3 className="text-sm font-bold text-slate-900 mb-4">Assets vs Liabilities Breakdown</h3>
					<div className="h-[250px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={[
									...assetsBarData.map((d) => ({ ...d, type: "asset" })),
									...liabilitiesBarData.map((d) => ({ ...d, type: "liability" })),
								]}
								layout="vertical"
							>
								<CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
								<XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${(v / 100000).toFixed(0)}L`} />
								<YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#94a3b8" }} width={80} />
								<Tooltip
									contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", fontSize: "12px" }}
									formatter={(value: number) => [formatCurrency(value), "Amount"]}
								/>
								<Bar dataKey="value" radius={[0, 4, 4, 0]}>
									{[...assetsBarData, ...liabilitiesBarData].map((entry, index) => (
										<Cell key={`cell-${index}`} fill={entry.color} />
									))}
								</Bar>
							</BarChart>
						</ResponsiveContainer>
					</div>
				</div>
			</div>

			{/* Financial Health Summary */}
			<div className="bg-slate-50 rounded-2xl p-5">
				<h3 className="text-sm font-bold text-slate-900 mb-4">Financial Health Summary</h3>
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="bg-white rounded-xl p-4">
						<div className="flex items-center gap-2 mb-2">
							{netWorth > 0 ? (
								<div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
								</div>
							) : (
								<div className="h-6 w-6 rounded-full bg-red-100 flex items-center justify-center">
									<TrendingDown className="h-3.5 w-3.5 text-red-500" />
								</div>
							)}
							<span className="text-xs font-bold text-slate-600">Net Worth</span>
						</div>
						<p className={`text-sm font-bold ${netWorth > 0 ? "text-emerald-600" : "text-red-500"}`}>
							{netWorth > 0 ? "Positive ✓" : "Negative"}
						</p>
					</div>

					<div className="bg-white rounded-xl p-4">
						<div className="flex items-center gap-2 mb-2">
							{assetDebtRatio >= 2 ? (
								<div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
									<Shield className="h-3.5 w-3.5 text-emerald-500" />
								</div>
							) : (
								<div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
									<AlertCircle className="h-3.5 w-3.5 text-amber-500" />
								</div>
							)}
							<span className="text-xs font-bold text-slate-600">Asset/Debt</span>
						</div>
						<p className={`text-sm font-bold ${assetDebtRatio >= 2 ? "text-emerald-600" : "text-amber-500"}`}>
							{assetDebtRatio === Infinity ? "Debt Free ✓" : assetDebtRatio >= 2 ? "Healthy ✓" : "Build Assets"}
						</p>
					</div>

					<div className="bg-white rounded-xl p-4">
						<div className="flex items-center gap-2 mb-2">
							{emergencyFundHealthy ? (
								<div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
									<PiggyBank className="h-3.5 w-3.5 text-emerald-500" />
								</div>
							) : (
								<div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
									<PiggyBank className="h-3.5 w-3.5 text-amber-500" />
								</div>
							)}
							<span className="text-xs font-bold text-slate-600">Emergency</span>
						</div>
						<p className={`text-sm font-bold ${emergencyFundHealthy ? "text-emerald-600" : "text-amber-500"}`}>
							{emergencyFundHealthy ? "Covered ✓" : "Build Fund"}
						</p>
					</div>

					<div className="bg-white rounded-xl p-4">
						<div className="flex items-center gap-2 mb-2">
							{Object.keys(assetsByCategory).length >= 3 ? (
								<div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center">
									<TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
								</div>
							) : (
								<div className="h-6 w-6 rounded-full bg-amber-100 flex items-center justify-center">
									<AlertCircle className="h-3.5 w-3.5 text-amber-500" />
								</div>
							)}
							<span className="text-xs font-bold text-slate-600">Diversified</span>
						</div>
						<p className={`text-sm font-bold ${Object.keys(assetsByCategory).length >= 3 ? "text-emerald-600" : "text-amber-500"}`}>
							{Object.keys(assetsByCategory).length >= 3 ? "Good ✓" : "Diversify More"}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}

