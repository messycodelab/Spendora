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
import type { Asset, AssetType, Goal } from "@/types";
import { ASSET_TYPES } from "@/types";

interface AddAssetDialogProps {
	onAddAsset: (asset: Asset) => void;
	goals: Goal[];
}

export function AddAssetDialog({ onAddAsset, goals }: AddAssetDialogProps) {
	const [open, setOpen] = useState(false);
	const [name, setName] = useState("");
	const [type, setType] = useState<AssetType>("stocks");
	const [investedAmount, setInvestedAmount] = useState("");
	const [currentValue, setCurrentValue] = useState("");
	const [units, setUnits] = useState("");
	const [purchaseDate, setPurchaseDate] = useState(
		new Date().toISOString().slice(0, 10),
	);
	const [notes, setNotes] = useState("");
	const [linkedGoalId, setLinkedGoalId] = useState<string>("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		const asset: Asset = {
			id: `asset-${Date.now()}`,
			name,
			type,
			investedAmount: parseFloat(investedAmount),
			currentValue: parseFloat(currentValue) || parseFloat(investedAmount),
			units: units ? parseFloat(units) : null,
			purchaseDate,
			lastUpdated: new Date().toISOString().slice(0, 10),
			notes: notes || null,
			linkedGoalId: linkedGoalId || null,
		};

		onAddAsset(asset);
		resetForm();
		setOpen(false);
	};

	const resetForm = () => {
		setName("");
		setType("stocks");
		setInvestedAmount("");
		setCurrentValue("");
		setUnits("");
		setPurchaseDate(new Date().toISOString().slice(0, 10));
		setNotes("");
		setLinkedGoalId("");
	};

	// Group asset types by category
	const groupedTypes = ASSET_TYPES.reduce(
		(acc, assetType) => {
			if (!acc[assetType.category]) {
				acc[assetType.category] = [];
			}
			acc[assetType.category].push(assetType);
			return acc;
		},
		{} as Record<string, typeof ASSET_TYPES>,
	);

	const activeGoals = goals.filter((g) => g.status === "active");

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button
					size="sm"
					className="h-8 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
				>
					<Plus className="h-3.5 w-3.5" />
					Add Asset
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="text-lg font-bold">Add New Asset</DialogTitle>
				</DialogHeader>
				<form onSubmit={handleSubmit} className="space-y-4 pt-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="col-span-2">
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Asset Name
							</Label>
							<Input
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder="e.g., HDFC Bank Shares"
								className="mt-1.5"
								required
							/>
						</div>

						<div className="col-span-2">
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Asset Type
							</Label>
							<Select
								value={type}
								onValueChange={(v) => setType(v as AssetType)}
							>
								<SelectTrigger className="mt-1.5">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									{Object.entries(groupedTypes).map(([category, types]) => (
										<div key={category}>
											<div className="px-2 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
												{category}
											</div>
											{types.map((t) => (
												<SelectItem key={t.value} value={t.value}>
													{t.label}
												</SelectItem>
											))}
										</div>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Invested Amount
							</Label>
							<Input
								type="number"
								value={investedAmount}
								onChange={(e) => setInvestedAmount(e.target.value)}
								placeholder="₹0"
								className="mt-1.5"
								required
								min="0"
								step="0.01"
							/>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Current Value
							</Label>
							<Input
								type="number"
								value={currentValue}
								onChange={(e) => setCurrentValue(e.target.value)}
								placeholder="₹0 (optional)"
								className="mt-1.5"
								min="0"
								step="0.01"
							/>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Units (optional)
							</Label>
							<Input
								type="number"
								value={units}
								onChange={(e) => setUnits(e.target.value)}
								placeholder="e.g., 100"
								className="mt-1.5"
								min="0"
								step="0.001"
							/>
						</div>

						<div>
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Purchase Date
							</Label>
							<Input
								type="date"
								value={purchaseDate}
								onChange={(e) => setPurchaseDate(e.target.value)}
								className="mt-1.5"
								required
							/>
						</div>

						{activeGoals.length > 0 && (
							<div className="col-span-2">
								<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
									Link to Goal (optional)
								</Label>
								<Select
									value={linkedGoalId}
									onValueChange={setLinkedGoalId}
								>
									<SelectTrigger className="mt-1.5">
										<SelectValue placeholder="Select a goal..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">No goal linked</SelectItem>
										{activeGoals.map((goal) => (
											<SelectItem key={goal.id} value={goal.id}>
												{goal.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="col-span-2">
							<Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
								Notes (optional)
							</Label>
							<Input
								value={notes}
								onChange={(e) => setNotes(e.target.value)}
								placeholder="Any additional notes..."
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
							className="bg-emerald-500 hover:bg-emerald-600 rounded-xl"
						>
							Add Asset
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

