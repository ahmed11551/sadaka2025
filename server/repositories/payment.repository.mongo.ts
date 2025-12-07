// Репозиторий платежей для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Payment {
  _id?: ObjectId;
  id?: string;
  donationId: string;
  provider: 'yookassa' | 'cloudpayments';
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled';
  providerId?: string;
  paymentUrl?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export class PaymentRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Payment>('payments');
  }

  async findById(id: string): Promise<Payment | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
  }

  async findByDonationId(donationId: string): Promise<Payment | null> {
    const collection = this.getCollection();
    return collection.findOne({ donationId });
  }

  async findByProviderId(providerId: string): Promise<Payment | null> {
    const collection = this.getCollection();
    return collection.findOne({ providerId });
  }

  async create(data: Omit<Payment, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Payment> {
    const collection = this.getCollection();
    const now = new Date();
    
    const payment: Payment = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(payment);
    return { ...payment, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async update(id: string, data: Partial<Payment>): Promise<Payment | null> {
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
    await collection.createIndex({ donationId: 1 }, { unique: true });
    await collection.createIndex({ providerId: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}

