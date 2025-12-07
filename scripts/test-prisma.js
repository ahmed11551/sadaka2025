// Тестовый скрипт для проверки работы Prisma
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🔌 Подключение к базе данных...\n');

  try {
    // Проверка подключения
    await prisma.$connect();
    console.log('✅ Подключение к БД успешно!\n');

    // Пример 1: Найти всех пользователей
    console.log('📋 Поиск всех пользователей...');
    const allUsers = await prisma.user.findMany({
      take: 5, // Ограничиваем 5 записями
    });
    console.log(`Найдено пользователей: ${allUsers.length}`);
    if (allUsers.length > 0) {
      console.log('Примеры пользователей:');
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.username}) - роль: ${user.role || 'не указана'}`);
      });
    }
    console.log('');

    // Пример 2: Найти пользователей по email (как в вашем примере)
    console.log('📧 Поиск пользователей с email, заканчивающимся на "prisma.io"...');
    const prismaUsers = await prisma.user.findMany({
      where: {
        email: { endsWith: 'prisma.io' }
      },
    });
    console.log(`Найдено: ${prismaUsers.length} пользователей\n`);

    // Пример 3: Найти пользователей с ролью admin
    console.log('👑 Поиск администраторов...');
    const admins = await prisma.user.findMany({
      where: {
        role: 'admin'
      },
    });
    console.log(`Найдено администраторов: ${admins.length}`);
    if (admins.length > 0) {
      admins.forEach((admin, index) => {
        console.log(`  ${index + 1}. ${admin.email} (${admin.username})`);
      });
    }
    console.log('');

    // Пример 4: Проверить таблицы из миграции
    console.log('📊 Проверка таблиц из миграции...');
    
    // Проверка таблицы payments
    const paymentsCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'payments'
    `;
    console.log(`Таблица payments: ${paymentsCount[0]?.count > 0 ? '✅ существует' : '❌ не найдена'}`);

    // Проверка таблицы zakat_calculations
    const zakatCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM information_schema.tables 
      WHERE table_name = 'zakat_calculations'
    `;
    console.log(`Таблица zakat_calculations: ${zakatCount[0]?.count > 0 ? '✅ существует' : '❌ не найдена'}`);

    // Проверка колонки role в users
    const roleColumn = await prisma.$queryRaw`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'role'
    `;
    console.log(`Колонка role в users: ${roleColumn.length > 0 ? '✅ существует' : '❌ не найдена'}`);
    console.log('');

    // Пример 5: Статистика
    console.log('📈 Статистика базы данных:');
    const usersCount = await prisma.user.count();
    const campaignsCount = await prisma.campaign.count();
    const partnersCount = await prisma.partner.count();
    const donationsCount = await prisma.donation.count();

    console.log(`  Пользователей: ${usersCount}`);
    console.log(`  Кампаний: ${campaignsCount}`);
    console.log(`  Партнёров: ${partnersCount}`);
    console.log(`  Пожертвований: ${donationsCount}`);
    console.log('');

    console.log('✅ Все проверки завершены успешно!');

  } catch (error) {
    console.error('❌ Ошибка при работе с БД:');
    console.error(error.message);
    if (error.code) {
      console.error(`Код ошибки: ${error.code}`);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Отключение от БД');
  }
}

main()
  .catch((error) => {
    console.error('❌ Критическая ошибка:');
    console.error(error);
    process.exit(1);
  });

