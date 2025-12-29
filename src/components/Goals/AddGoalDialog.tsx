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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import type { Goal, GoalType, GoalPriority } from "@/types";
import { GOAL_TYPES } from "@/types";

interface AddGoalDialogProps {
	onAddGoal: (goal: Goal) => void;
}

export function AddGoalDialog({ onAddGoal }: AddGoalDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [type, setType] = useState<GoalType>("house");
	const [targetAmount, setTargetAmount] = useState("");
	const [currentAmount, setCurrentAmount] = useState("");
	const [targetDate, setTargetDate] = useState("");
	const [priority, setPriority] = useState<GoalPriority>("medium");
	const [notes, setNotes] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const goal: Goal = {
			id: `goal-${Date.now()}`,
			name,
			type,
			targetAmount: parseFloat(targetAmount),
			currentAmount: parseFloat(currentAmount) || 0,
			targetDate,
			priority,
			status: "active",
			notes: notes || null,
		};

		onAddGoal(goal);
		resetForm();
		setOpen(false);
	};

	const resetForm = () => {
		setName("");
		setType("house");
		setTargetAmount("");
		setCurrentAmount("");
		setTargetDate("");
		setPriority("medium");
		setNotes("");
	};

	// Calculate minimum date (today)
	const minDate = new Date().toISOString().slice(0, 10);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					size="sm"
					className="h-8 px-3 bg-violet-500 hover:bg-violet-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Goal
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold">
						Create New Goal
					</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="col-span-2">
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Goal Name
							</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., Dream Home in Mumbai"
								className="mt-1.5"
								required
							/>
						</div>

						<div className="col-span-2">
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Goal Type
							</Label>
							<Select
								value={type}
								onValueChange={(v) => setType(v as GoalType)}
							>
								<SelectTrigger className="mt-1.5">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{GOAL_TYPES.map((goalType) => (
										<SelectItem key={goalType.value} value={goalType.value}>
											<div className="flex items-center gap-2">
												<span>{goalType.icon}</span>
												<span>{goalType.label}</span>
											</div>
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Target Amount
							</Label>
							<Input
								type="number"
								value={targetAmount}
								onChange={(e) => setTargetAmount(e.target.value)}
								placeholder="₹0"
								className="mt-1.5"
								required
								min="0"
								step="1"
							/>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Current Savings
							</Label>
							<Input
								type="number"
								value={currentAmount}
								onChange={(e) => setCurrentAmount(e.target.value)}
								placeholder="₹0 (optional)"
								className="mt-1.5"
								min="0"
								step="1"
							/>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Target Date
							</Label>
							<Input
								type="date"
								value={targetDate}
								onChange={(e) => setTargetDate(e.target.value)}
								className="mt-1.5"
								required
								min={minDate}
							/>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Priority
							</Label>
							<Select
								value={priority}
								onValueChange={(v) => setPriority(v as GoalPriority)}
							>
								<SelectTrigger className="mt-1.5">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="high">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full bg-red-500" />
											High Priority
										</div>
									</SelectItem>
									<SelectItem value="medium">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full bg-amber-500" />
											Medium Priority
										</div>
									</SelectItem>
									<SelectItem value="low">
										<div className="flex items-center gap-2">
											<div className="h-2 w-2 rounded-full bg-slate-400" />
											Low Priority
										</div>
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className="col-span-2">
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Notes (optional)
							</Label>
							<Input
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Any additional details..."
								className="mt-1.5"
							/>
						</div>
					</div>

					<div className="flex justify-end gap-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							className="rounded-xl"
						>
							Cancel
						</Button>
						<Button
							type="submit"
							className="bg-violet-500 hover:bg-violet-600 rounded-xl"
						>
							Create Goal
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

