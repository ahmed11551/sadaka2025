import prisma from './client';
import { Prisma } from '@prisma/client';

async function seedPartners() {
  const partners = [
    {
      name: 'Фонд Инсан',
      nameAr: 'صندوق إنسان',
      slug: 'insan',
      type: 'General',
      description: 'Благотворительный фонд "Инсан" - основной партнер платформы MubarakWay. Фонд занимается различными направлениями благотворительности: помощь сиротам, образование, здравоохранение, экстренная помощь, водоснабжение.',
      country: 'ru',
      city: 'mah',
      location: 'Россия, Махачкала',
      verified: true,
      website: 'https://fondinsan.ru',
      email: 'info@fondinsan.ru',
      categories: ['Сироты', 'Образование', 'Здравоохранение'],
      projectCount: 13,
    },
    {
      name: 'Закят.Ру',
      nameAr: 'زكاة',
      slug: 'zakat',
      type: 'Zakat',
      description: 'Официальный фонд по сбору и распределению закята. Помощь нуждающимся по всей территории РФ.',
      country: 'ru',
      city: 'msk',
      location: 'Россия, Москва',
      verified: true,
      website: 'https://zakat.ru',
      email: 'info@zakat.ru',
      categories: ['Закят', 'Продовольствие'],
      totalCollected: new Prisma.Decimal(1200000),
      totalDonors: 450,
      totalHelped: 1200,
      projectCount: 5,
      foundedYear: 2017,
    },
    {
      name: 'Фонд Вакф',
      nameAr: 'وقف',
      slug: 'vaqf',
      type: 'Waqf',
      description: 'Благотворительный общественный фонд "Вакф" при Управлении мусульман Узбекистана.',
      country: 'uz',
      city: 'tashkent',
      location: 'Узбекистан, Ташкент',
      verified: true,
      website: 'https://vaqf.uz',
      email: 'info@vaqf.uz',
      categories: ['Вакф', 'Образование'],
      totalCollected: new Prisma.Decimal(5400000),
      totalDonors: 1200,
      totalHelped: 5000,
      projectCount: 8,
      foundedYear: 2020,
    },
  ];

  for (const partner of partners) {
    await prisma.partner.upsert({
      where: { slug: partner.slug },
      update: partner,
      create: partner,
    });
  }

  console.log('✅ Partners seeded');
}

async function seedCampaigns() {
  const partners = await prisma.partner.findMany();
  
  if (partners.length === 0) {
    console.log('⚠️ No partners found, skipping campaign seed');
    return;
  }

  const campaigns = [
    {
      title: 'Строительство мечети в Казани',
      slug: 'stroitelstvo-mecheti-kazan-' + Date.now(),
      description: 'Помогите построить мечеть для растущей мусульманской общины в Казани',
      fullDescription: 'Община мусульман Казани стремительно растет, и нам необходимо новое место для совершения намаза. Мы начали сбор средств на строительство современной мечети, которая сможет вместить до 500 человек.',
      category: 'Мечети',
      goal: new Prisma.Decimal(5000000),
      collected: new Prisma.Decimal(2450000),
      type: 'fund',
      status: 'active',
      urgent: true,
      verified: true,
      participantCount: 1240,
      partnerId: partners[0].id,
    },
    {
      title: 'Образование для детей-сирот',
      slug: 'obrazovanie-siroty-' + Date.now(),
      description: 'Обеспечим качественным образованием детей, оставшихся без попечения родителей',
      fullDescription: 'Программа направлена на предоставление образовательных услуг для детей-сирот. Включает школьные принадлежности, оплату репетиторов и дополнительные занятия.',
      category: 'Образование',
      goal: new Prisma.Decimal(300000),
      collected: new Prisma.Decimal(180000),
      type: 'fund',
      status: 'active',
      verified: true,
      participantCount: 450,
      partnerId: partners[1].id,
    },
    {
      title: 'Колодцы для жителей Африки',
      slug: 'kolodtsy-afrika-' + Date.now(),
      description: 'Построим колодцы в районах Африки, где нет доступа к чистой воде',
      fullDescription: 'Миллионы людей в Африке не имеют доступа к чистой питьевой воде. Наш проект направлен на строительство колодцев в отдаленных районах.',
      category: 'Колодцы',
      goal: new Prisma.Decimal(1000000),
      collected: new Prisma.Decimal(650000),
      type: 'fund',
      status: 'active',
      urgent: true,
      verified: true,
      participantCount: 820,
      partnerId: partners[0].id,
    },
  ];

  for (const campaign of campaigns) {
    await prisma.campaign.create({
      data: campaign,
    });
  }

  console.log('✅ Campaigns seeded');
}

async function seedAchievements() {
  const achievements = [
    {
      key: 'first_donation',
      name: 'Первое пожертвование',
      description: 'Сделайте свое первое пожертвование',
      category: 'donations',
      requirement: JSON.stringify({ donations: 1 }),
      points: 10,
    },
    {
      key: 'generous_donor',
      name: 'Щедрый донор',
      description: 'Пожертвуйте более 10,000 ₽',
      category: 'donations',
      requirement: JSON.stringify({ totalAmount: 10000 }),
      points: 50,
    },
    {
      key: 'regular_supporter',
      name: 'Постоянный спонсор',
      description: 'Совершите 10 пожертвований',
      category: 'donations',
      requirement: JSON.stringify({ donations: 10 }),
      points: 100,
    },
    {
      key: 'campaign_creator',
      name: 'Организатор сбора',
      description: 'Создайте свою первую кампанию',
      category: 'campaigns',
      requirement: JSON.stringify({ campaigns: 1 }),
      points: 25,
    },
    {
      key: 'community_helper',
      name: 'Помощник общины',
      description: 'Поддержите 5 разных кампаний',
      category: 'community',
      requirement: JSON.stringify({ uniqueCampaigns: 5 }),
      points: 75,
    },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: achievement,
      create: achievement,
    });
  }

  console.log('✅ Achievements seeded');
}

async function main() {
  try {
    console.log('🌱 Starting database seed...');
    
    await seedPartners();
    await seedCampaigns();
    await seedAchievements();
    
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
