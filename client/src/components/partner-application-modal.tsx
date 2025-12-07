import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Building2 } from "lucide-react";
import { partnerApplicationSchema, type PartnerApplicationFormData } from "@/lib/validators";
import { partnerApi } from "@/lib/api";
import { handleApiError } from "@/lib/error-handler";
import { toast } from "sonner";

interface PartnerApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  "Мечети",
  "Сироты",
  "Образование",
  "Здравоохранение",
  "Экстренная помощь",
  "Водоснабжение",
  "Нужды фонда",
  "Международные проекты",
];

const countries = [
  { value: "ru", label: "Россия" },
  { value: "uz", label: "Узбекистан" },
  { value: "tr", label: "Турция" },
  { value: "kz", label: "Казахстан" },
  { value: "other", label: "Другая" },
];

export function PartnerApplicationModal({
  open,
  onOpenChange,
}: PartnerApplicationModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<PartnerApplicationFormData>({
    resolver: zodResolver(partnerApplicationSchema),
    defaultValues: {
      categories: [],
      description: "",
    },
  });

  const selectedCategories = watch("categories") || [];

  const onSubmit = async (data: PartnerApplicationFormData) => {
    setIsSubmitting(true);
    try {
      await partnerApi.createApplication(data);
      toast.success("Заявка отправлена успешно! Мы свяжемся с вами в ближайшее время.");
      reset();
      onOpenChange(false);
    } catch (error: any) {
      handleApiError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategoryToggle = (category: string, checked: boolean, onChange: (value: string[]) => void) => {
    const current = selectedCategories;
    if (checked) {
      onChange([...current, category]);
    } else {
      onChange(current.filter((c) => c !== category));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-serif font-bold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Заявка на партнерство
          </DialogTitle>
          <DialogDescription>
            Заполните форму для подключения вашего благотворительного фонда к платформе
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Organization Name */}
          <div className="space-y-2">
            <Label htmlFor="orgName">
              Название организации <span className="text-destructive">*</span>
            </Label>
            <Input
              id="orgName"
              placeholder="Название вашего фонда"
              {...register("orgName")}
            />
            {errors.orgName && (
              <p className="text-sm text-destructive">{errors.orgName.message}</p>
            )}
          </div>

          {/* Country */}
          <div className="space-y-2">
            <Label htmlFor="country">
              Страна <span className="text-destructive">*</span>
            </Label>
            <Controller
              name="country"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Выберите страну" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.value} value={country.value}>
                        {country.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.country && (
              <p className="text-sm text-destructive">{errors.country.message}</p>
            )}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <Label htmlFor="website">
              Сайт <span className="text-destructive">*</span>
            </Label>
            <Input
              id="website"
              type="url"
              placeholder="https://example.org"
              {...register("website")}
            />
            {errors.website && (
              <p className="text-sm text-destructive">{errors.website.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              E-mail <span className="text-destructive">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="contact@example.org"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Telegram */}
          <div className="space-y-2">
            <Label htmlFor="telegram">
              Ник в Telegram <span className="text-destructive">*</span>
            </Label>
            <Input
              id="telegram"
              placeholder="@username"
              {...register("telegram")}
            />
            {errors.telegram && (
              <p className="text-sm text-destructive">{errors.telegram.message}</p>
            )}
          </div>

          {/* Categories */}
          <div className="space-y-2">
            <Label>
              Категории помощи <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((category) => (
                <Controller
                  key={category}
                  name="categories"
                  control={control}
                  render={({ field }) => (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category}`}
                        checked={field.value?.includes(category)}
                        onCheckedChange={(checked) =>
                          handleCategoryToggle(category, checked as boolean, field.onChange)
                        }
                      />
                      <Label
                        htmlFor={`category-${category}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {category}
                      </Label>
                    </div>
                  )}
                />
              ))}
            </div>
            {errors.categories && (
              <p className="text-sm text-destructive">{errors.categories.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Описание (опционально)</Label>
            <Textarea
              id="description"
              placeholder="Краткое описание вашего фонда, миссия, основные направления деятельности..."
              rows={4}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Отправка...
                </>
              ) : (
                "Отправить заявку"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

