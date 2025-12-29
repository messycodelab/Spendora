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
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#062163] mx-auto mb-4"></div>
					<p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Loading goals...</p>
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
						Financial Goals
					</h2>
					<p className="text-xs text-slate-400 mt-0.5 font-medium uppercase tracking-wider">
						Plan and track your financial milestones
					</p>
				</div>
				<AddGoalDialog onAddGoal={handleAddGoal} />
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
				<div className="gradient-brand rounded-2xl p-5 text-white shadow-lg shadow-indigo-100/50">
					<div className="flex items-center gap-2 mb-3">
						<Target className="h-5 w-5 opacity-80" />
						<span className="text-[10px] font-bold opacity-80 uppercase tracking-widest">
							Overall Progress
						</span>
					</div>
					<p className="text-2xl font-black">{overallProgress.toFixed(0)}%</p>
					<div className="h-2 bg-white/20 rounded-full mt-3 overflow-hidden">
						<div
							className="h-full bg-white rounded-full transition-all duration-1000"
							style={{ width: `${Math.min(overallProgress, 100)}%` }}
						/>
					</div>
				</div>

				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
							<TrendingUp className="h-4 w-4" />
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Active Goals
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{activeGoals.length}
					</p>
					<p className="text-[10px] text-slate-400 mt-1 font-bold">
						{formatCurrency(totalCurrentAmount)} SAVED
					</p>
				</div>

				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
							<CheckCircle className="h-4 w-4" />
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Completed
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{completedGoals.length}
					</p>
					<p className="text-[10px] text-slate-400 mt-1 font-bold uppercase">Goals achieved</p>
				</div>

				<div className="modern-card p-5 rounded-2xl">
					<div className="flex items-center gap-2 mb-3">
						<div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
							<Clock className="h-4 w-4" />
						</div>
						<span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
							Target
						</span>
					</div>
					<p className="text-2xl font-black text-slate-900">
						{formatCurrency(totalTargetAmount)}
					</p>
					<p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-tight">
						{formatCurrency(totalTargetAmount - totalCurrentAmount)} TO GO
					</p>
				</div>
			</div>

			{/* Filter Tabs */}
			<div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
				<Filter className="h-4 w-4 text-slate-400 shrink-0" />
				{[
					{ value: "all", label: `All Goals (${goals.length})` },
					{ value: "active", label: `Active (${activeGoals.length})` },
					{ value: "completed", label: `Completed (${completedGoals.length})` },
					{ value: "paused", label: `Paused (${pausedGoals.length})` },
				].map((filter) => (
					<button
						key={filter.value}
						type="button"
						onClick={() => setStatusFilter(filter.value)}
						className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
							statusFilter === filter.value
								? "bg-[#062163] text-white border-[#062163] shadow-md"
								: "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
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
				<div className="modern-card py-24 rounded-[3rem] border-dashed text-center max-w-2xl mx-auto">
					<div className="h-24 w-24 bg-indigo-50 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8">
						<Target className="h-12 w-12 text-[#062163]/40" />
					</div>
					<h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">
						{statusFilter === "all"
							? "Set Your First Financial Goal"
							: `No ${statusFilter} goals`}
					</h3>
					<p className="text-slate-400 text-sm mb-10 max-w-md mx-auto font-medium leading-relaxed">
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
				<div className="modern-card p-6 rounded-[2rem] bg-slate-50 border-none">
					<h3 className="text-sm font-bold text-[#062163] mb-4 uppercase tracking-widest flex items-center gap-2">
						<span className="h-6 w-6 rounded-lg bg-[#062163]/10 flex items-center justify-center">💡</span>
						Goal Achievement Tips
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="bg-white rounded-2xl p-4 border border-slate-100/50 shadow-sm">
							<p className="text-[10px] font-black text-[#062163] uppercase tracking-widest mb-2">
								Link Investments
							</p>
							<p className="text-xs text-slate-500 font-medium leading-relaxed">
								Connect your assets to goals to track dedicated savings for each
								milestone.
							</p>
						</div>
						<div className="bg-white rounded-2xl p-4 border border-slate-100/50 shadow-sm">
							<p className="text-[10px] font-black text-[#062163] uppercase tracking-widest mb-2">
								Automate Savings
							</p>
							<p className="text-xs text-slate-500 font-medium leading-relaxed">
								Set up SIPs or recurring deposits aligned with your monthly
								savings targets.
							</p>
						</div>
						<div className="bg-white rounded-2xl p-4 border border-slate-100/50 shadow-sm">
							<p className="text-[10px] font-black text-[#062163] uppercase tracking-widest mb-2">
								Review Regularly
							</p>
							<p className="text-xs text-slate-500 font-medium leading-relaxed">
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

