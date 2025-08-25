import { cn } from "./utils";
import { Badge } from "./badge";

interface StatusChipProps {
  status: "open" | "in-progress" | "on-hold" | "pending-review" | "overdue" | "done";
  className?: string;
}

export function StatusChip({ status, className }: StatusChipProps) {
  const variants = {
    "open": "bg-blue-100 text-blue-800 hover:bg-blue-100",
    "in-progress": "bg-gray-100 text-gray-800 hover:bg-gray-100",
    "on-hold": "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
    "pending-review": "bg-purple-100 text-purple-800 hover:bg-purple-100",
    "overdue": "bg-orange-100 text-orange-800 hover:bg-orange-100",
    "done": "bg-green-100 text-green-800 hover:bg-green-100"
  };

  const labels = {
    "open": "Open",
    "in-progress": "In Progress",
    "on-hold": "On Hold",
    "pending-review": "Pending Review",
    "overdue": "Overdue",
    "done": "Done"
  };

  return (
    <Badge 
      variant="secondary" 
      className={cn(variants[status], className)}
    >
      {labels[status]}
    </Badge>
  );
}