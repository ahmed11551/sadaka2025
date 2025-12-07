// Admin Campaigns Page - Moderation interface for admins

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle2, XCircle, Clock, Loader2, Eye } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchApi } from "@/lib/api";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { Layout } from "@/components/layout";
import { useLocation } from "wouter";

export default function AdminCampaignsPage() {
  const [, setLocation] = useLocation();
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const queryClient = useQueryClient();

  // Fetch pending campaigns
  const { data: pendingCampaignsData, isLoading } = useQuery({
    queryKey: ['admin', 'campaigns', 'pending'],
    queryFn: () => fetchApi('/admin/campaigns/pending'),
    retry: false,
    throwOnError: false,
  });

  const pendingCampaigns = pendingCampaignsData?.data?.items || pendingCampaignsData?.data || [];

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: (id: string) =>
      fetchApi(`/admin/campaigns/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Кампания одобрена');
      setSelectedCampaign(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Ошибка при одобрении кампании');
    },
  });

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      fetchApi(`/admin/campaigns/${id}/reject`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'campaigns', 'pending'] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast.success('Кампания отклонена');
      setRejectDialogOpen(false);
      setRejectNote("");
      setSelectedCampaign(null);
    },
    onError: (error: any) => {
      toast.error(error?.message || 'Ошибка при отклонении кампании');
    },
  });

  const handleApprove = (campaign: any) => {
    if (confirm(`Одобрить кампанию "${campaign.title}"?`)) {
      approveMutation.mutate(campaign.id);
    }
  };

  const handleReject = (campaign: any) => {
    setSelectedCampaign(campaign);
    setRejectDialogOpen(true);
  };

  const submitReject = () => {
    if (!rejectNote.trim()) {
      toast.error('Укажите причину отклонения');
      return;
    }
    if (selectedCampaign) {
      rejectMutation.mutate({ id: selectedCampaign.id, note: rejectNote });
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="max-w-4xl mx-auto">
          <header className="mb-6">
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin')}
              className="mb-4"
            >
              ← Назад к админ-панели
            </Button>
            <h1 className="text-2xl font-serif font-bold text-primary">Модерация кампаний</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Проверка и одобрение кампаний перед публикацией
            </p>
          </header>

          {isLoading ? (
            <LoadingState text="Загрузка кампаний на модерацию..." />
          ) : pendingCampaigns.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Нет кампаний на модерацию"
              description="Все кампании обработаны"
            />
          ) : (
            <div className="space-y-4">
              {pendingCampaigns.map((campaign: any) => (
                <Card key={campaign.id} className="shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg">{campaign.title}</CardTitle>
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            На проверке
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {campaign.description}
                        </p>
                      </div>
                      {campaign.image && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 ml-4">
                          <img
                            src={campaign.image}
                            alt={campaign.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Целевая сумма:</span>
                        <span className="font-bold ml-2">{Number(campaign.goal).toLocaleString()} ₽</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Категория:</span>
                        <span className="font-medium ml-2">{campaign.category}</span>
                      </div>
                      {campaign.author && (
                        <div>
                          <span className="text-muted-foreground">Автор:</span>
                          <span className="font-medium ml-2">
                            {campaign.author.fullName || campaign.author.username || 'Неизвестен'}
                          </span>
                        </div>
                      )}
                      {campaign.partner && (
                        <div>
                          <span className="text-muted-foreground">Фонд:</span>
                          <span className="font-medium ml-2">{campaign.partner.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(campaign)}
                        disabled={approveMutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                      >
                        {approveMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Обработка...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Одобрить
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => handleReject(campaign)}
                        disabled={rejectMutation.isPending}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Отклонить
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedCampaign(campaign)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Подробнее
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Reject Dialog */}
        <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Отклонить кампанию</DialogTitle>
              <DialogDescription>
                Укажите причину отклонения кампании "{selectedCampaign?.title}"
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reject-note">Причина отклонения *</Label>
                <Textarea
                  id="reject-note"
                  placeholder="Например: Нарушение правил платформы, недостаточная информация..."
                  className="mt-2"
                  value={rejectNote}
                  onChange={(e) => setRejectNote(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setRejectNote("");
                }}
              >
                Отмена
              </Button>
              <Button
                variant="destructive"
                onClick={submitReject}
                disabled={rejectMutation.isPending || !rejectNote.trim()}
              >
                {rejectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Отклонение...
                  </>
                ) : (
                  'Отклонить'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

