import express, { type Request, Response, NextFunction } from "express";
import session from 'express-session';
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { errorHandler } from "./middleware/error";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// CORS middleware
app.use((req, res, next) => {
  const origin = req.headers.origin;
  res.setHeader('Access-Control-Allow-Origin', origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  
  next();
});

// Body parsing middleware
app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);
app.use(express.urlencoded({ extended: false }));

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'mubarakway-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    },
  })
);

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Подключение к MongoDB (если MONGODB_URI установлен)
    if (process.env.MONGODB_URI) {
      try {
        const { connectToMongoDB } = await import("./db/mongodb.js");
        log("🔌 Подключение к MongoDB...");
        await connectToMongoDB();
        log("✅ MongoDB подключена");
        
        // Создание индексов (только при первом запуске, можно закомментировать после)
        if (process.env.CREATE_INDEXES === 'true') {
          log("📊 Создание индексов MongoDB...");
          const { UserRepositoryMongo } = await import("./repositories/user.repository.mongo.js");
          const { CampaignRepositoryMongo } = await import("./repositories/campaign.repository.mongo.js");
          const { DonationRepositoryMongo } = await import("./repositories/donation.repository.mongo.js");
          const { PartnerRepositoryMongo } = await import("./repositories/partner.repository.mongo.js");
          const { PaymentRepositoryMongo } = await import("./repositories/payment.repository.mongo.js");
          const { SubscriptionRepositoryMongo } = await import("./repositories/subscription.repository.mongo.js");
          const { ZakatRepositoryMongo } = await import("./repositories/zakat.repository.mongo.js");
          const { FavoriteRepositoryMongo } = await import("./repositories/favorite.repository.mongo.js");
          const { CommentRepositoryMongo } = await import("./repositories/comment.repository.mongo.js");
          
          const repos = [
            new UserRepositoryMongo(),
            new CampaignRepositoryMongo(),
            new DonationRepositoryMongo(),
            new PartnerRepositoryMongo(),
            new PaymentRepositoryMongo(),
            new SubscriptionRepositoryMongo(),
            new ZakatRepositoryMongo(),
            new FavoriteRepositoryMongo(),
            new CommentRepositoryMongo(),
          ];
          
          for (const repo of repos) {
            await repo.createIndexes();
          }
          log("✅ Индексы MongoDB созданы");
        }
      } catch (error) {
        log(`⚠️ Предупреждение: Не удалось подключиться к MongoDB: ${error}`);
        log("Продолжаем работу без MongoDB...");
      }
    }

    // Register routes
    await registerRoutes(httpServer, app);

    // Setup Vite or static files (before error handler)
    if (process.env.NODE_ENV === "production") {
      serveStatic(app);
    } else {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }

    // Error handling middleware - must be last
    app.use(errorHandler);

    const port = parseInt(process.env.PORT || "5000", 10);
    httpServer.listen(
      port,
      "0.0.0.0",
      () => {
        log(`MubarakWay server running on port ${port}`);
        log(`Database: ${process.env.MONGODB_URI ? 'MongoDB' : process.env.DATABASE_URL ? 'PostgreSQL' : 'Not configured'}`);
        log(`Session: Configured`);
        log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      },
    );
  } catch (error) {
    log(`❌ Ошибка при запуске сервера: ${error}`);
    process.exit(1);
  }
})();
