import { useState, useEffect, useCallback } from "react";
import { AddAssetDialog } from "./AddAssetDialog";
import { AssetCard } from "./AssetCard";
import type { Asset, Goal } from "@/types";
import { ASSET_TYPES } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
	TrendingUp,
	TrendingDown,
	PieChart,
	Wallet,
	BarChart3,
} from "lucide-react";
import {
	ResponsiveContainer,
	PieChart as RechartsPie,
	Pie,
	Cell,
	Tooltip,
} from "recharts";

const COLORS = [
	"#062163", // Brand Navy
	"#1e40af", // Brand Blue
	"#4338ca", // Indigo
	"#7c3aed", // Violet
	"#059669", // Emerald
	"#0891b2", // Cyan
	"#d97706", // Amber
	"#dc2626", // Red
	"#64748b", // Slate
];

export function Investments() {
	const [assets, setAssets] = useState<Asset[]>([]);
	const [goals, setGoals] = useState<Goal[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<string>("all");

	const loadData = useCallback(async () => {
		try {
			const [loadedAssets, loadedGoals] = await Promise.all([
				window.electron.getAssets(),
				window.electron.getGoals(),
			]);
			setAssets(loadedAssets);
			setGoals(loadedGoals);
		} catch (error) {
			console.error("Error loading assets:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleAddAsset = async (asset: Asset) => {
		try {
			await window.electron.addAsset(asset);
			await loadData();
		} catch (error) {
			console.error("Error adding asset:", error);
		}
	};

	const handleUpdateAsset = async (id: string, updates: Partial<Asset>) => {
		try {
			await window.electron.updateAsset(id, updates);
			await loadData();
		} catch (error) {
			console.error("Error updating asset:", error);
		}
	};

	const handleDeleteAsset = async (id: string) => {
		try {
			await window.electron.deleteAsset(id);
			await loadData();
		} catch (error) {
			console.error("Error deleting asset:", error);
		}
	};

	// Calculate totals
	const totalInvested = assets.reduce((sum, a) => sum + (a.investedAmount || 0), 0);
	const totalCurrentValue = assets.reduce((sum, a) => sum + a.currentValue, 0);
	const totalGain = totalCurrentValue - totalInvested;
	const totalGainPercent =
		totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

	// Group by category
	const assetsByCategory = assets.reduce(
		(acc, asset) => {
			const typeInfo = ASSET_TYPES.find((t) => t.value === asset.type);
			const category = typeInfo?.category || "Other";
			if (!acc[category]) {
				acc[category] = { assets: [], total: 0 };
			}
			acc[category].assets.push(asset);
			acc[category].total += asset.currentValue;
			return acc;
		},
		{} as Record<string, { assets: Asset[]; total: number }>,
	);

	// Pie chart data
	const pieData = Object.entries(assetsByCategory).map(
		([category, data], index) => ({
			name: category,
			value: data.total,
			color: COLORS[index % COLORS.length],
		}),
	);

	// Filter assets
	const filteredAssets =
		selectedCategory === "all"
			? assets
			: assets.filter((a) => {
					const typeInfo = ASSET_TYPES.find((t) => t.value === a.type);
					return typeInfo?.category === selectedCategory;
				});

	const categories = ["all", ...Object.keys(assetsByCategory)];

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062163] mx-auto mb-4"></div>
					<p className="text-slate-400 text-sm">Loading assets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between px-1">
				<div>
					<h2 className="text-xl font-bold text-slate-900 tracking-tight">
						Investments & Assets
					</h2>
					<p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
						Track your portfolio across all asset classes
					</p>
				</div>
				<AddAssetDialog onAddAsset={handleAddAsset} goals={goals} />
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="gradient-brand rounded-2xl p-5 text-white shadow-lg shadow-indigo-100/50">
					<div className="flex items-center gap-2 mb-3">
						<Wallet className="h-5 w-5 opacity-80" />
						<span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
							Total Portfolio
						</span>
					</div>
					<p className="text-2xl font-black">
						{formatCurrency(totalCurrentValue)}
					</p>
					<p className="text-[10px] opacity-70 mt-1 font-bold">{assets.length} ASSETS TRACKED</p>
				</div>

				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
							<BarChart3 className="h-4 w-4" />
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Invested
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{formatCurrency(totalInvested)}
					</p>
					<p className="text-[10px] text-slate-400 mt-1 font-bold">TOTAL COST BASIS</p>
				</div>

				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-2 mb-3">
						<div className={`h-8 w-8 rounded-lg ${totalGain >= 0 ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'} flex items-center justify-center`}>
							{totalGain >= 0 ? (
								<TrendingUp className="h-4 w-4" />
							) : (
								<TrendingDown className="h-4 w-4" />
							)}
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Total Gain/Loss
						</span>
					</div>
					<p
						className={`text-2xl font-black ${totalGain >= 0 ? "text-emerald-600" : "text-rose-600"}`}
					>
						{totalGain >= 0 ? "+" : ""}
						{formatCurrency(Math.abs(totalGain))}
					</p>
					<p
						className={`text-[10px] mt-1 font-bold ${totalGain >= 0 ? "text-emerald-500" : "text-rose-400"}`}
					>
						{totalGainPercent >= 0 ? "+" : ""}
						{totalGainPercent.toFixed(2)}% OVERALL
					</p>
				</div>

				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
							<PieChart className="h-4 w-4" />
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Allocation
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{Object.keys(assetsByCategory).length}
					</p>
					<p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-wider">Asset categories</p>
				</div>
			</div>

			{/* Allocation Chart & Category Filter */}
			{assets.length > 0 && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Pie Chart */}
					<div className="modern-card p-6 rounded-[2rem]">
						<h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider opacity-60">
							Asset Allocation
						</h3>
						<div className="h-[200px]">
							<ResponsiveContainer width="100%" height="100%">
								<RechartsPie>
									<Pie
										data={pieData}
										cx="50%"
										cy="50%"
										innerRadius={50}
										outerRadius={80}
										paddingAngle={3}
										dataKey="value"
									>
										{pieData.map((entry, index) => (
											<Cell key={`cell-${index}`} fill={entry.color} />
										))}
									</Pie>
									<Tooltip
										contentStyle={{
											borderRadius: "16px",
											border: "none",
											boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
											fontSize: "12px",
											fontWeight: "bold"
										}}
										formatter={(value: number) => formatCurrency(value)}
									/>
								</RechartsPie>
							</ResponsiveContainer>
						</div>
						<div className="space-y-2 mt-6">
							{pieData.map((entry) => (
								<div
									key={entry.name}
									className="flex items-center justify-between text-xs font-bold"
								>
									<div className="flex items-center gap-2">
										<div
											className="h-2 w-2 rounded-full"
											style={{ backgroundColor: entry.color }}
										/>
										<span className="text-slate-600 uppercase tracking-wider">
											{entry.name}
										</span>
									</div>
									<span className="text-slate-400">
										{((entry.value / totalCurrentValue) * 100).toFixed(1)}%
									</span>
								</div>
							))}
						</div>
					</div>

					{/* Category Cards */}
					<div className="lg:col-span-2">
						<div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
							{categories.map((category) => (
								<button
									key={category}
									type="button"
									onClick={() => setSelectedCategory(category)}
									className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
										selectedCategory === category
											? "bg-[#062163] text-white border-[#062163] shadow-md"
											: "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
									}`}
								>
									{category === "all"
										? "All Assets"
										: `${category} (${assetsByCategory[category]?.assets.length || 0})`}
								</button>
							))}
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{filteredAssets.map((asset) => (
								<AssetCard
									key={asset.id}
									asset={asset}
									onUpdateAsset={handleUpdateAsset}
									onDeleteAsset={handleDeleteAsset}
									linkedGoal={goals.find((g) => g.id === asset.linkedGoalId)}
								/>
							))}
						</div>

						{filteredAssets.length === 0 && (
							<div className="modern-card py-16 rounded-[2rem] border-dashed text-center">
								<div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-200">
									<Wallet className="h-8 w-8" />
								</div>
								<p className="text-slate-400 text-sm font-bold uppercase tracking-widest">
									No assets in this category
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Empty State */}
			{assets.length === 0 && (
				<div className="modern-card py-24 rounded-[3rem] border-dashed text-center max-w-2xl mx-auto">
					<div className="h-24 w-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
						<Wallet className="h-12 w-12 text-[#062163]/40" />
					</div>
					<h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
						Start Building Your Portfolio
					</h3>
					<p className="text-slate-400 text-sm mb-10 max-w-md mx-auto font-medium leading-relaxed">
						Add your investments across stocks, mutual funds, gold, real estate,
						and more to track your wealth growth.
					</p>
					<AddAssetDialog onAddAsset={handleAddAsset} goals={goals} />
				</div>
			)}
		</div>
	);
}

