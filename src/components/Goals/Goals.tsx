import { useState, useEffect, useCallback } from "react";
import { AddGoalDialog } from "./AddGoalDialog";
import { GoalCard } from "./GoalCard";
import type { Goal, Asset } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
	Target,
	TrendingUp,
	CheckCircle,
	Clock,
	Filter,
} from "lucide-react";

export function Goals() {
	const [goals, setGoals] = useState<Goal[]>([]);
	const [assets, setAssets] = useState<Asset[]>([]);
	const [loading, setLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState<string>("all");

	const loadData = useCallback(async () => {
		try {
			const [loadedGoals, loadedAssets] = await Promise.all([
				window.electron.getGoals(),
				window.electron.getAssets(),
			]);
			setGoals(loadedGoals);
			setAssets(loadedAssets);
		} catch (error) {
			console.error("Error loading goals:", error);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadData();
	}, [loadData]);

	const handleAddGoal = async (goal: Goal) => {
		try {
			await window.electron.addGoal(goal);
			await loadData();
		} catch (error) {
			console.error("Error adding goal:", error);
		}
	};

	const handleUpdateGoal = async (id: string, updates: Partial<Goal>) => {
		try {
			await window.electron.updateGoal(id, updates);
			await loadData();
		} catch (error) {
			console.error("Error updating goal:", error);
		}
	};

	const handleDeleteGoal = async (id: string) => {
		try {
			await window.electron.deleteGoal(id);
			await loadData();
		} catch (error) {
			console.error("Error deleting goal:", error);
		}
	};

	// Calculate statistics
	const activeGoals = goals.filter((g) => g.status === "active");
	const completedGoals = goals.filter((g) => g.status === "completed");
	const pausedGoals = goals.filter((g) => g.status === "paused");

	const totalTargetAmount = activeGoals.reduce(
		(sum, g) => sum + g.targetAmount,
		0,
	);
	const totalCurrentAmount = activeGoals.reduce(
		(sum, g) => sum + g.currentAmount,
		0,
	);
	const overallProgress =
		totalTargetAmount > 0 ? (totalCurrentAmount / totalTargetAmount) * 100 : 0;

	// Get linked assets for each goal
	const getLinkedAssets = (goalId: string) =>
		assets.filter((a) => a.linkedGoalId === goalId);

	// Filter goals
	const filteredGoals =
		statusFilter === "all"
			? goals
			: goals.filter((g) => g.status === statusFilter);

	// Sort: active first, then by priority
	const sortedGoals = [...filteredGoals].sort((a, b) => {
		const statusOrder = { active: 0, paused: 1, completed: 2 };
		const priorityOrder = { high: 0, medium: 1, low: 2 };

		if (statusOrder[a.status] !== statusOrder[b.status]) {
			return statusOrder[a.status] - statusOrder[b.status];
		}
		return priorityOrder[a.priority] - priorityOrder[b.priority];
	});

	if (loading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-4"></div>
					<p className="text-slate-400 text-sm">Loading goals...</p>
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
						Financial Goals
					</h2>
					<p className="text-xs text-slate-400 mt-0.5">
						Plan and track your financial milestones
					</p>
				</div>
				<AddGoalDialog onAddGoal={handleAddGoal} />
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-5 text-white">
					<div className="flex items-center gap-2 mb-3">
						<Target className="h-5 w-5 opacity-80" />
						<span className="text-xs font-bold opacity-80 uppercase tracking-wider">
							Overall Progress
						</span>
					</div>
					<p className="text-2xl font-black">{overallProgress.toFixed(0)}%</p>
					<div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
						<div
							className="h-full bg-white rounded-full transition-all"
							style={{ width: `${Math.min(overallProgress, 100)}%` }}
						/>
					</div>
				</div>

				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<TrendingUp className="h-5 w-5 text-emerald-500" />
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Active Goals
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{activeGoals.length}
					</p>
					<p className="text-xs text-slate-400 mt-1">
						{formatCurrency(totalCurrentAmount)} saved
					</p>
				</div>

				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<CheckCircle className="h-5 w-5 text-blue-500" />
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Completed
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{completedGoals.length}
					</p>
					<p className="text-xs text-slate-400 mt-1">Goals achieved</p>
				</div>

				<div className="bg-white border border-slate-100 rounded-2xl p-5">
					<div className="flex items-center gap-2 mb-3">
						<Clock className="h-5 w-5 text-amber-500" />
						<span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
							Target Amount
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{formatCurrency(totalTargetAmount)}
					</p>
					<p className="text-xs text-slate-400 mt-1">
						{formatCurrency(totalTargetAmount - totalCurrentAmount)} to go
					</p>
				</div>
			</div>

			{/* Filter Tabs */}
			<div className="flex items-center gap-2">
				<Filter className="h-4 w-4 text-slate-400" />
				{[
					{ value: "all", label: `All (${goals.length})` },
					{ value: "active", label: `Active (${activeGoals.length})` },
					{ value: "completed", label: `Completed (${completedGoals.length})` },
					{ value: "paused", label: `Paused (${pausedGoals.length})` },
				].map((filter) => (
					<button
						key={filter.value}
						type="button"
						onClick={() => setStatusFilter(filter.value)}
						className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
							statusFilter === filter.value
								? "bg-violet-500 text-white"
								: "bg-slate-100 text-slate-600 hover:bg-slate-200"
						}`}
					>
						{filter.label}
					</button>
				))}
			</div>

			{/* Goals Grid */}
			{sortedGoals.length > 0 ? (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{sortedGoals.map((goal) => (
						<GoalCard
							key={goal.id}
							goal={goal}
							linkedAssets={getLinkedAssets(goal.id)}
							onUpdateGoal={handleUpdateGoal}
							onDeleteGoal={handleDeleteGoal}
						/>
					))}
				</div>
			) : (
				<div className="text-center py-16">
					<div className="h-20 w-20 bg-violet-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
						<Target className="h-10 w-10 text-violet-300" />
					</div>
					<h3 className="text-lg font-bold text-slate-900 mb-2">
						{statusFilter === "all"
							? "Set Your First Financial Goal"
							: `No ${statusFilter} goals`}
					</h3>
					<p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
						{statusFilter === "all"
							? "Create goals for your dream house, car, retirement, or any financial milestone you want to achieve."
							: `You don't have any ${statusFilter} goals at the moment.`}
					</p>
					{statusFilter === "all" && (
						<AddGoalDialog onAddGoal={handleAddGoal} />
					)}
				</div>
			)}

			{/* Tips Section */}
			{goals.length > 0 && activeGoals.length > 0 && (
				<div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-5">
					<h3 className="text-sm font-bold text-violet-900 mb-3">
						💡 Goal Achievement Tips
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
						<div className="bg-white/60 rounded-xl p-3">
							<p className="font-bold text-violet-700 mb-1">
								Link Investments
							</p>
							<p className="text-violet-600/80">
								Connect your assets to goals to track dedicated savings for each
								milestone.
							</p>
						</div>
						<div className="bg-white/60 rounded-xl p-3">
							<p className="font-bold text-violet-700 mb-1">
								Automate Savings
							</p>
							<p className="text-violet-600/80">
								Set up SIPs or recurring deposits aligned with your monthly
								savings targets.
							</p>
						</div>
						<div className="bg-white/60 rounded-xl p-3">
							<p className="font-bold text-violet-700 mb-1">
								Review Regularly
							</p>
							<p className="text-violet-600/80">
								Update your progress monthly to stay on track and adjust targets
								if needed.
							</p>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

