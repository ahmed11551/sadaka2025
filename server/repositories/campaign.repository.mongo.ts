// Репозиторий кампаний для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Campaign {
  _id?: ObjectId;
  id?: string;
  title: string;
  slug: string;
  description: string;
  fullDescription?: string;
  category: string;
  image?: string;
  goal: number;
  collected: number;
  currency: string;
  type: 'fund' | 'private';
  status: 'active' | 'completed' | 'cancelled';
  urgent: boolean;
  verified: boolean;
  moderationStatus: 'pending' | 'approved' | 'rejected';
  moderationNote?: string;
  moderatedAt?: Date;
  moderatedBy?: string;
  participantCount: number;
  deadline?: Date;
  completedAt?: Date;
  partnerId?: string;
  authorId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CampaignRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Campaign>('campaigns');
  }

  async findById(id: string): Promise<Campaign | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
  }

  async findBySlug(slug: string): Promise<Campaign | null> {
    const collection = this.getCollection();
    return collection.findOne({ slug });
  }

  async findMany(filters: {
    status?: string;
    type?: string;
    partnerId?: string;
    authorId?: string;
    moderationStatus?: string;
    urgent?: boolean;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Campaign[]> {
    const collection = this.getCollection();
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.type) query.type = filters.type;
    if (filters.partnerId) query.partnerId = filters.partnerId;
    if (filters.authorId) query.authorId = filters.authorId;
    if (filters.moderationStatus) query.moderationStatus = filters.moderationStatus;
    if (filters.urgent !== undefined) query.urgent = filters.urgent;
    if (filters.category) query.category = filters.category;

    const cursor = collection.find(query)
      .sort({ createdAt: -1 })
      .limit(filters.limit || 100)
      .skip(filters.offset || 0);

    return cursor.toArray();
  }

  async create(data: Omit<Campaign, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
    const collection = this.getCollection();
    const now = new Date();
    
    const campaign: Campaign = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(campaign);
    return { ...campaign, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async update(id: string, data: Partial<Campaign>): Promise<Campaign | null> {
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

  async updateCollected(id: string, amount: number): Promise<void> {
    const collection = this.getCollection();
    await collection.updateOne(
      { $or: [{ _id: new ObjectId(id) }, { id }] },
      { 
        $inc: { collected: amount, participantCount: 1 },
        $set: { updatedAt: new Date() }
      }
    );
  }

  async delete(id: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
    return result.deletedCount > 0;
  }

  async count(filters?: any): Promise<number> {
    const collection = this.getCollection();
    return collection.countDocuments(filters || {});
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ status: 1, type: 1 });
    await collection.createIndex({ partnerId: 1 });
    await collection.createIndex({ authorId: 1 });
    await collection.createIndex({ moderationStatus: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}

