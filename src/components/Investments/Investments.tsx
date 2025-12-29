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
	"#10b981",
	"#3b82f6",
	"#f59e0b",
	"#6366f1",
	"#ec4899",
	"#8b5cf6",
	"#14b8a6",
	"#f43f5e",
	"#06b6d4",
	"#84cc16",
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
	const totalInvested = assets.reduce((sum, a) => sum + a.investedAmount, 0);
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
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-4"></div>
					<p className="text-slate-400 text-sm">Loading assets...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<h2 className="text-xl font-bold text-slate-900">
						Investments & Assets
					</h2>
					<p className="text-xs text-slate-400 mt-0.5">
						Track your portfolio across all asset classes
					</p>
				</div>
				<AddAssetDialog onAddAsset={handleAddAsset} goals={goals} />
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-5 text-white">
					<div className="flex items-center gap-2 mb-3">
						<Wallet className="h-5 w-5 opacity-80" />
						<span className="text-xs font-bold opacity-80 uppercase tracking-wider">
							Total Portfolio
						</span>
					</div>
					<p className="text-2xl font-black">
						{formatCurrency(totalCurrentValue)}
					</p>
					<p className="text-xs opacity-70 mt-1">{assets.length} assets</p>
				</div>

				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<BarChart3 className="h-5 w-5 text-slate-400" />
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Invested
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{formatCurrency(totalInvested)}
					</p>
					<p className="text-xs text-slate-400 mt-1">Total cost basis</p>
				</div>

				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						{totalGain >= 0 ? (
							<TrendingUp className="h-5 w-5 text-emerald-500" />
						) : (
							<TrendingDown className="h-5 w-5 text-red-500" />
						)}
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Total Gain/Loss
						</span>
					</div>
					<p
						className={`text-2xl font-black ${totalGain >= 0 ? "text-emerald-600" : "text-red-500"}`}
					>
						{totalGain >= 0 ? "+" : ""}
						{formatCurrency(Math.abs(totalGain))}
					</p>
					<p
						className={`text-xs mt-1 ${totalGain >= 0 ? "text-emerald-500" : "text-red-400"}`}
					>
						{totalGainPercent >= 0 ? "+" : ""}
						{totalGainPercent.toFixed(2)}% overall
					</p>
				</div>

				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<PieChart className="h-5 w-5 text-slate-400" />
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Diversification
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{Object.keys(assetsByCategory).length}
					</p>
					<p className="text-xs text-slate-400 mt-1">Asset categories</p>
				</div>
			</div>

			{/* Allocation Chart & Category Filter */}
			{assets.length > 0 && (
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Pie Chart */}
					<div className="bg-white border border-slate-100 rounded-2xl p-5">
						<h3 className="text-sm font-bold text-slate-900 mb-4">
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
											borderRadius: "12px",
											border: "none",
											boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
											fontSize: "12px",
										}}
										formatter={(value: number) => formatCurrency(value)}
									/>
								</RechartsPie>
							</ResponsiveContainer>
						</div>
						<div className="space-y-2 mt-4">
							{pieData.map((entry, index) => (
								<div
									key={entry.name}
									className="flex items-center justify-between text-xs"
								>
									<div className="flex items-center gap-2">
										<div
											className="h-2.5 w-2.5 rounded-full"
											style={{ backgroundColor: entry.color }}
										/>
										<span className="text-slate-600 font-medium">
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
						<div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
							{categories.map((category) => (
								<button
									key={category}
									type="button"
									onClick={() => setSelectedCategory(category)}
									className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
										selectedCategory === category
											? "bg-emerald-500 text-white"
											: "bg-slate-100 text-slate-600 hover:bg-slate-200"
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
							<div className="text-center py-12">
								<div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
									<Wallet className="h-8 w-8 text-slate-200" />
								</div>
								<p className="text-slate-400 text-sm">
									No assets in this category
								</p>
							</div>
						)}
					</div>
				</div>
			)}

			{/* Empty State */}
			{assets.length === 0 && (
				<div className="text-center py-16">
					<div className="h-20 w-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
						<Wallet className="h-10 w-10 text-emerald-300" />
					</div>
					<h3 className="text-lg font-bold text-slate-900 mb-2">
						Start Building Your Portfolio
					</h3>
					<p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
						Add your investments across stocks, mutual funds, gold, real estate,
						and more to track your wealth growth.
					</p>
					<AddAssetDialog onAddAsset={handleAddAsset} goals={goals} />
				</div>
			)}
		</div>
	);
}

