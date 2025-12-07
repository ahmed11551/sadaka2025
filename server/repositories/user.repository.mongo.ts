// Репозиторий пользователей для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  id?: string;
  email: string;
  username: string;
  password: string;
  fullName?: string;
  phone?: string;
  country: string;
  city?: string;
  avatar?: string;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<User>('users');
  }

  async findById(id: string): Promise<User | null> {
    const collection = this.getCollection();
    const user = await collection.findOne({ 
      $or: [
        { _id: new ObjectId(id) },
        { id: id }
      ]
    });
    return user || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const collection = this.getCollection();
    const user = await collection.findOne({ email });
    return user || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const collection = this.getCollection();
    const user = await collection.findOne({ username });
    return user || null;
  }

  async create(data: {
    email: string;
    username: string;
    password: string;
    fullName?: string;
    phone?: string;
    country?: string;
    city?: string;
    avatar?: string;
    role?: string;
  }): Promise<User> {
    const collection = this.getCollection();
    const now = new Date();
    
    const user: User = {
      email: data.email,
      username: data.username,
      password: data.password,
      fullName: data.fullName,
      phone: data.phone,
      country: data.country || 'ru',
      city: data.city,
      avatar: data.avatar,
      role: data.role || 'user',
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(user);
    return { ...user, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async update(id: string, data: Partial<{
    email: string;
    username: string;
    fullName: string;
    phone: string;
    country: string;
    city: string;
    avatar: string;
    role: string;
  }>): Promise<User | null> {
    const collection = this.getCollection();
    
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };

    const result = await collection.findOneAndUpdate(
      { 
        $or: [
          { _id: new ObjectId(id) },
          { id: id }
        ]
      },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  async updateRole(userId: string, role: 'user' | 'admin' | 'moderator'): Promise<User | null> {
    return this.update(userId, { role });
  }

  async delete(id: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ 
      $or: [
        { _id: new ObjectId(id) },
        { id: id }
      ]
    });
    return result.deletedCount > 0;
  }

  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const collection = this.getCollection();
    const users = await collection
      .find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .toArray();
    return users;
  }

  async count(): Promise<number> {
    const collection = this.getCollection();
    return collection.countDocuments();
  }

  // MongoDB-специфичные методы
  async findByRole(role: string): Promise<User[]> {
    const collection = this.getCollection();
    return collection.find({ role }).toArray();
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ email: 1 }, { unique: true });
    await collection.createIndex({ username: 1 }, { unique: true });
    await collection.createIndex({ role: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}

