// Примеры использования Prisma Client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============= ПРИМЕРЫ ЗАПРОСОВ =============

// 1. Найти пользователей по email (как в вашем примере)
async function findUsersByEmail() {
  const users = await prisma.user.findMany({
    where: {
      email: { endsWith: 'prisma.io' }
    },
  });
  return users;
}

// 2. Найти пользователей с фильтрами
async function findUsersWithFilters() {
  const users = await prisma.user.findMany({
    where: {
      email: { contains: '@' }, // содержит @
      role: 'admin', // роль admin
      country: 'ru', // страна ru
    },
    select: {
      id: true,
      email: true,
      username: true,
      role: true,
    },
    orderBy: {
      createdAt: 'desc', // сортировка по дате создания
    },
    take: 10, // ограничение 10 записей
  });
  return users;
}

// 3. Найти одного пользователя
async function findOneUser() {
  const user = await prisma.user.findUnique({
    where: {
      email: 'user@example.com'
    },
    include: {
      donations: true, // включить связанные пожертвования
      campaigns: true, // включить связанные кампании
    },
  });
  return user;
}

// 4. Создать пользователя
async function createUser() {
  const user = await prisma.user.create({
    data: {
      email: 'newuser@example.com',
      username: 'newuser',
      password: 'hashed_password',
      country: 'ru',
      role: 'user',
    },
  });
  return user;
}

// 5. Обновить пользователя
async function updateUser(userId) {
  const user = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      role: 'admin', // сделать администратором
    },
  });
  return user;
}

// 6. Найти кампании с модерацией
async function findPendingCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      moderationStatus: 'pending', // ожидают модерации
    },
    include: {
      owner: true, // включить владельца
      partner: true, // включить партнёра
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return campaigns;
}

// 7. Найти пожертвования с платежами
async function findDonationsWithPayments() {
  const donations = await prisma.donation.findMany({
    where: {
      status: 'completed',
    },
    include: {
      user: true,
      campaign: true,
      partner: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 20,
  });
  return donations;
}

// 8. Агрегация (подсчёт, сумма)
async function getStatistics() {
  const stats = await prisma.donation.aggregate({
    where: {
      status: 'completed',
    },
    _sum: {
      amount: true, // сумма всех пожертвований
    },
    _count: {
      id: true, // количество пожертвований
    },
    _avg: {
      amount: true, // средняя сумма
    },
  });
  return stats;
}

// 9. Сложный запрос с несколькими условиями
async function findActiveCampaigns() {
  const campaigns = await prisma.campaign.findMany({
    where: {
      AND: [
        { status: 'active' },
        { moderationStatus: 'approved' },
        { endDate: { gte: new Date() } }, // дата окончания >= сегодня
      ],
    },
    include: {
      partner: {
        select: {
          name: true,
          logo: true,
          verified: true,
        },
      },
    },
    orderBy: [
      { collected: 'desc' }, // сортировка по собранной сумме
      { createdAt: 'desc' },
    ],
  });
  return campaigns;
}

// 10. Транзакция (несколько операций атомарно)
async function createDonationWithPayment(donationData, paymentData) {
  const result = await prisma.$transaction(async (tx) => {
    // Создать пожертвование
    const donation = await tx.donation.create({
      data: donationData,
    });

    // Создать платеж
    const payment = await tx.payment.create({
      data: {
        ...paymentData,
        donationId: donation.id,
      },
    });

    return { donation, payment };
  });
  return result;
}

// ============= ЭКСПОРТ ФУНКЦИЙ =============
export {
  findUsersByEmail,
  findUsersWithFilters,
  findOneUser,
  createUser,
  updateUser,
  findPendingCampaigns,
  findDonationsWithPayments,
  getStatistics,
  findActiveCampaigns,
  createDonationWithPayment,
};

// ============= ПРИМЕР ИСПОЛЬЗОВАНИЯ =============
async function main() {
  try {
    // Пример: найти пользователей
    const users = await findUsersByEmail();
    console.log('Найдено пользователей:', users.length);

    // Пример: статистика
    const stats = await getStatistics();
    console.log('Статистика пожертвований:', stats);

  } catch (error) {
    console.error('Ошибка:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Раскомментируйте для запуска:
// main();

