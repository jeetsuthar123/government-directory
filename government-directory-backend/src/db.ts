import { Injectable, OnModuleDestroy, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { Db, MongoClient, Collection } from 'mongodb';

@Injectable()
export class DbService implements OnModuleInit, OnModuleDestroy {
  private client!: MongoClient;
  private database!: Db;
  async onModuleInit() {
    this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/government_directory_dev');
    await this.client.connect();
    this.database = this.client.db();
    await this.database.command({ ping: 1 });
    console.log(`Connected to MongoDB database "${this.database.databaseName}"`);
  }
  async onModuleDestroy() { if (this.client) await this.client.close(); }
  collection(name: string): Collection {
    if (!this.database) throw new ServiceUnavailableException('Database is not connected');
    return this.database.collection(name);
  }
  async counts() {
    const names = ['departments','districts','blocks','offices','designations','employees'];
    const entries = await Promise.all(names.map(async name => [name, await this.collection(name).countDocuments()] as const));
    return Object.fromEntries(entries);
  }
}
