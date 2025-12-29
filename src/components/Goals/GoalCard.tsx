import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	MoreVertical,
	Trash2,
	PlusCircle,
	Target,
	Calendar,
	TrendingUp,
	Link2,
	CheckCircle,
	PauseCircle,
	PlayCircle,
} from "lucide-react";
import type { Goal, Asset } from "@/types";
import { GOAL_TYPES } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface GoalCardProps {
	goal: Goal;
	linkedAssets: Asset[];
	onUpdateGoal: (id: string, updates: Partial<Goal>) => void;
	onDeleteGoal: (id: string) => void;
}

export function GoalCard({
	goal,
	linkedAssets,
	onUpdateGoal,
	onDeleteGoal,
}: GoalCardProps) {
	const [showMenu, setShowMenu] = useState(false);
	const [showContributeDialog, setShowContributeDialog] = useState(false);
	const [contributeAmount, setContributeAmount] = useState("");

	const goalTypeInfo = GOAL_TYPES.find((t) => t.value === goal.type);
	const progress = (goal.currentAmount / goal.targetAmount) * 100;
	const remaining = goal.targetAmount - goal.currentAmount;

	// Calculate time remaining
	const today = new Date();
	const targetDate = new Date(goal.targetDate);
	const daysRemaining = Math.ceil(
		(targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
	);
	const monthsRemaining = Math.ceil(daysRemaining / 30);

	// Calculate monthly savings needed
	const monthlySavingsNeeded =
		monthsRemaining > 0 ? remaining / monthsRemaining : remaining;

	// Calculate linked assets total
	const linkedAssetsTotal = linkedAssets.reduce(
		(sum, a) => sum + a.currentValue,
		0,
	);

	const priorityColors = {
		high: "bg-red-50 text-red-600 border-red-100",
		medium: "bg-amber-50 text-amber-600 border-amber-100",
		low: "bg-slate-50 text-slate-600 border-slate-100",
	};

	const statusColors = {
		active: "text-emerald-500",
		completed: "text-blue-500",
		paused: "text-slate-400",
	};

	const handleContribute = () => {
		const amount = parseFloat(contributeAmount);
		if (amount > 0) {
			const newAmount = goal.currentAmount + amount;
			const updates: Partial<Goal> = {
				currentAmount: newAmount,
			};
			if (newAmount >= goal.targetAmount) {
				updates.status = "completed";
			}
			onUpdateGoal(goal.id, updates);
			setShowContributeDialog(false);
			setContributeAmount("");
		}
	};

	const toggleStatus = () => {
		if (goal.status === "active") {
			onUpdateGoal(goal.id, { status: "paused" });
		} else if (goal.status === "paused") {
			onUpdateGoal(goal.id, { status: "active" });
		}
	};

	return (
		<div
			className={`bg-white border rounded-2xl p-5 transition-all ${goal.status === "completed" ? "border-blue-200 bg-blue-50/30" : goal.status === "paused" ? "border-slate-200 opacity-60" : "border-slate-100 hover:shadow-md"}`}
		>
			{/* Header */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="h-12 w-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 flex items-center justify-center text-2xl">
						{goalTypeInfo?.icon || "🎯"}
					</div>
					<div>
						<h3 className="font-bold text-slate-900">{goal.name}</h3>
						<div className="flex items-center gap-2 mt-0.5">
							<span
								className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColors[goal.priority]}`}
							>
								{goal.priority.toUpperCase()}
							</span>
							<span className={`text-[10px] font-bold ${statusColors[goal.status]} flex items-center gap-1`}>
								{goal.status === "completed" && <CheckCircle className="h-3 w-3" />}
								{goal.status === "paused" && <PauseCircle className="h-3 w-3" />}
								{goal.status === "active" && <PlayCircle className="h-3 w-3" />}
								{goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
							</span>
						</div>
					</div>
				</div>

				<div className="relative">
					<button
						type="button"
						onClick={() => setShowMenu(!showMenu)}
						className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center"
					>
						<MoreVertical className="h-4 w-4 text-slate-400" />
					</button>

					{showMenu && (
						<div className="absolute right-0 top-9 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-10 min-w-[160px]">
							{goal.status !== "completed" && (
								<>
									<button
										type="button"
										onClick={() => {
											setShowContributeDialog(true);
											setShowMenu(false);
										}}
										className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
									>
										<PlusCircle className="h-3.5 w-3.5" />
										Add Contribution
									</button>
									<button
										type="button"
										onClick={() => {
											toggleStatus();
											setShowMenu(false);
										}}
										className="w-full px-3 py-2 text-left text-xs font-medium text-slate-600 hover:bg-slate-50 flex items-center gap-2"
									>
										{goal.status === "active" ? (
											<>
												<PauseCircle className="h-3.5 w-3.5" />
												Pause Goal
											</>
										) : (
											<>
												<PlayCircle className="h-3.5 w-3.5" />
												Resume Goal
											</>
										)}
									</button>
								</>
							)}
							<button
								type="button"
								onClick={() => {
									onDeleteGoal(goal.id);
									setShowMenu(false);
								}}
								className="w-full px-3 py-2 text-left text-xs font-medium text-red-500 hover:bg-red-50 flex items-center gap-2"
							>
								<Trash2 className="h-3.5 w-3.5" />
								Delete Goal
							</button>
						</div>
					)}
				</div>
			</div>

			{/* Progress */}
			<div className="mb-4">
				<div className="flex items-end justify-between mb-2">
					<div>
						<span className="text-2xl font-black text-slate-900">
							{formatCurrency(goal.currentAmount)}
						</span>
						<span className="text-slate-400 text-sm font-medium ml-2">
							/ {formatCurrency(goal.targetAmount)}
						</span>
					</div>
					<span
						className={`text-sm font-bold ${progress >= 100 ? "text-emerald-500" : progress >= 50 ? "text-blue-500" : "text-slate-500"}`}
					>
						{progress.toFixed(0)}%
					</span>
				</div>

				<div className="relative h-3 w-full bg-slate-100 rounded-full overflow-hidden">
					<div
						className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${
							progress >= 100
								? "bg-gradient-to-r from-emerald-400 to-emerald-500"
								: progress >= 50
									? "bg-gradient-to-r from-blue-400 to-indigo-500"
									: "bg-gradient-to-r from-violet-400 to-purple-500"
						}`}
						style={{ width: `${Math.min(progress, 100)}%` }}
					/>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-2 gap-3 mb-4">
				<div className="bg-slate-50 rounded-xl p-3">
					<div className="flex items-center gap-1.5 mb-1">
						<Target className="h-3.5 w-3.5 text-slate-400" />
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
							Remaining
						</span>
					</div>
					<p className="text-sm font-bold text-slate-900">
						{formatCurrency(remaining > 0 ? remaining : 0)}
					</p>
				</div>

				<div className="bg-slate-50 rounded-xl p-3">
					<div className="flex items-center gap-1.5 mb-1">
						<Calendar className="h-3.5 w-3.5 text-slate-400" />
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
							Time Left
						</span>
					</div>
					<p className="text-sm font-bold text-slate-900">
						{daysRemaining > 0
							? monthsRemaining > 12
								? `${Math.floor(monthsRemaining / 12)}y ${monthsRemaining % 12}m`
								: `${monthsRemaining} months`
							: "Past due"}
					</p>
				</div>
			</div>

			{/* Monthly Savings Needed */}
			{goal.status === "active" && remaining > 0 && monthsRemaining > 0 && (
				<div className="bg-violet-50 rounded-xl p-3 mb-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-1.5">
							<TrendingUp className="h-3.5 w-3.5 text-violet-500" />
							<span className="text-xs font-medium text-violet-600">
								Monthly savings needed
							</span>
						</div>
						<span className="text-sm font-bold text-violet-700">
							{formatCurrency(monthlySavingsNeeded)}
						</span>
					</div>
				</div>
			)}

			{/* Linked Assets */}
			{linkedAssets.length > 0 && (
				<div className="border-t border-slate-100 pt-3">
					<div className="flex items-center gap-1.5 mb-2">
						<Link2 className="h-3.5 w-3.5 text-indigo-400" />
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
							Linked Investments
						</span>
						<span className="text-[10px] font-bold text-indigo-500 ml-auto">
							{formatCurrency(linkedAssetsTotal)}
						</span>
					</div>
					<div className="flex flex-wrap gap-1.5">
						{linkedAssets.slice(0, 3).map((asset) => (
							<span
								key={asset.id}
								className="text-[10px] font-medium px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg"
							>
								{asset.name}
							</span>
						))}
						{linkedAssets.length > 3 && (
							<span className="text-[10px] font-medium px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
								+{linkedAssets.length - 3} more
							</span>
						)}
					</div>
				</div>
			)}

			{/* Contribute Dialog */}
			<Dialog open={showContributeDialog} onOpenChange={setShowContributeDialog}>
				<DialogContent className="max-w-sm">
					<DialogHeader>
						<DialogTitle className="text-lg font-bold">
							Add Contribution
						</DialogTitle>
					</DialogHeader>
					<div className="space-y-4 pt-4">
						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Amount
							</Label>
							<Input
								type="number"
								value={contributeAmount}
								onChange={(e) => setContributeAmount(e.target.value)}
								placeholder="₹0"
								className="mt-1.5"
								min="0"
								step="1"
							/>
						</div>
						<p className="text-xs text-slate-400">
							Current: {formatCurrency(goal.currentAmount)} → New:{" "}
							{formatCurrency(
								goal.currentAmount + (parseFloat(contributeAmount) || 0),
							)}
						</p>
						<div className="flex justify-end gap-2">
							<Button
								type="button"
								variant="outline"
								onClick={() => setShowContributeDialog(false)}
								className="rounded-xl"
							>
								Cancel
							</Button>
							<Button
								type="button"
								onClick={handleContribute}
								className="bg-violet-500 hover:bg-violet-600 rounded-xl"
							>
								Add
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}

