import AttachmentManager from './tables/attachments';
import CategoryManager from './tables/categories';
import EditManager from './tables/edits';
import MessageManager from './tables/messages';
import MuteManager from './tables/mutes';
import PermsManager from './tables/permissions';
import StandardReplyManager from './tables/standardReplies';
import ThreadManager from './tables/threads';
import UsersManager from './tables/users';
import {
  Pool,
  PoolClient,
  PoolConfig,
} from 'pg';

export default class DatabaseManager {
    public readonly edits: EditManager;

    public readonly messages: MessageManager;

    public readonly mutes: MuteManager;

    public readonly threads: ThreadManager;

    public readonly users: UsersManager;

    public readonly categories: CategoryManager;

    public readonly attachments: AttachmentManager;

    public readonly standardReplies: StandardReplyManager;

    public readonly permissions: PermsManager;

    private readonly pool: PoolClient;

    constructor(pool: PoolClient) {
      this.edits = new EditManager(pool);
      this.messages = new MessageManager(pool);
      this.mutes = new MuteManager(pool);
      this.threads = new ThreadManager(pool);
      this.users = new UsersManager(pool);
      this.categories = new CategoryManager(pool);
      this.attachments = new AttachmentManager(pool);
      this.standardReplies = new StandardReplyManager(pool);
      this.permissions = new PermsManager(pool);
      this.pool = pool;
    }

    public static async getDB(config: PoolConfig): Promise<DatabaseManager> {
      const pool = new Pool(config);

      const poolClient = await pool.connect();
      const db = new DatabaseManager(poolClient);
      const tasks: Promise<void>[] = [];

      // Initialize schema and enums
      await db.init();
      // Initialie users first
      await db.users.validate();
      // Initialize categories second
      await db.categories.validate();
      // Intiialize threads third
      await db.threads.validate();
      // Initialize messages fourth
      await db.messages.validate();

      // Initialize everything else
      tasks.push(db.attachments.validate());
      tasks.push(db.edits.validate());
      tasks.push(db.mutes.validate());
      tasks.push(db.permissions.validate());
      tasks.push(db.standardReplies.validate());

      await Promise.all(tasks);
      return db;
    }

    public async init(): Promise<void> {
      await this.pool.query(
        `CREATE SCHEMA IF NOT EXISTS modmail`,
      );

      await this.pool.query(
        `CREATE TYPE modmail.file_type AS ENUM ('image', 'file');`,
      );

      await this.pool.query(
        `CREATE TYPE modmail.role_level AS ENUM ('admin', 'mod');`,
      );
    }
}


export * from './tables/attachments';
export * from './tables/categories';
export * from './tables/edits';
export * from './tables/messages';
export * from './tables/mutes';
export * from './tables/permissions';
export * from './tables/standardReplies';
export * from './tables/threads';
export * from './tables/users';
