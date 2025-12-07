// Репозиторий пожертвований для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Donation {
  _id?: ObjectId;
  id?: string;
  userId: string;
  campaignId?: string;
  partnerId?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  anonymous: boolean;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class DonationRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Donation>('donations');
  }

  async findById(id: string): Promise<Donation | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
  }

  async findByUser(userId: string, limit = 100, offset = 0): Promise<Donation[]> {
    const collection = this.getCollection();
    return collection.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .toArray();
  }

  async findByCampaign(campaignId: string, limit = 100, offset = 0): Promise<Donation[]> {
    const collection = this.getCollection();
    return collection.find({ campaignId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .toArray();
  }

  async create(data: Omit<Donation, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Donation> {
    const collection = this.getCollection();
    const now = new Date();
    
    const donation: Donation = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(donation);
    return { ...donation, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async update(id: string, data: Partial<Donation>): Promise<Donation | null> {
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

  async getTotalByCampaign(campaignId: string): Promise<number> {
    const collection = this.getCollection();
    const result = await collection.aggregate([
      { $match: { campaignId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  async getTotalByUser(userId: string): Promise<number> {
    const collection = this.getCollection();
    const result = await collection.aggregate([
      { $match: { userId, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]).toArray();
    return result[0]?.total || 0;
  }

  async count(filters?: any): Promise<number> {
    const collection = this.getCollection();
    return collection.countDocuments(filters || {});
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ campaignId: 1 });
    await collection.createIndex({ partnerId: 1 });
    await collection.createIndex({ status: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}

