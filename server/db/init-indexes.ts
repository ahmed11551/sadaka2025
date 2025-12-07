// Скрипт для создания индексов MongoDB
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Загружаем .env из корня проекта
dotenv.config({ path: join(__dirname, '../../.env') });

import { connectToMongoDB } from './mongodb.js';
import { UserRepositoryMongo } from '../repositories/user.repository.mongo.js';
import { CampaignRepositoryMongo } from '../repositories/campaign.repository.mongo.js';
import { DonationRepositoryMongo } from '../repositories/donation.repository.mongo.js';
import { PartnerRepositoryMongo } from '../repositories/partner.repository.mongo.js';
import { PaymentRepositoryMongo } from '../repositories/payment.repository.mongo.js';
import { SubscriptionRepositoryMongo } from '../repositories/subscription.repository.mongo.js';
import { ZakatRepositoryMongo } from '../repositories/zakat.repository.mongo.js';
import { FavoriteRepositoryMongo } from '../repositories/favorite.repository.mongo.js';
import { CommentRepositoryMongo } from '../repositories/comment.repository.mongo.js';

async function createAllIndexes() {
  try {
    console.log('🔌 Подключение к MongoDB...');
    await connectToMongoDB();
    console.log('✅ Подключено к MongoDB\n');

    console.log('📊 Создание индексов...\n');

    // Users
    console.log('👤 Создание индексов для users...');
    const userRepo = new UserRepositoryMongo();
    await userRepo.createIndexes();
    console.log('✅ Индексы users созданы');

    // Campaigns
    console.log('📢 Создание индексов для campaigns...');
    const campaignRepo = new CampaignRepositoryMongo();
    await campaignRepo.createIndexes();
    console.log('✅ Индексы campaigns созданы');

    // Donations
    console.log('💰 Создание индексов для donations...');
    const donationRepo = new DonationRepositoryMongo();
    await donationRepo.createIndexes();
    console.log('✅ Индексы donations созданы');

    // Partners
    console.log('🤝 Создание индексов для partners...');
    const partnerRepo = new PartnerRepositoryMongo();
    await partnerRepo.createIndexes();
    console.log('✅ Индексы partners созданы');

    // Payments
    console.log('💳 Создание индексов для payments...');
    const paymentRepo = new PaymentRepositoryMongo();
    await paymentRepo.createIndexes();
    console.log('✅ Индексы payments созданы');

    // Subscriptions
    console.log('🔄 Создание индексов для subscriptions...');
    const subscriptionRepo = new SubscriptionRepositoryMongo();
    await subscriptionRepo.createIndexes();
    console.log('✅ Индексы subscriptions созданы');

    // Zakat
    console.log('📿 Создание индексов для zakat_calculations...');
    const zakatRepo = new ZakatRepositoryMongo();
    await zakatRepo.createIndexes();
    console.log('✅ Индексы zakat_calculations созданы');

    // Favorites
    console.log('⭐ Создание индексов для favorites...');
    const favoriteRepo = new FavoriteRepositoryMongo();
    await favoriteRepo.createIndexes();
    console.log('✅ Индексы favorites созданы');

    // Comments
    console.log('💬 Создание индексов для comments...');
    const commentRepo = new CommentRepositoryMongo();
    await commentRepo.createIndexes();
    console.log('✅ Индексы comments созданы');

    console.log('\n🎉 Все индексы успешно созданы!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при создании индексов:', error);
    process.exit(1);
  }
}

createAllIndexes();

