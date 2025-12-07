import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title = "Ничего не найдено", 
  description = "Попробуйте изменить параметры поиска или фильтры",
  action,
  className 
}: EmptyStateProps) {
  return (
    <Empty className={cn("py-12", className)}>
      {Icon && (
        <EmptyMedia variant="icon">
          <Icon className="w-12 h-12 text-muted-foreground/50" />
        </EmptyMedia>
      )}
      <EmptyHeader>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
      {action && (
        <EmptyContent>
          <Button onClick={action.onClick} variant="outline">
            {action.label}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}

