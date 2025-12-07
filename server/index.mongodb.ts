// Пример инициализации сервера с MongoDB
import express, { type Request, Response, NextFunction } from "express";
import { connectToMongoDB } from "./db/mongodb.js";
import { registerRoutes } from "./routes";

const app = express();

// ... остальная конфигурация Express ...

(async () => {
  try {
    // Подключение к MongoDB
    console.log('🔌 Подключение к MongoDB...');
    await connectToMongoDB();
    console.log('✅ MongoDB подключена');

    // Создание индексов (один раз при запуске)
    const { UserRepositoryMongo } = await import('./repositories/user.repository.mongo.js');
    const userRepo = new UserRepositoryMongo();
    await userRepo.createIndexes();
    console.log('✅ Индексы созданы');

    // Регистрация роутов
    await registerRoutes(httpServer, app);

    // Запуск сервера
    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(port, () => {
      console.log(`🚀 Сервер запущен на порту ${port}`);
    });

  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
})();

// Graceful shutdown
process.on('SIGINT', async () => {
  const { closeMongoDB } = await import('./db/mongodb.js');
  await closeMongoDB();
  process.exit(0);
});

