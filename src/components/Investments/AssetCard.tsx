import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	TrendingUp,
	TrendingDown,
	Minus,
	MoreVertical,
	Pencil,
	Trash2,
	RefreshCw,
	Link2,
} from "lucide-react";
import type { Asset, Goal } from "@/types";
import { ASSET_TYPES } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface AssetCardProps {
	asset: Asset;
	onUpdateAsset: (id: string, updates: Partial<Asset>) => void;
	onDeleteAsset: (id: string) => void;
	linkedGoal?: Goal;
}

export function AssetCard({
	asset,
	onUpdateAsset,
	onDeleteAsset,
	linkedGoal,
}: AssetCardProps) {
	const [showMenu, setShowMenu] = useState(false);
	const [showUpdateDialog, setShowUpdateDialog] = useState(false);
	const [newValue, setNewValue] = useState(asset.currentValue.toString());

	const assetTypeInfo = ASSET_TYPES.find((t) => t.value === asset.type);
	const gain = asset.currentValue - asset.investedAmount;
	const gainPercent =
		asset.investedAmount > 0 ? (gain / asset.investedAmount) * 100 : 0;
	const isProfit = gain > 0;
	const isLoss = gain < 0;

	const getAssetIcon = () => {
		switch (asset.type) {
			case "stocks":
			case "mutual_funds":
			case "etf":
				return "📈";
			case "gold_physical":
			case "gold_digital":
				return "🥇";
			case "real_estate":
			case "land":
				return "🏠";
			case "fd":
			case "rd":
			case "ppf":
			case "epf":
			case "nps":
			case "bonds":
				return "🏦";
			case "esop":
			case "private_equity":
				return "💼";
			case "crypto":
				return "₿";
			case "cash":
				return "💵";
			default:
				return "💎";
		}
	};

	const handleUpdateValue = () => {
		onUpdateAsset(asset.id, { currentValue: parseFloat(newValue) });
		setShowUpdateDialog(false);
	};

	return (
		<div className="bg-white border border-slate-100 rounded-2xl p-4 hover:shadow-md transition-all group">
			<div className="flex items-start justify-between mb-3">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 flex items-center justify-center text-xl">
						{getAssetIcon()}
					</div>
					<div>
						<h3 className="font-bold text-slate-900 text-sm">{asset.name}</h3>
						<p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
							{assetTypeInfo?.label || asset.type}
						</p>
					</div>
				</div>

				<div className="relative">
					<button
						type="button"
						onClick={() => setShowMenu(!showMenu)}
						className="h-7 w-7 rounded-lg hover:bg-slate-100 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
					>
						<MoreVertical className="h-4 w-4 text-slate-400" />
					</button>

					{showMenu && (
						<div className="absolute right-0 top-8 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[140px]">
							<button
								type="button"
								onClick={() => {
									setShowUpdateDialog(true);
									setShowMenu(false);
								}}
								className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
							>
								<RefreshCw className="h-3.5 w-3.5" />
								Update Value
							</button>
							<button
								type="button"
								onClick={() => {
									onDeleteAsset(asset.id);
									setShowMenu(false);
								}}
								className="w-full px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
							>
								<Trash2 className="h-3.5 w-3.5" />
								Delete
							</button>
						</div>
					)}
				</div>
			</div>

			<div className="space-y-2">
				<div className="flex items-end justify-between">
					<div>
						<p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
							Current Value
						</p>
						<p className="text-xl font-black text-slate-900">
							{formatCurrency(asset.currentValue)}
						</p>
					</div>
					<div
						className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
							isProfit
								? "bg-emerald-50 text-emerald-600"
								: isLoss
									? "bg-red-50 text-red-500"
									: "bg-slate-50 text-slate-500"
						}`}
					>
						{isProfit ? (
							<TrendingUp className="h-3 w-3" />
						) : isLoss ? (
							<TrendingDown className="h-3 w-3" />
						) : (
							<Minus className="h-3 w-3" />
						)}
						{gainPercent >= 0 ? "+" : ""}
						{gainPercent.toFixed(1)}%
					</div>
				</div>

				<div className="flex items-center justify-between text-xs">
					<span className="text-slate-400">Invested</span>
					<span className="font-semibold text-slate-600">
						{formatCurrency(asset.investedAmount)}
					</span>
				</div>

				<div className="flex items-center justify-between text-xs">
					<span className="text-slate-400">Gain/Loss</span>
					<span
						className={`font-semibold ${isProfit ? "text-emerald-600" : isLoss ? "text-red-500" : "text-slate-600"}`}
					>
						{gain >= 0 ? "+" : ""}
						{formatCurrency(Math.abs(gain))}
					</span>
				</div>

				{asset.units && (
					<div className="flex items-center justify-between text-xs">
						<span className="text-slate-400">Units</span>
						<span className="font-semibold text-slate-600">{asset.units}</span>
					</div>
				)}

				{linkedGoal && (
					<div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100">
						<Link2 className="h-3 w-3 text-indigo-400" />
						<span className="text-[10px] font-medium text-indigo-500">
							Linked to: {linkedGoal.name}
						</span>
					</div>
				)}

				<p className="text-[10px] text-slate-300 pt-1">
					Last updated: {new Date(asset.lastUpdated).toLocaleDateString()}
				</p>
			</div>

			{/* Update Value Dialog */}
			<Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">
							Update Value
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Current Value
							</Label>
							<Input
								type="number"
								value={newValue}
								onChange={(e) => setNewValue(e.target.value)}
								className="mt-1.5"
								min="0"
								step="0.01"
							/>
						</div>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowUpdateDialog(false)}
								className="rounded-xl"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleUpdateValue}
								className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
							>
								Update
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

