import { useState, useRef, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Clock, ArrowRight, Plus, Info, Upload, Search, Calendar, Check, Filter, Building2, User, FileText, X, Heart as HeartIcon, MessageCircle, MapPin, Loader2, CheckCircle2 } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { useFavorites } from "@/hooks/use-favorites";
import { useCampaigns, useFavoriteCampaigns } from "@/hooks/use-campaigns";
import { useCreateCampaign } from "@/hooks/use-campaigns";
import { useCampaignComments, useCreateComment, useDeleteComment } from "@/hooks/use-comments";
import { DonationModal } from "@/components/donation-modal";
import { useAuth } from "@/hooks/use-auth";
import { campaignFormSchema, commentFormSchema, type CampaignFormData, type CommentFormData } from "@/lib/validators";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { LoadingState } from "@/components/loading-state";
import { usePartners } from "@/hooks/use-partners";
import { useInsanPrograms, useInsanActiveFundraisings, useInsanCompletedFundraisings } from "@/hooks/use-insan-programs";

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "только что";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} мин. назад`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ч. назад`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} дн. назад`;
  
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function CampaignsPage() {
  const [location, setLocation] = useLocation();
  // Parse query params manually since wouter useLocation doesn't give them directly
  // Safely access window.location
  const params = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search)
    : new URLSearchParams();
  const initialTab = params.get("tab") || "funds";
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
  const [hasDeadline, setHasDeadline] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [quickFilter, setQuickFilter] = useState<string | null>(null);
  
  // Restoring missing state
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [documents, setDocuments] = useState<{name: string, desc: string}[]>([]);
  const [docName, setDocName] = useState("");
  const [docDesc, setDocDesc] = useState("");
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedCampaignForDonation, setSelectedCampaignForDonation] = useState<any>(null);
  const [commentFormOpen, setCommentFormOpen] = useState(false);
  
  // Fetch partners for fund selection
  const { data: partnersData, isLoading: partnersLoading } = usePartners({ limit: 100 });
  
  // Fetch Insan programs to add Insan fund to partners list
  const { data: insanProgramsForPartners } = useInsanPrograms();
  
  // Process partners data
  const partners = useMemo(() => {
    const apiPartners: any[] = [];
    if (partnersData?.data) {
    const data = partnersData.data;
    if (Array.isArray(data)) {
        apiPartners.push(...data.filter((p: any) => p && p.id && p.verified));
      } else if (data && typeof data === 'object' && 'items' in data) {
        apiPartners.push(...(Array.isArray(data.items) ? data.items.filter((p: any) => p && p.id && p.verified) : []));
    }
    }
    
    // Add Insan fund if programs are loaded and it's not already in the list
    if (insanProgramsForPartners && insanProgramsForPartners.length > 0) {
      const insanExists = apiPartners.some((p: any) => p.id === 'insan' || p.slug === 'insan');
      if (!insanExists) {
        apiPartners.unshift({
          id: 'insan',
          slug: 'insan',
          name: 'Фонд Инсан',
          nameAr: 'صندوق إنسان',
          description: 'Благотворительный фонд "Инсан" - один из ведущих фондов России, помогающий нуждающимся, сиротам, больным и пострадавшим.',
          country: 'ru',
          city: 'mah',
          verified: true,
          logo: 'https://fondinsan.ru/uploads/cache/Programs/Program16/78e1622e63-2_400x400.jpg',
          website: 'https://fondinsan.ru',
          type: 'Благотворительный фонд',
          categories: ['Закят', 'Садака', 'Помощь нуждающимся'],
          isInsan: true,
        });
      }
    }
    
    return apiPartners;
  }, [partnersData, insanProgramsForPartners]);
  
  // Campaign creation form with react-hook-form
  const campaignForm = useForm<CampaignFormData>({
    resolver: zodResolver(campaignFormSchema),
    defaultValues: {
      title: "",
      description: "",
      fullDescription: "",
      category: "",
      customCategory: "",
      goal: "",
      currency: "RUB",
      partnerId: "",
      deadline: "",
      image: null,
    },
  });

  const [campaignImage, setCampaignImage] = useState<string | null>(null);
  
  // Comment form with react-hook-form
  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const { favorites, toggleFavorite } = useFavorites();
  const { isAuthenticated, user } = useAuth();
  const createCampaignMutation = useCreateCampaign();
  
  // Comments for selected campaign
  const { data: commentsData, isLoading: commentsLoading } = useCampaignComments(
    selectedCampaign?.id || "",
    1,
    20
  );
  const createComment = useCreateComment();
  const deleteComment = useDeleteComment();
  
  // Fetch favorite campaigns
  const { data: favoriteCampaignsData, isLoading: favoriteCampaignsLoading } = useFavoriteCampaigns(1, 50);
  
  const favoriteCampaigns = useMemo(() => {
    if (!favoriteCampaignsData?.data) return [];
    return Array.isArray(favoriteCampaignsData.data) ? favoriteCampaignsData.data : favoriteCampaignsData.data.items || [];
  }, [favoriteCampaignsData]);

  // Fetch campaigns based on active tab
  const { data: fundCampaignsData, isLoading: fundCampaignsLoading } = useCampaigns({
    type: 'fund',
    status: 'active',
    search: searchQuery || undefined,
    ...(quickFilter === 'urgent' && { urgent: true }),
    limit: 50
  });
  
  // Fetch Insan active fundraisings (for campaigns display)
  const { data: insanActiveFundraisings, isLoading: insanFundraisingsLoading } = useInsanActiveFundraisings();
  
  // Fetch Insan completed fundraisings (for archive)
  const { data: insanCompletedFundraisings, isLoading: insanCompletedFundraisingsLoading } = useInsanCompletedFundraisings();

  const { data: privateCampaignsData, isLoading: privateCampaignsLoading } = useCampaigns({
    type: 'private',
    status: 'active',
    search: searchQuery || undefined,
    ...(quickFilter === 'urgent' && { urgent: true }),
    limit: 50
  });

  const { data: completedCampaignsData, isLoading: completedCampaignsLoading } = useCampaigns({
    status: 'completed',
    limit: 50
  });

  // Process campaigns data
  const fundCampaigns = useMemo(() => {
    const apiCampaigns = fundCampaignsData?.data 
      ? (Array.isArray(fundCampaignsData.data) ? fundCampaignsData.data : fundCampaignsData.data.items || [])
      : [];
    
    // Convert Insan active fundraisings to campaign format
    const insanCampaigns = (insanActiveFundraisings || []).map((fundraising: any) => {
      // Parse collection_closing_date - может быть строкой или null
      let deadline: string | null = null;
      if (fundraising.collection_closing_date) {
        // Если это строка, используем как есть
        deadline = typeof fundraising.collection_closing_date === 'string' 
          ? fundraising.collection_closing_date 
          : null;
      }
      
      return {
        id: `insan-${fundraising.id}`,
        title: fundraising.title || 'Без названия',
        description: fundraising.short || '',
        fullDescription: fundraising.description || '',
        image: fundraising.preview || fundraising.og_image || '/placeholder-campaign.jpg',
        category: fundraising.category_name || 'Фонд Инсан',
        type: 'fund',
        status: 'active',
        goal: Number(fundraising.end_money) || 0,
        collected: Number(fundraising.collect_money) || 0,
        currency: 'RUB',
        partner: {
          id: 'insan',
          name: 'Фонд Инсан',
          verified: true
        },
        url: fundraising.url,
        insanFundraisingId: fundraising.id,
        isInsanFundraising: true,
        // Поля для отображения в карточках
        participantCount: Number(fundraising.number_of_people_helping) || 0,
        urgent: fundraising.in_priority === 1, // 1 = срочно
        deadline: deadline,
        city: fundraising.city || '',
        defaultAmount: Number(fundraising.default_amount) || 100,
      };
    });

    // Combine API campaigns and Insan programs
    const allCampaigns = [...apiCampaigns, ...insanCampaigns];
    
    return allCampaigns.filter((c: any) => {
      if (!c || !c.id) return false;
      const matchesSearch = !searchQuery || (c.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || (c.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesFilters = selectedFilters.length === 0 || selectedFilters.includes(c.category) || (c.urgent && selectedFilters.includes("Срочные"));
      
      let matchesQuickFilter = true;
      if (quickFilter === "urgent") matchesQuickFilter = c.urgent;
      if (quickFilter === "almost_done") {
        const collected = Number(c.collected || 0);
        const goal = Number(c.goal || 1);
        matchesQuickFilter = (collected / goal) >= 0.8;
      }
      
      return matchesSearch && matchesFilters && matchesQuickFilter;
    });
  }, [fundCampaignsData, insanActiveFundraisings, searchQuery, selectedFilters, quickFilter]);

  const privateCampaigns = useMemo(() => {
    if (!privateCampaignsData?.data) return [];
    const items = Array.isArray(privateCampaignsData.data) ? privateCampaignsData.data : privateCampaignsData.data.items || [];
    return items.filter((c: any) => {
      if (!c || !c.id) return false;
      const matchesSearch = !searchQuery || (c.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || (c.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
      const matchesFilters = selectedFilters.length === 0 || selectedFilters.includes(c.category) || (c.urgent && selectedFilters.includes("Срочные"));
      
      let matchesQuickFilter = true;
      if (quickFilter === "urgent") matchesQuickFilter = c.urgent;
      if (quickFilter === "almost_done") {
        const collected = Number(c.collected || 0);
        const goal = Number(c.goal || 1);
        matchesQuickFilter = (collected / goal) >= 0.8;
      }
      
      return matchesSearch && matchesFilters && matchesQuickFilter;
    });
  }, [privateCampaignsData, searchQuery, selectedFilters, quickFilter]);

  const completedCampaigns = useMemo(() => {
    const apiCompleted = completedCampaignsData?.data 
      ? (Array.isArray(completedCampaignsData.data) ? completedCampaignsData.data : completedCampaignsData.data.items || [])
      : [];
    
    // Convert Insan completed fundraisings to campaign format
    const insanCompleted = (insanCompletedFundraisings || []).map((fundraising: any) => {
      return {
        id: `insan-${fundraising.id}`,
        title: fundraising.title || 'Без названия',
        description: fundraising.short || '',
        fullDescription: fundraising.description || '',
        image: fundraising.preview || fundraising.og_image || '/placeholder-campaign.jpg',
        category: fundraising.category_name || 'Фонд Инсан',
        type: 'fund',
        status: 'completed',
        goal: Number(fundraising.end_money) || 0,
        collected: Number(fundraising.collect_money) || 0,
        currency: 'RUB',
        partner: {
          id: 'insan',
          name: 'Фонд Инсан',
          verified: true
        },
        url: fundraising.url,
        insanFundraisingId: fundraising.id,
        isInsanFundraising: true,
        participantCount: Number(fundraising.number_of_people_helping) || 0,
        urgent: false, // Завершенные не могут быть срочными
        completedAt: fundraising.created || null,
        city: fundraising.city || '',
        defaultAmount: Number(fundraising.default_amount) || 100,
      };
    });
    
    // Combine API completed campaigns and Insan completed fundraisings
    return [...apiCompleted, ...insanCompleted];
  }, [completedCampaignsData, insanCompletedFundraisings]);

  const toggleQuickFilter = (filter: string) => {
    setQuickFilter(prev => prev === filter ? null : filter);
  };

  const toggleFilter = (filter: string) => {
    setSelectedFilters(prev => 
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Search suggestions can be implemented later with API
    if (query.length > 1) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите изображение');
        return;
      }
      
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Размер файла не должен превышать 5MB');
        return;
      }

      setSelectedFile(file.name);
      
      // Upload image
      try {
        const { uploadApi } = await import('@/lib/api');
        const result = await uploadApi.uploadImage(file);
        setCampaignImage(result.url);
        toast.success('Изображение загружено');
      } catch (error: any) {
        toast.error(error.message || 'Ошибка при загрузке изображения');
        setSelectedFile(null);
      }
    }
  };

  const addDocument = () => {
    if (docName) {
      setDocuments([...documents, { name: docName, desc: docDesc }]);
      setDocName("");
      setDocDesc("");
    }
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  const navigateToPartners = () => {
    // We don't navigate away anymore to preserve state, instead we show a list or keep it simple
    // If user insists on link, we can open in new tab? But requirement says "return back".
    // Best approach: Just open partners in a new tab or show a nested dialog.
    window.open("/partners", "_blank");
  };

  const openDetails = (campaign: any) => {
    setSelectedCampaign(campaign);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-4 space-y-6 pt-6 pb-24">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-primary">Целевые сборы</h1>
          <p className="text-sm text-muted-foreground">Присоединяйтесь к благим делам</p>
        </div>
        <Link href="/profile">
          <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center text-foreground hover:bg-secondary transition-colors cursor-pointer">
            <User className="w-5 h-5" />
          </div>
        </Link>
      </header>

      {/* Search & Filter */}
      <div className="flex gap-2 relative z-20">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Найти проект..." 
            className="pl-9 bg-white border-none shadow-sm" 
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchQuery.length > 1 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-50">
              {searchSuggestions.map((suggestion, index) => (
                <div 
                  key={index}
                  className="px-4 py-2 text-sm hover:bg-slate-50 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => selectSuggestion(suggestion)}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
        <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" size="icon" className="bg-white border-none shadow-sm shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85vh]">
            <DrawerHeader>
              <DrawerTitle>Фильтры</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 space-y-6 overflow-y-auto">
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Категория</h4>
                <div className="flex flex-wrap gap-2">
                  {["Мечети", "Колодцы", "Сироты", "Образование", "Продукты", "Лечение"].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedFilters.includes(tag) ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer font-normal text-sm py-1.5 px-3 rounded-lg transition-colors",
                        selectedFilters.includes(tag) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-secondary/50 hover:bg-secondary"
                      )}
                      onClick={() => toggleFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Срочность</h4>
                <div className="flex flex-wrap gap-2">
                  {["Все", "Срочные", "Заканчиваются", "Новые", "Осталось собрать немного"].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedFilters.includes(tag) ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer font-normal text-sm py-1.5 px-3 rounded-lg transition-colors",
                        selectedFilters.includes(tag) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-secondary/50 hover:bg-secondary"
                      )}
                      onClick={() => toggleFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Время публикации</h4>
                <div className="flex flex-wrap gap-2">
                  {["За неделю", "В этом месяце", "Более месяца", "Более 3 месяцев"].map((tag) => (
                    <Badge 
                      key={tag} 
                      variant={selectedFilters.includes(tag) ? "default" : "secondary"}
                      className={cn(
                        "cursor-pointer font-normal text-sm py-1.5 px-3 rounded-lg transition-colors",
                        selectedFilters.includes(tag) 
                          ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                          : "bg-secondary/50 hover:bg-secondary"
                      )}
                      onClick={() => toggleFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Город</h4>
                 <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Выберите город" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="msk">Москва</SelectItem>
                    <SelectItem value="kazan">Казань</SelectItem>
                    <SelectItem value="grozny">Грозный</SelectItem>
                    <SelectItem value="mah">Махачкала</SelectItem>
                    <SelectItem value="other">Другой</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DrawerFooter>
              <Button onClick={() => setIsFilterOpen(false)} className="w-full h-12 text-lg">Сохранить</Button>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full" onClick={() => setSelectedFilters([])}>Сбросить</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* Dynamic Quick Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mt-2 no-scrollbar">
         <Badge 
            variant={quickFilter === "urgent" ? "destructive" : "outline"} 
            className={cn(
              "cursor-pointer whitespace-nowrap border-red-200 text-red-700 hover:bg-red-50",
              quickFilter === "urgent" && "bg-red-600 text-white hover:bg-red-700 border-transparent"
            )}
            onClick={() => toggleQuickFilter("urgent")}
          >
            🔥 Срочные
          </Badge>
          <Badge 
            variant={quickFilter === "almost_done" ? "default" : "outline"} 
            className={cn(
              "cursor-pointer whitespace-nowrap border-emerald-200 text-emerald-700 hover:bg-emerald-50",
              quickFilter === "almost_done" && "bg-emerald-600 text-white hover:bg-emerald-700 border-transparent"
            )}
            onClick={() => toggleQuickFilter("almost_done")}
          >
            ⏳ Осталось немного
          </Badge>
          <Badge 
            variant={quickFilter === "new" ? "default" : "outline"} 
            className={cn(
              "cursor-pointer whitespace-nowrap border-blue-200 text-blue-700 hover:bg-blue-50",
              quickFilter === "new" && "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
            )}
            onClick={() => toggleQuickFilter("new")}
          >
            ✨ Новые
          </Badge>
      </div>

      {/* Dynamic Tabs */}
      <Tabs defaultValue={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="w-full">
             <TabsList className="grid grid-cols-4 w-full bg-muted/30 p-1 rounded-xl h-auto">
               <TabsTrigger value="funds" className="flex flex-col items-center gap-1 py-2 text-[10px] sm:text-xs">
                 <Building2 className="w-4 h-4" />
                 <span>Проекты фондов</span>
               </TabsTrigger>
               <TabsTrigger value="private" className="flex flex-col items-center gap-1 py-2 text-[10px] sm:text-xs">
                 <User className="w-4 h-4" />
                 <span>Частные</span>
               </TabsTrigger>
               <TabsTrigger value="completed" className="flex flex-col items-center gap-1 py-2 text-[10px] sm:text-xs">
                 <Check className="w-4 h-4" />
                 <span>Архив</span>
               </TabsTrigger>
               <TabsTrigger value="favorites" className="flex flex-col items-center gap-1 py-2 text-[10px] sm:text-xs">
                 <HeartIcon className="w-4 h-4" />
                 <span>Избранное</span>
               </TabsTrigger>
             </TabsList>
          </div>
        </div>

        <TabsContent value="funds" className="space-y-4 mt-0">
          {(fundCampaignsLoading || insanFundraisingsLoading) ? (
            <LoadingState text="Загрузка кампаний фондов..." />
          ) : fundCampaigns.length > 0 ? (
            <>
              {fundCampaigns.map((campaign: any) => {
                if (!campaign || !campaign.id) return null;
                const collected = Number(campaign.collected || 0);
                const goal = Number(campaign.goal || 1);
                const progress = (collected / goal) * 100;
                const daysLeft = campaign.deadline 
                  ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                
            return (
              <Card 
                    key={campaign.id || Math.random()} 
                className="overflow-hidden border-none shadow-md group cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => openDetails(campaign)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                        src={campaign.image || '/placeholder-campaign.jpg'} 
                        alt={campaign.title || 'Кампания'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Иконки избранного и комментариев вверху справа */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 z-20">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className={cn(
                        "h-8 w-8 rounded-full bg-white/90 shadow-sm transition-colors", 
                        favorites.includes(campaign.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                      )}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                            if (campaign.id) toggleFavorite(campaign.id);
                      }}
                    >
                      <HeartIcon className={cn("w-4 h-4", favorites.includes(campaign.id) && "fill-current")} />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 text-muted-foreground hover:text-primary shadow-sm" onClick={(e) => { e.stopPropagation(); }}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Badges: Срочно и категория вверху справа */}
                  <div className="absolute top-2 right-2 flex gap-2 z-10">
                    {campaign.urgent && (
                      <Badge variant="destructive" className="bg-red-500 text-white shadow-sm animate-pulse">
                        Срочно
                      </Badge>
                    )}
                        {campaign.category && (
                    <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
                      {campaign.category}
                    </Badge>
                        )}
                  </div>
                  
                  {/* Название фонда в белом прямоугольнике с красной рамкой внизу слева */}
                  {campaign.partner && campaign.partner.id && campaign.partner.name && (
                    <div className="absolute bottom-2 left-2 z-10 max-w-[calc(100%-5rem)]">
                      <Link href={`/partners/${campaign.partner.id}`} onClick={(e) => e.stopPropagation()}>
                        <div className="bg-white border-2 border-red-500 rounded px-2 py-1 shadow-md hover:bg-red-50 transition-colors max-w-full">
                          <p className="text-xs font-semibold text-foreground cursor-pointer truncate whitespace-nowrap">{campaign.partner.name}</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{campaign.title || 'Без названия'}</h3>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.participantCount || 0}</span>
                          {daysLeft !== null && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} дн.` : 'Завершено'}</span>
                          )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                          <span className="text-primary">{collected.toLocaleString()} ₽</span>
                          <span className="text-muted-foreground">{goal.toLocaleString()} ₽</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-primary/10" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full font-medium shadow-sm bg-[#3E5F43] hover:bg-[#2F4832] text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaignForDonation(campaign);
                          setDonationModalOpen(true);
                        }}
                      >
                    Помочь сейчас
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          <div className="pt-4 pb-2">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5">
              Показать еще
            </Button>
          </div>
            </>
          ) : (
            <EmptyState
              icon={Building2}
              title="Нет кампаний фондов"
              description="Кампании фондов скоро появятся. Следите за обновлениями!"
              action={{
                label: "Обновить",
                onClick: () => {
                  // Refresh campaigns data without full page reload
                  window.location.reload();
                }
              }}
            />
          )}
        </TabsContent>

        <TabsContent value="private" className="space-y-4 mt-0">
          {/* Create Campaign Button */}
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) {
              // Reset form when dialog closes
              campaignForm.reset();
              setCampaignImage(null);
              setSelectedFile(null);
              setDocuments([]);
              setHasDeadline(false);
            }
          }}>
            <DialogTrigger asChild>
              <Card className="border-dashed border-2 border-muted-foreground/20 bg-muted/30 shadow-none cursor-pointer hover:bg-muted/50 transition-colors mb-4">
                <CardContent className="p-6 flex flex-col items-center text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center border shadow-sm">
                    <Plus className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground">Создать кампанию</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Начните свою собственную кампанию по сбору средств для поддержки важного дела
                    </p>
                  </div>
                  <Button variant="outline" className="w-full pointer-events-none">Создать кампанию</Button>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-serif text-xl">Создать кампанию</DialogTitle>
                <DialogDescription>
                  Начните свою собственную кампанию по сбору средств для поддержки важного дела
                </DialogDescription>
              </DialogHeader>
              
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900 flex gap-3">
                <Info className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-800 dark:text-emerald-300 space-y-2">
                  <p className="font-medium">Важная информация</p>
                  <p className="opacity-90 leading-relaxed">
                    Платформа MubarakWay предоставляет пользователям техническую возможность создавать кампании по сбору средств в пользу зарегистрированных фондов партнеров. Все переводы совершаются напрямую на реквизиты фонда.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs h-7 bg-transparent border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                    onClick={navigateToPartners}
                  >
                    Посмотреть фонды-партнёры
                  </Button>
                </div>
              </div>

              <form onSubmit={campaignForm.handleSubmit(async (data) => {
                const finalCategory = data.category === "other" ? data.customCategory : data.category;
                if (!finalCategory) {
                  toast.error("Укажите категорию");
                  return;
                }
                
                createCampaignMutation.mutate({
                  title: data.title.trim(),
                  description: data.description.trim(),
                  fullDescription: data.fullDescription?.trim() || undefined,
                  category: finalCategory,
                  goal: parseFloat(data.goal),
                  currency: data.currency,
                  type: "private",
                  partnerId: data.partnerId,
                  deadline: data.deadline ? new Date(data.deadline).toISOString() : undefined,
                  image: campaignImage || undefined,
                  urgent: false,
                }, {
                  onSuccess: () => {
                    campaignForm.reset();
                    setCampaignImage(null);
                    setSelectedFile(null);
                    setDocuments([]);
                    setHasDeadline(false);
                    setIsDialogOpen(false);
                  },
                });
              })}>
              <div className="space-y-6 py-2">
                <div className="space-y-4">
                  <h3 className="font-bold text-base">Основная информация</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Название кампании *</Label>
                    <Controller
                      name="title"
                      control={campaignForm.control}
                      render={({ field }) => (
                        <Input 
                          id="title" 
                          placeholder="Например: Помощь в строительстве школы"
                          {...field}
                          className={cn(campaignForm.formState.errors.title && "border-destructive")}
                        />
                      )}
                    />
                    {campaignForm.formState.errors.title && (
                      <p className="text-sm text-destructive">{campaignForm.formState.errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="desc">Краткое описание *</Label>
                    <Controller
                      name="description"
                      control={campaignForm.control}
                      render={({ field }) => (
                        <Textarea 
                          id="desc" 
                          placeholder="Краткое резюме вашей кампании (1-2 предложения)" 
                          maxLength={200}
                          {...field}
                          className={cn(campaignForm.formState.errors.description && "border-destructive")}
                        />
                      )}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-right text-muted-foreground">
                        {campaignForm.watch("description")?.length || 0}/200
                      </p>
                      {campaignForm.formState.errors.description && (
                        <p className="text-sm text-destructive">{campaignForm.formState.errors.description.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Категория *</Label>
                    <Controller
                      name="category"
                      control={campaignForm.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn(campaignForm.formState.errors.category && "border-destructive")}>
                        <SelectValue placeholder="Выберите категорию" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mosque">Мечеть</SelectItem>
                        <SelectItem value="orphans">Помощь сиротам</SelectItem>
                        <SelectItem value="education">Образование</SelectItem>
                        <SelectItem value="water">Колодцы</SelectItem>
                        <SelectItem value="other">Другое (указать)</SelectItem>
                      </SelectContent>
                    </Select>
                      )}
                    />
                    {campaignForm.watch("category") === "other" && (
                      <Controller
                        name="customCategory"
                        control={campaignForm.control}
                        render={({ field }) => (
                      <Input 
                        placeholder="Введите название категории" 
                            className={cn("mt-2", campaignForm.formState.errors.customCategory && "border-destructive")}
                            {...field}
                          />
                        )}
                      />
                    )}
                    {campaignForm.formState.errors.category && (
                      <p className="text-sm text-destructive">{campaignForm.formState.errors.category.message}</p>
                    )}
                    {campaignForm.formState.errors.customCategory && (
                      <p className="text-sm text-destructive">{campaignForm.formState.errors.customCategory.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-base">Выбор фонда-партнёра *</h3>
                  <p className="text-xs text-muted-foreground">
                    Выберите фонд, в пользу которого будет проводиться сбор средств.
                  </p>
                  
                  <div className="space-y-2">
                    <Label>Фонд-партнёр *</Label>
                    <Controller
                      name="partnerId"
                      control={campaignForm.control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn(
                            "h-12 text-base",
                            campaignForm.formState.errors.partnerId && "border-destructive",
                            !partnersLoading && partners.length === 0 && "border-amber-300"
                          )}>
                            <SelectValue placeholder={partnersLoading ? "Загрузка фондов..." : "Выберите фонд из списка партнёров"} />
                      </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {partnersLoading ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                                Загрузка...
                              </div>
                            ) : partners.length === 0 ? (
                              <div className="p-4 text-center text-sm text-muted-foreground">
                                Фонды-партнёры не найдены
                              </div>
                            ) : (
                              partners.map((partner: any) => (
                                <SelectItem 
                                  key={partner.id} 
                                  value={partner.id}
                                  className="py-3 cursor-pointer hover:bg-muted/50"
                                >
                                  <div className="flex items-center gap-3 w-full">
                                    {partner.logo ? (
                                      <img 
                                        src={partner.logo} 
                                        alt={partner.name}
                                        className="w-8 h-8 rounded-lg object-cover shrink-0"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                                        <Building2 className="w-4 h-4 text-muted-foreground" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium truncate">{partner.name || 'Без названия'}</span>
                                        {partner.verified && (
                                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                                        )}
                                      </div>
                                      {partner.country && (
                                        <span className="text-xs text-muted-foreground block truncate">
                                          {partner.country === 'ru' ? 'Россия' : partner.country === 'uz' ? 'Узбекистан' : partner.country === 'tr' ? 'Турция' : partner.country}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </SelectItem>
                              ))
                            )}
                      </SelectContent>
                    </Select>
                      )}
                    />
                    {campaignForm.formState.errors.partnerId && (
                      <p className="text-sm text-destructive">{campaignForm.formState.errors.partnerId.message}</p>
                    )}
                    <p className="text-xs text-emerald-600 cursor-pointer hover:underline" onClick={navigateToPartners}>
                      Не нашли нужный фонд? Посмотрите все фонды-партнёры
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-base">Цель сбора *</h3>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-2">
                      <Label>Целевая сумма *</Label>
                      <Controller
                        name="goal"
                        control={campaignForm.control}
                        render={({ field }) => (
                          <Input 
                            type="text" 
                            placeholder="10000"
                            {...field}
                            className={cn(campaignForm.formState.errors.goal && "border-destructive")}
                          />
                        )}
                      />
                      {campaignForm.formState.errors.goal && (
                        <p className="text-sm text-destructive">{campaignForm.formState.errors.goal.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Валюта</Label>
                      <Controller
                        name="currency"
                        control={campaignForm.control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                              <SelectItem value="RUB">RUB</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                        </SelectContent>
                      </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Срок кампании (необязательно)</Label>
                    {hasDeadline ? (
                      <div className="flex gap-2">
                        <Controller
                          name="deadline"
                          control={campaignForm.control}
                          render={({ field }) => (
                            <Input 
                              type="date" 
                              className="flex-1"
                              {...field}
                              min={new Date().toISOString().split('T')[0]}
                            />
                          )}
                        />
                        <Button 
                          type="button"
                          variant="ghost" 
                          size="icon" 
                          onClick={() => {
                            setHasDeadline(false);
                            campaignForm.setValue("deadline", "");
                          }}
                        >
                          <span className="text-xl">×</span>
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        type="button"
                        variant="outline" 
                        className="w-full justify-start text-muted-foreground font-normal"
                        onClick={() => setHasDeadline(true)}
                      >
                        <Calendar className="w-4 h-4 mr-2" /> Установить срок
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-base">История кампании *</h3>
                  <div className="space-y-2">
                    <Controller
                      name="fullDescription"
                      control={campaignForm.control}
                      render={({ field }) => (
                    <Textarea 
                      placeholder="Расскажите свою историю подробно. Почему эта кампания важна? Кому она поможет?" 
                          className={cn("min-h-[120px]", campaignForm.formState.errors.fullDescription && "border-destructive")}
                      maxLength={2000}
                          {...field}
                        />
                      )}
                    />
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-right text-muted-foreground">
                        {campaignForm.watch("fullDescription")?.length || 0}/2000
                      </p>
                      {campaignForm.formState.errors.fullDescription && (
                        <p className="text-sm text-destructive">{campaignForm.formState.errors.fullDescription.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-base">Документы</h3>
                  <div className="space-y-3">
                    <div className="grid gap-2">
                      <Label>Название документа</Label>
                      <Input 
                        placeholder="Например: Смета расходов" 
                        value={docName}
                        onChange={(e) => setDocName(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>Краткое описание (макс. 100 символов)</Label>
                      <Input 
                        placeholder="Описание содержимого" 
                        maxLength={100}
                        value={docDesc}
                        onChange={(e) => setDocDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" className="flex-1" onClick={() => fileInputRef.current?.click()}>
                        <Upload className="w-4 h-4 mr-2" /> Загрузить файл
                      </Button>
                      <Button type="button" size="sm" onClick={addDocument} disabled={!docName}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {documents.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {documents.map((doc, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-muted/30 p-2 rounded-lg text-sm">
                            <div className="flex items-center gap-2 overflow-hidden">
                              <FileText className="w-4 h-4 shrink-0 opacity-50" />
                              <div className="truncate">
                                <p className="font-medium truncate">{doc.name}</p>
                                {doc.desc && <p className="text-xs text-muted-foreground truncate">{doc.desc}</p>}
                              </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => removeDocument(idx)}>
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-base">Изображение кампании</h3>
                  <div 
                    className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={handleFileClick}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileChange}
                    />
                    {campaignImage ? (
                      <div className="flex flex-col items-center gap-2">
                        <img 
                          src={campaignImage.startsWith('http') ? campaignImage : `https://bot.e-replika.ru${campaignImage}`} 
                          alt="Preview" 
                          className="max-h-32 max-w-full rounded-lg object-cover"
                        />
                        <p className="text-sm font-medium">{selectedFile}</p>
                        <p className="text-xs text-muted-foreground">Нажмите, чтобы изменить</p>
                      </div>
                    ) : selectedFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <Loader2 className="w-8 h-8 text-primary animate-spin" />
                        <p className="text-sm font-medium">Загрузка...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">Нажмите для загрузки изображения</p>
                        <p className="text-xs text-muted-foreground">Макс. размер: 5MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <p className="text-xs font-medium">Перед отправкой:</p>
                  <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                    <li>Ваша кампания будет проверена перед публикацией</li>
                    <li>Убедитесь, что вся информация точна и правдива</li>
                    <li>Вы сможете публиковать обновления после одобрения</li>
                  </ul>
                </div>
              </div>

              <DialogFooter>
                <Button 
                  type="submit" 
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium h-12"
                  disabled={createCampaignMutation.isPending}
                >
                  {createCampaignMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    "Отправить на проверку"
                  )}
                </Button>
              </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          {privateCampaignsLoading ? (
            <LoadingState text="Загрузка частных кампаний..." />
          ) : privateCampaigns.length > 0 ? (
            <>
              {privateCampaigns.map((campaign: any) => {
                const collected = Number(campaign.collected || 0);
                const goal = Number(campaign.goal || 1);
                const progress = (collected / goal) * 100;
                const daysLeft = campaign.deadline 
                  ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                  : null;
                
            return (
              <Card 
                key={campaign.id} 
                className="overflow-hidden border-none shadow-md group cursor-pointer active:scale-[0.98] transition-transform"
                onClick={() => openDetails(campaign)}
              >
                <div className="relative h-40 overflow-hidden">
                  <img 
                        src={campaign.image || '/placeholder-campaign.jpg'} 
                        alt={campaign.title || 'Кампания'} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 z-10">
                    <Button 
                      size="icon" 
                      variant="secondary" 
                      className={cn(
                        "h-8 w-8 rounded-full bg-white/90 shadow-sm transition-colors", 
                        favorites.includes(campaign.id) ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"
                      )}
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleFavorite(campaign.id);
                      }}
                    >
                      <HeartIcon className={cn("w-4 h-4", favorites.includes(campaign.id) && "fill-current")} />
                    </Button>
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 text-muted-foreground hover:text-primary shadow-sm" onClick={(e) => { e.stopPropagation(); }}>
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="absolute top-2 right-2 flex gap-2">
                    {campaign.urgent && (
                      <Badge variant="destructive" className="bg-red-500 text-white shadow-sm animate-pulse">
                        Срочно
                      </Badge>
                    )}
                    <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
                      {campaign.category}
                    </Badge>
                  </div>
                   <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent">
                        <p className="text-white text-xs font-medium">Автор: {campaign.author?.fullName || campaign.author?.username || 'Пользователь'}</p>
                  </div>
                </div>
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg leading-tight mb-1">{campaign.title}</h3>
                    <div className="flex justify-between text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.participantCount || 0}</span>
                          {daysLeft !== null && (
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} дн.` : 'Завершено'}</span>
                          )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm font-medium">
                          <span className="text-primary">{collected.toLocaleString()} ₽</span>
                          <span className="text-muted-foreground">{goal.toLocaleString()} ₽</span>
                    </div>
                    <Progress value={progress} className="h-2 bg-primary/10" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                      <Button 
                        className="w-full font-medium shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedCampaignForDonation(campaign);
                          setDonationModalOpen(true);
                        }}
                      >
                    Помочь сейчас
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
            </>
          ) : (
            <Card className="border-none shadow-sm">
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Нет частных кампаний</p>
              </CardContent>
            </Card>
          )}
          <div className="pt-4 pb-2">
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary hover:bg-primary/5">
              Показать еще
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-0">
          {(completedCampaignsLoading || insanCompletedFundraisingsLoading) ? (
            <LoadingState text="Загрузка завершенных кампаний..." />
          ) : completedCampaigns.length > 0 ? (
            completedCampaigns.map((campaign: any) => {
              const collected = Number(campaign.collected || 0);
              const finishDate = campaign.completedAt 
                ? new Date(campaign.completedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
                : null;
              
              return (
            <Card key={campaign.id} className="overflow-hidden border-none shadow-sm opacity-80 hover:opacity-100 transition-opacity">
              <div className="h-32 relative grayscale">
                    <img src={campaign.image || '/placeholder-campaign.jpg'} className="w-full h-full object-cover" alt={campaign.title} />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Badge variant="secondary" className="bg-white/90 text-black font-bold">Сбор закрыт</Badge>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                   <h3 className="font-bold text-base leading-tight line-clamp-2">{campaign.title}</h3>
                      {finishDate && (
                        <Badge variant="outline" className="text-[10px] h-5">{finishDate}</Badge>
                      )}
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                      {campaign.partner ? `Фонд: ${campaign.partner.name}` : campaign.author ? `Автор: ${campaign.author.fullName || campaign.author.username}` : 'Организатор'}
                </p>
                <div className="bg-emerald-50 p-3 rounded-lg flex items-center justify-between text-emerald-800 text-sm font-medium">
                  <span>Собрано:</span>
                      <span>{collected.toLocaleString()} ₽</span>
                </div>
              </CardContent>
            </Card>
              );
            })
          ) : (
            <EmptyState
              icon={Check}
              title="Нет завершенных кампаний"
              description="Завершенные кампании будут отображаться здесь"
            />
          )}
        </TabsContent>
        <TabsContent value="favorites" className="space-y-4 mt-0">
          {favoriteCampaignsLoading ? (
            <LoadingState text="Загрузка избранных кампаний..." />
          ) : favoriteCampaigns.length > 0 ? (
            favoriteCampaigns.map((campaign: any) => {
              const collected = Number(campaign.collected || 0);
              const goal = Number(campaign.goal || 1);
              const progress = (collected / goal) * 100;
              const daysLeft = campaign.deadline 
                ? Math.ceil((new Date(campaign.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                : null;
              
                return (
                  <Card 
                    key={campaign.id} 
                    className="overflow-hidden border-none shadow-md group cursor-pointer active:scale-[0.98] transition-transform"
                    onClick={() => openDetails(campaign)}
                  >
                    <div className="relative h-40 overflow-hidden">
                      <img 
                      src={campaign.image || '/placeholder-campaign.jpg'} 
                        alt={campaign.title} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Иконки избранного вверху справа */}
                      <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-100 transition-opacity z-20">
                        <Button 
                          size="icon" 
                          variant="secondary" 
                          className="h-8 w-8 rounded-full bg-white/90 shadow-sm transition-colors text-red-500 hover:text-red-600"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            toggleFavorite(campaign.id);
                          }}
                        >
                          <HeartIcon className="w-4 h-4 fill-current" />
                        </Button>
                      </div>
                      
                      {/* Badges: Срочно и категория вверху справа */}
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                        {campaign.urgent && (
                          <Badge variant="destructive" className="bg-red-500 text-white shadow-sm animate-pulse">
                            Срочно
                          </Badge>
                        )}
                        <Badge variant="secondary" className="bg-white/90 text-foreground backdrop-blur-sm shadow-sm">
                          {campaign.category}
                        </Badge>
                      </div>
                      
                      {/* Название фонда в белом прямоугольнике с красной рамкой внизу слева */}
                      {campaign.partner && campaign.partner.id && campaign.partner.name && (
                        <div className="absolute bottom-2 left-2 z-10 max-w-[calc(100%-5rem)]">
                          <Link href={`/partners/${campaign.partner.id}`} onClick={(e) => e.stopPropagation()}>
                            <div className="bg-white border-2 border-red-500 rounded px-2 py-1 shadow-md hover:bg-red-50 transition-colors max-w-full">
                              <p className="text-xs font-semibold text-foreground cursor-pointer truncate whitespace-nowrap">{campaign.partner.name}</p>
                            </div>
                          </Link>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg leading-tight mb-1">{campaign.title}</h3>
                        <div className="flex justify-between text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {campaign.participantCount || 0}</span>
                        {daysLeft !== null && (
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {daysLeft > 0 ? `${daysLeft} дн.` : 'Завершено'}</span>
                        )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-sm font-medium">
                        <span className="text-primary">{collected.toLocaleString()} ₽</span>
                        <span className="text-muted-foreground">{goal.toLocaleString()} ₽</span>
                        </div>
                        <Progress value={progress} className="h-2 bg-primary/10" />
                      </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                      <Button className="w-full font-medium shadow-sm bg-[#3E5F43] hover:bg-[#2F4832] text-white">
                        Помочь сейчас
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
          ) : (
            <EmptyState
              icon={HeartIcon}
              title="В избранном пока пусто"
              description="Добавляйте кампании в избранное, чтобы вернуться к ним позже"
              action={{
                label: "Найти проекты",
                onClick: () => setActiveTab("funds")
              }}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Campaign Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-0">
          <DialogTitle className="sr-only">{selectedCampaign?.title || 'Детали кампании'}</DialogTitle>
          {selectedCampaign && (
            <div className="space-y-0">
              <div className="relative h-56">
                 <img src={selectedCampaign.image} alt={selectedCampaign.title} className="w-full h-full object-cover" />
                 <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
                   <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={() => setIsDetailsOpen(false)}>
                     <ArrowRight className="w-6 h-6 rotate-180" />
                   </Button>
                 </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <Badge variant="outline" className="mb-2">{selectedCampaign.category}</Badge>
                  <h2 className="text-2xl font-bold font-serif leading-tight">{selectedCampaign.title}</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {selectedCampaign.fund ? `Организатор: ${selectedCampaign.fund}` : `Автор: ${selectedCampaign.author}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-primary text-lg">{selectedCampaign.collected.toLocaleString()} ₽</span>
                    <span className="text-muted-foreground">{selectedCampaign.goal.toLocaleString()} ₽</span>
                  </div>
                  <Progress value={(selectedCampaign.collected / selectedCampaign.goal) * 100} className="h-3 bg-primary/10" />
                  <div className="flex justify-between text-xs text-muted-foreground pt-1">
                    <span>{selectedCampaign.participants} человек помогли</span>
                    <span>Осталось {selectedCampaign.daysLeft} дней</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-muted/20 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Building2 className="w-10 h-10 p-2 bg-white rounded-full shadow-sm text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Организатор</p>
                        <p className="font-bold text-sm">
                          {selectedCampaign.fund || selectedCampaign.author}
                        </p>
                      </div>
                    </div>
                    {selectedCampaign.fund && (
                      <Link href={`/partners/${selectedCampaign.fund.includes('Ихсан') ? 'insan' : selectedCampaign.fund.includes('Закят') ? 'zakat' : 'insan'}`}>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          Перейти
                        </Button>
                      </Link>
                    )}
                  </div>

                  <h3 className="font-bold text-lg">О проекте</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Это подробное описание проекта. Здесь будет размещена история, цели сбора и другая важная информация, которую предоставляет организатор сбора.
                    <br/><br/>
                    Ваша помощь очень важна для реализации этого благого дела. Каждый рубль приближает нас к цели.
                  </p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg">
                      Комментарии ({(() => {
                        const comments = commentsData?.data;
                        if (Array.isArray(comments)) return comments.length;
                        if (comments?.items) return comments.items.length;
                        if (comments?.totalCount) return comments.totalCount;
                        return 0;
                      })()})
                    </h3>
                    {isAuthenticated && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-primary text-xs"
                        onClick={() => setCommentFormOpen(!commentFormOpen)}
                      >
                        {commentFormOpen ? "Отмена" : "Оставить комментарий"}
                      </Button>
                    )}
                  </div>
                  
                  {/* Comment Form */}
                  {commentFormOpen && isAuthenticated && (
                    <form onSubmit={commentForm.handleSubmit((data) => {
                      if (!selectedCampaign?.id) return;
                      
                      createComment.mutate(
                        {
                          campaignId: selectedCampaign.id,
                          content: data.content.trim(),
                        },
                        {
                          onSuccess: () => {
                            commentForm.reset();
                            setCommentFormOpen(false);
                          },
                        }
                      );
                    })}>
                      <div className="bg-muted/30 p-4 rounded-xl space-y-3 border border-primary/20">
                        <Controller
                          name="content"
                          control={commentForm.control}
                          render={({ field }) => (
                            <Textarea
                              placeholder="Напишите ваш комментарий..."
                              {...field}
                              className={cn("min-h-[80px] resize-none", commentForm.formState.errors.content && "border-destructive")}
                              maxLength={500}
                            />
                          )}
                        />
                        <div className="flex items-center justify-between">
                          <div className="flex flex-col">
                            <p className="text-xs text-muted-foreground">
                              {commentForm.watch("content")?.length || 0}/500
                            </p>
                            {commentForm.formState.errors.content && (
                              <p className="text-xs text-destructive mt-1">
                                {commentForm.formState.errors.content.message}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setCommentFormOpen(false);
                                commentForm.reset();
                              }}
                            >
                              Отмена
                            </Button>
                            <Button
                              type="submit"
                              size="sm"
                              disabled={createComment.isPending}
                            >
                              {createComment.isPending ? (
                                <>
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                  Отправка...
                                </>
                              ) : (
                                "Отправить"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Comments List */}
                  {commentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                  <div className="space-y-3">
                      {(() => {
                        const comments = commentsData?.data;
                        let commentsList: any[] = [];
                        
                        if (Array.isArray(comments)) {
                          commentsList = comments;
                        } else if (comments?.items) {
                          commentsList = comments.items;
                        } else if (comments?.data && Array.isArray(comments.data)) {
                          commentsList = comments.data;
                        }

                        if (commentsList.length === 0) {
                          return (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                              {isAuthenticated 
                                ? "Пока нет комментариев. Будьте первым!" 
                                : "Войдите, чтобы оставить комментарий"}
                            </div>
                          );
                        }

                        return commentsList.map((comment: any) => {
                          const commentDate = comment.createdAt 
                            ? new Date(comment.createdAt)
                            : null;
                          const timeAgo = commentDate
                            ? getTimeAgo(commentDate)
                            : "недавно";
                          const authorName = comment.author?.fullName || 
                                           comment.author?.username || 
                                           comment.user?.fullName ||
                                           comment.user?.username ||
                                           "Пользователь";
                          const isOwnComment = comment.authorId === user?.id || 
                                              comment.userId === user?.id;

                          return (
                            <div key={comment.id} className="bg-muted/20 p-3 rounded-xl space-y-1">
                      <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">{authorName}</span>
                                    {isOwnComment && (
                                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                                        Вы
                                      </Badge>
                                    )}
                      </div>
                                  <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                                    {comment.content}
                                  </p>
                    </div>
                                <div className="flex items-start gap-2">
                                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                    {timeAgo}
                                  </span>
                                  {isOwnComment && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6 text-destructive hover:text-destructive"
                                      onClick={() => {
                                        if (confirm("Удалить комментарий?")) {
                                          deleteComment.mutate(comment.id);
                                        }
                                      }}
                                    >
                                      <X className="w-3 h-3" />
                                    </Button>
                                  )}
                      </div>
                    </div>
                  </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>

                <Button 
                  className="w-full h-12 text-lg font-medium shadow-lg shadow-primary/20 bg-[#3E5F43] hover:bg-[#2F4832] text-white"
                  onClick={() => {
                    setSelectedCampaignForDonation(selectedCampaign);
                    setDonationModalOpen(true);
                    setIsDetailsOpen(false);
                  }}
                >
                  Пожертвовать сейчас
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Donation Modal */}
      <DonationModal
        open={donationModalOpen}
        onOpenChange={setDonationModalOpen}
        campaignId={selectedCampaignForDonation?.id}
        partnerId={selectedCampaignForDonation?.partnerId}
        campaignTitle={selectedCampaignForDonation?.title}
        category={selectedCampaignForDonation?.category || "sadaka"}
        type="campaign"
      />
    </div>
  );
}
