import { Check, CircleDashed, CircleSlash, MinusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ITEM_STATUS_LABELS } from "@/constants";
import { ItemStatus } from "@/types";

const STATUS_CONFIG: Record<ItemStatus, { variant: "muted" | "warning" | "success" | "danger"; icon: typeof Check }> = {
  [ItemStatus.NOT_BOUGHT]: { variant: "muted", icon: CircleDashed },
  [ItemStatus.PARTIAL]: { variant: "warning", icon: MinusCircle },
  [ItemStatus.BOUGHT]: { variant: "success", icon: Check },
  [ItemStatus.NOT_AVAILABLE]: { variant: "danger", icon: CircleSlash },
};

export function StatusBadge({ status }: { status: ItemStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;
  return (
    <Badge variant={config.variant}>
      <Icon className="h-3 w-3" />
      {ITEM_STATUS_LABELS[status]}
    </Badge>
  );
}
