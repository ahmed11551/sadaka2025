// Репозиторий партнёров для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Partner {
  _id?: ObjectId;
  id?: string;
  name: string;
  nameAr?: string;
  slug: string;
  type: string;
  description: string;
  logo?: string;
  verified: boolean;
  country: string;
  city?: string;
  location: string;
  website?: string;
  email?: string;
  phone?: string;
  totalCollected: number;
  totalDonors: number;
  totalHelped: number;
  projectCount: number;
  foundedYear?: number;
  categories: string[];
  createdAt: Date;
  updatedAt: Date;
}

export class PartnerRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Partner>('partners');
  }

  async findById(id: string): Promise<Partner | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
  }

  async findBySlug(slug: string): Promise<Partner | null> {
    const collection = this.getCollection();
    return collection.findOne({ slug });
  }

  async findMany(filters: {
    country?: string;
    verified?: boolean;
    type?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<Partner[]> {
    const collection = this.getCollection();
    const query: any = {};

    if (filters.country) query.country = filters.country;
    if (filters.verified !== undefined) query.verified = filters.verified;
    if (filters.type) query.type = filters.type;
    if (filters.category) query.categories = { $in: [filters.category] };

    return collection.find(query)
      .sort({ totalCollected: -1 })
      .limit(filters.limit || 100)
      .skip(filters.offset || 0)
      .toArray();
  }

  async create(data: Omit<Partner, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Partner> {
    const collection = this.getCollection();
    const now = new Date();
    
    const partner: Partner = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(partner);
    return { ...partner, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async update(id: string, data: Partial<Partner>): Promise<Partner | null> {
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

  async incrementStats(id: string, stats: {
    totalCollected?: number;
    totalDonors?: number;
    totalHelped?: number;
    projectCount?: number;
  }): Promise<void> {
    const collection = this.getCollection();
    const update: any = { updatedAt: new Date() };
    
    if (stats.totalCollected) update.$inc = { ...update.$inc, totalCollected: stats.totalCollected };
    if (stats.totalDonors) update.$inc = { ...update.$inc, totalDonors: stats.totalDonors };
    if (stats.totalHelped) update.$inc = { ...update.$inc, totalHelped: stats.totalHelped };
    if (stats.projectCount) update.$inc = { ...update.$inc, projectCount: stats.projectCount };

    await collection.updateOne(
      { $or: [{ _id: new ObjectId(id) }, { id }] },
      update
    );
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ slug: 1 }, { unique: true });
    await collection.createIndex({ country: 1 });
    await collection.createIndex({ verified: 1 });
    await collection.createIndex({ type: 1 });
    await collection.createIndex({ categories: 1 });
  }
}

