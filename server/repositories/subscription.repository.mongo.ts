// Репозиторий подписок для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Subscription {
  _id?: ObjectId;
  id?: string;
  userId: string;
  plan: 'basic' | 'pro' | 'premium';
  period: '1M' | '3M' | '6M' | '12M';
  status: 'active' | 'paused' | 'cancelled' | 'expired';
  providerId?: string;
  providerToken?: string;
  lastChargeDate?: Date;
  nextPayment?: Date;
  chargeAttempts: number;
  maxChargeAttempts: number;
  createdAt: Date;
  updatedAt: Date;
}

export class SubscriptionRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Subscription>('subscriptions');
  }

  async findById(id: string): Promise<Subscription | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
  }

  async findByUser(userId: string): Promise<Subscription[]> {
    const collection = this.getCollection();
    return collection.find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findActiveByUser(userId: string): Promise<Subscription | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      userId, 
      status: 'active' 
    });
  }

  async findDueForCharge(): Promise<Subscription[]> {
    const collection = this.getCollection();
    const now = new Date();
    return collection.find({
      status: 'active',
      nextPayment: { $lte: now },
      chargeAttempts: { $lt: '$maxChargeAttempts' }
    }).toArray();
  }

  async create(data: Omit<Subscription, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Subscription> {
    const collection = this.getCollection();
    const now = new Date();
    
    const subscription: Subscription = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(subscription);
    return { ...subscription, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async update(id: string, data: Partial<Subscription>): Promise<Subscription | null> {
    const collection = this.getCollection();
    const updateData: any = {
      ...data,
      updatedAt: new Date(),
    };
    delete updateData._id;
    delete updateData.id;

    const result = await collection.findOneAndUpdate(
      { $or: [{ _id: new ObjectId(id) }, { id }] },
      { $set: updateData },
      { returnDocument: 'after' }
    );

    return result || null;
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ nextPayment: 1 });
    await collection.createIndex({ providerId: 1 });
  }
}

