import mosqueImg from "@assets/generated_images/mosque_construction_campaign.png";
import educationImg from "@assets/generated_images/education_charity_campaign.png";

export const fundCampaigns = [
  {
    id: 1,
    title: "Строительство мечети в Казани",
    category: "Мечети",
    fund: "Фонд Ихсан",
    image: mosqueImg,
    collected: 2450000,
    goal: 5000000,
    participants: 1240,
    daysLeft: 45,
    verified: true,
    urgent: true,
  },
  {
    id: 2,
    title: "Образование для детей-сирот",
    category: "Дети",
    fund: "Закят.Ру",
    image: educationImg,
    collected: 180000,
    goal: 300000,
    participants: 450,
    daysLeft: 12,
    verified: true,
    urgent: false,
  },
];

export const privateCampaigns = [
  {
    id: 3,
    title: "Ремонт сельской школы",
    category: "Образование",
    author: "Ахмад И.",
    image: educationImg,
    collected: 45000,
    goal: 150000,
    participants: 120,
    daysLeft: 20,
    verified: false,
    urgent: false,
  },
  {
    id: 4,
    title: "Помощь погорельцам",
    category: "Экстренно",
    author: "Мариям К.",
    image: mosqueImg, // Using placeholder
    collected: 25000,
    goal: 500000,
    participants: 85,
    daysLeft: 5,
    verified: false,
    urgent: true,
  }
];

export const completedCampaigns = [
  {
    id: 101,
    title: "Ифтар Рамадан 2024",
    category: "Продукты",
    fund: "Фонд Ихсан",
    image: mosqueImg,
    collected: 500000,
    goal: 500000,
    participants: 320,
    finishDate: "10.04.2024",
  },
  {
    id: 102,
    title: "Помощь школе №5",
    category: "Образование",
    author: "Родительский комитет",
    image: educationImg,
    collected: 120000,
    goal: 120000,
    participants: 45,
    finishDate: "25.05.2024",
  },
];

export const allCampaigns = [...fundCampaigns, ...privateCampaigns, ...completedCampaigns];
