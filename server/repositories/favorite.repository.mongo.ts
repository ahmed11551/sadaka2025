// Репозиторий избранного для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Favorite {
  _id?: ObjectId;
  id?: string;
  userId: string;
  campaignId: string;
  createdAt: Date;
}

export class FavoriteRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Favorite>('favorites');
  }

  async findByUser(userId: string): Promise<Favorite[]> {
    const collection = this.getCollection();
    return collection.find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
  }

  async findByUserAndCampaign(userId: string, campaignId: string): Promise<Favorite | null> {
    const collection = this.getCollection();
    return collection.findOne({ userId, campaignId });
  }

  async create(userId: string, campaignId: string): Promise<Favorite> {
    const collection = this.getCollection();
    const now = new Date();
    
    const favorite: Favorite = {
      userId,
      campaignId,
      createdAt: now,
    };

    const result = await collection.insertOne(favorite);
    return { ...favorite, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async delete(userId: string, campaignId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ userId, campaignId });
    return result.deletedCount > 0;
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1, campaignId: 1 }, { unique: true });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ campaignId: 1 });
  }
}

