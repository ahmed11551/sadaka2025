// Контроллер аутентификации с использованием MongoDB
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UserRepositoryMongo } from '../repositories/user.repository.mongo.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';

export class AuthControllerMongo {
  private userRepo: UserRepositoryMongo;

  constructor() {
    this.userRepo = new UserRepositoryMongo();
  }

  // Регистрация пользователя
  async register(req: Request, res: Response) {
    const { email, username, password, fullName, phone, country, city } = req.body;

    // Проверка существующего email
    const existingEmail = await this.userRepo.findByEmail(email);
    if (existingEmail) {
      throw new ConflictError('Email already registered');
    }

    // Проверка существующего username
    const existingUsername = await this.userRepo.findByUsername(username);
    if (existingUsername) {
      throw new ConflictError('Username already taken');
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создание пользователя
    const user = await this.userRepo.create({
      email,
      username,
      password: hashedPassword,
      fullName,
      phone,
      country: country || 'ru',
      city,
      role: 'user',
    });

    // Удаляем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: 'User registered successfully',
      },
    });
  }

  // Вход пользователя
  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    // Поиск пользователя по email
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Сохранение в сессию
    (req.session as any).userId = user._id?.toString() || user.id;
    (req.session as any).userRole = user.role;

    // Удаляем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: 'Login successful',
      },
    });
  }

  // Получить текущего пользователя
  async getMe(req: Request, res: Response) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new UnauthorizedError('Not authenticated');
    }

    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError('User');
    }

    // Удаляем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
      },
    });
  }

  // Выход
  async logout(req: Request, res: Response) {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: 'Failed to logout',
        });
      }

      res.json({
        success: true,
        message: 'Logout successful',
      });
    });
  }

  // Обновление профиля
  async updateProfile(req: Request, res: Response) {
    const userId = (req.session as any)?.userId;
    if (!userId) {
      throw new UnauthorizedError('Not authenticated');
    }

    const { fullName, phone, city, avatar } = req.body;

    const user = await this.userRepo.update(userId, {
      fullName,
      phone,
      city,
      avatar,
    });

    if (!user) {
      throw new NotFoundError('User');
    }

    // Удаляем пароль из ответа
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        message: 'Profile updated successfully',
      },
    });
  }
}

