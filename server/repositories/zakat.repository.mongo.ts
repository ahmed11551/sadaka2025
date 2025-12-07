// Репозиторий расчётов закята для MongoDB
import { getDB } from '../db/mongodb.js';
import { ObjectId } from 'mongodb';

export interface ZakatCalc {
  _id?: ObjectId;
  id?: string;
  userId: string;
  payloadJson: string;
  zakatDue: number;
  aboveNisab: boolean;
  createdAt: Date;
}

export class ZakatRepositoryMongo {
  private getCollection() {
    const db = getDB();
    return db.collection<ZakatCalc>('zakat_calculations');
  }

  async findById(id: string): Promise<ZakatCalc | null> {
    const collection = this.getCollection();
    return collection.findOne({ 
      $or: [{ _id: new ObjectId(id) }, { id }]
    });
  }

  async findByUser(userId: string, limit = 100, offset = 0): Promise<ZakatCalc[]> {
    const collection = this.getCollection();
    return collection.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(offset)
      .toArray();
  }

  async create(data: Omit<ZakatCalc, '_id' | 'id' | 'createdAt'>): Promise<ZakatCalc> {
    const collection = this.getCollection();
    const now = new Date();
    
    const zakat: ZakatCalc = {
      ...data,
      createdAt: now,
    };

    const result = await collection.insertOne(zakat);
    return { ...zakat, _id: result.insertedId, id: result.insertedId.toString() };
  }

  async createIndexes(): Promise<void> {
    const collection = this.getCollection();
    await collection.createIndex({ userId: 1 });
    await collection.createIndex({ createdAt: -1 });
  }
}

