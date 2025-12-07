import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  "aria-label"?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title = "Ничего не найдено", 
  description = "Попробуйте изменить параметры поиска или фильтры",
  action,
  className,
  "aria-label": ariaLabel,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      role="status"
      aria-live="polite"
      aria-label={ariaLabel || title}
    >
      <Empty className={cn("py-12", className)}>
        {Icon && (
          <EmptyMedia variant="icon">
            <Icon 
              className="w-12 h-12 text-muted-foreground/50" 
              aria-hidden="true"
              role="img"
            />
          </EmptyMedia>
        )}
        <EmptyHeader>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {action && (
          <EmptyContent>
            <Button 
              onClick={action.onClick} 
              variant="outline"
              aria-label={action.label}
            >
              {action.label}
            </Button>
          </EmptyContent>
        )}
      </Empty>
    </motion.div>
  );
}

