// Репозиторий комментариев для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface Comment {
  _id?: ObjectId;
  id?: string;
  userId: string;
  campaignId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export class CommentRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<Comment>('comments');
  }

  async findByCampaign(campaignId: string, limit = 20, offset = 0): Promise<Comment[]> {
    const collection = this.getCollection();
    return collection.find({ campaignId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .toArray();
  }

  async create(data: Omit<Comment, '_id' | 'id' | 'createdAt' | 'updatedAt'>): Promise<Comment> {
    const collection = this.getCollection();
    const now = new Date();
    
    const comment: Comment = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(comment);
    return { ...comment, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async delete(id: string, userId: string): Promise<boolean> {
    const collection = this.getCollection();
    const result = await collection.deleteOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }],
      userId 
    });
    return result.deletedCount > 0;
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ campaignId: 1 });
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}

