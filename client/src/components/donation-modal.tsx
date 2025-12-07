import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { useCreateDonation } from "@/hooks/use-donations";
import { Loader2, Heart, CreditCard, Smartphone, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { handleApiError } from "@/lib/error-handler";

const donationSchema = z.object({
  amount: z.number().positive("Сумма должна быть больше 0").min(1, "Минимальная сумма 1 ₽"),
  anonymous: z.boolean().default(false),
  comment: z.string().max(500, "Комментарий не должен превышать 500 символов").optional(),
  paymentMethod: z.string().min(1, "Выберите способ оплаты"),
});

type DonationFormData = z.infer<typeof donationSchema>;

interface DonationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId?: string;
  partnerId?: string;
  campaignTitle?: string;
  category?: string;
  type?: "campaign" | "quick" | "subscription" | "mubarakway";
  defaultAmount?: number;
}

export function DonationModal({
  open,
  onOpenChange,
  campaignId,
  partnerId,
  campaignTitle,
  category = "sadaka",
  type = "campaign",
  defaultAmount,
}: DonationModalProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(defaultAmount || null);
  const createDonation = useCreateDonation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<DonationFormData>({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      anonymous: false,
      paymentMethod: "card",
      amount: defaultAmount || undefined,
    },
  });

  // Update amount when defaultAmount changes
  useEffect(() => {
    if (defaultAmount && defaultAmount > 0) {
      setValue("amount", defaultAmount, { shouldValidate: true });
      setSelectedAmount(defaultAmount);
    }
  }, [defaultAmount, setValue]);

  const paymentMethod = watch("paymentMethod");
  const anonymous = watch("anonymous");

  const quickAmounts = [100, 300, 500, 1000, 2500, 5000];

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setValue("amount", amount, { shouldValidate: true });
  };

  const onSubmit = async (data: DonationFormData) => {
    if (!data.paymentMethod) {
      toast.error("Выберите способ оплаты");
      return;
    }

    createDonation.mutate(
      {
        amount: data.amount,
        currency: "RUB",
        type: type,
        category: category,
        campaignId: campaignId,
        partnerId: partnerId,
        anonymous: data.anonymous,
        comment: data.comment || undefined,
        paymentMethod: data.paymentMethod,
      },
      {
        onSuccess: () => {
          toast.success("Пожертвование успешно создано! Спасибо за вашу помощь.");
          reset();
          setSelectedAmount(null);
          onOpenChange(false);
        },
        onError: (error: any) => {
          handleApiError(error, "Ошибка при создании пожертвования");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
            <Heart className="w-5 h-5 text-primary fill-primary" />
            Пожертвование
          </DialogTitle>
          <DialogDescription>
            {campaignTitle ? `Поддержать: ${campaignTitle}` : "Сделайте пожертвование"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Amount Selection */}
          <div className="space-y-3">
            <Label>Сумма пожертвования (₽) *</Label>
            <div className="grid grid-cols-3 gap-2">
              {quickAmounts.map((amount) => (
                <Button
                  key={amount}
                  type="button"
                  variant={selectedAmount === amount ? "default" : "outline"}
                  className={cn(
                    "h-auto py-3 flex flex-col gap-1",
                    selectedAmount === amount && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleAmountSelect(amount)}
                >
                  <span className="font-bold text-lg">{amount}</span>
                </Button>
              ))}
            </div>
            <Input
              type="number"
              placeholder="Другая сумма"
              className="text-lg"
              min="1"
              step="1"
              {...register("amount", {
                valueAsNumber: true,
                onChange: (e) => {
                  const value = parseFloat(e.target.value);
                  if (!isNaN(value)) {
                    setSelectedAmount(value);
                  }
                },
              })}
            />
            {errors.amount && (
              <p className="text-sm text-destructive">{errors.amount.message}</p>
            )}
          </div>

          <Separator />

          {/* Payment Method */}
          <div className="space-y-3">
            <Label>Способ оплаты *</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setValue("paymentMethod", value)}
              className="space-y-3"
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>Банковская карта</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="sbp" id="sbp" />
                <Label htmlFor="sbp" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Smartphone className="w-4 h-4" />
                  <span>СБП (Система быстрых платежей)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank" className="flex-1 cursor-pointer flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Банковский перевод</span>
                </Label>
              </div>
            </RadioGroup>
            {errors.paymentMethod && (
              <p className="text-sm text-destructive">{errors.paymentMethod.message}</p>
            )}
          </div>

          <Separator />

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Комментарий (необязательно)</Label>
            <Textarea
              id="comment"
              placeholder="Оставьте комментарий к пожертвованию..."
              className="min-h-[80px]"
              maxLength={500}
              {...register("comment")}
            />
            <p className="text-xs text-muted-foreground text-right">
              {watch("comment")?.length || 0}/500
            </p>
          </div>

          {/* Anonymous */}
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
            <div className="space-y-0.5">
              <Label htmlFor="anonymous" className="cursor-pointer">
                Анонимное пожертвование
              </Label>
              <p className="text-xs text-muted-foreground">
                Ваше имя не будет отображаться публично
              </p>
            </div>
            <Switch
              id="anonymous"
              checked={anonymous}
              onCheckedChange={(checked) => setValue("anonymous", checked)}
            />
          </div>

          <Separator />

          {/* Summary */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg space-y-2 border border-emerald-100 dark:border-emerald-900">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Сумма:</span>
              <span className="font-bold text-lg text-emerald-700 dark:text-emerald-400">
                {selectedAmount ? `${selectedAmount.toLocaleString()} ₽` : "0 ₽"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Все пожертвования идут напрямую в фонды-партнеры
            </p>
          </div>

          <DialogFooter className="flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                setSelectedAmount(null);
                onOpenChange(false);
              }}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-[#3E5F43] hover:bg-[#2F4832] text-white"
              disabled={createDonation.isPending || !selectedAmount || !paymentMethod}
              aria-label={createDonation.isPending ? "Обработка пожертвования..." : `Пожертвовать ${selectedAmount ? `${selectedAmount} рублей` : ''}`}
            >
              {createDonation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" aria-hidden="true" />
                  Обработка...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4 mr-2" aria-hidden="true" />
                  Пожертвовать
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

