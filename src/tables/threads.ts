import { Thread } from '@Floor-Gang/modmail-types';
import { DBThread } from '../models/types';
import { SnowflakeUtil } from 'discord.js';
import { PoolClient } from 'pg';
import Table from '../models/table';

export default class ThreadsTable extends Table {
  constructor(pool: PoolClient) {
    super(pool, 'threads');
  }

  /**
   * Mark a thread a closed
   * @method close
   * @param {string} id
   * @returns {Promise<boolean>}
   */
  public async close(id: string): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE ${this.name} SET is_active = false WHERE channel = $1`,
      [id],
    );

    return res.rowCount !== 0;
  }

  /**
   * @param {string} author
   * @param {string} channelID
   * @param {string} categoryID
   * @returns {Promise<Thread>}
   */
  public async open(
    author: string,
    channelID: string,
    categoryID: string,
  ): Promise<Thread> {
    const threadID = SnowflakeUtil.generate(Date.now());
    await this.pool.query(
      `INSERT INTO ${this.name} (id, author, channel, category)`
      + ' VALUES ($1, $2, $3, $4)',
      [threadID, author, channelID, categoryID],
    );

    return {
      author: {
        id: author,
      },
      channel: channelID,
      category: categoryID,
      id: threadID,
      isActive: true,
      messages: [],
    };
  }

  /**
   * Count the number of past threads for a user
   * @param {string} user
   * @returns {Promise<number>}
   */
  public async countUser(user: string): Promise<number> {
    const res = await this.pool.query(
      `SELECT COUNT(*) FROM ${this.name} WHERE author = $1 AND is_active = false`,
      [user],
    );

    return res.rows[0].count;
  }

  public async countCategory(category: string): Promise<number> {
    const res = await this.pool.query(
      `SELECT COUNT(*) FROM ${this.name} WHERE category = $1 AND is_active = true`,
    );

    return res.rows[0].count;
  }

  public async getByUser(userID: string): Promise<Thread | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.name} WHERE author = $1 AND is_active = true LIMIT 1`,
      [userID],
    );

    if (res.rowCount === 0) {
      return null;
    }

    return ThreadsTable.parse(res.rows[0]);
  }

  /**
   * @param {string} user
   * @returns {Promise<Thread | null>} if thread was found
   */
  public async getCurrentThread(user: string): Promise<Thread | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.name} WHERE author = $1 AND is_active = true LIMIT 1`,
      [user],
    );
    if (res.rowCount === 0) {
      return null;
    }

    return ThreadsTable.parse(res.rows[0]);
  }

  /**
   * @param {string} channelID
   * @returns {Promise<Thread | null>}
   */
  public async getByChannel(channelID: string): Promise<Thread | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.name} WHERE channel = $1 AND is_active = true LIMIT 1`,
      [channelID],
    );

    if (res.rowCount === 0) {
      return null;
    }

    return ThreadsTable.parse(res.rows[0]);
  }

  /**
   * Get all threads by category ID
   * @param {string} catID Category ID
   * @returns {Promise<Thread[]>}
   */
  public async getByCategory(catID: string): Promise<Thread[]> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.name} WHERE category = $1 ORDER BY id DESC`,
      [catID],
    );

    return res.rows.map((data) => ThreadsTable.parse(data));
  }

  /**
   * Get a single thread by ID
   * @param {string} threadID
   * @returns {Promise<Thread | null>}
   */
  public async getByID(threadID: string): Promise<Thread | null> {
    const res = await this.pool.query(
      `SELECT * FROM ${this.name} WHERE id = $1`,
      [threadID],
    );

    if (res.rowCount === 0) {
      return null;
    }

    return ThreadsTable.parse(res.rows[0]);
  }

  /**
   * Initialize threads table
   */
  protected async init(): Promise<void> {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS ${this.name} (`
      + ' id bigint not null'
      + '   constraint threads_pk primary key,'
      + ' author bigint not null'
      + '   constraint threads_users_id_fk'
      + '   references modmail.users,'
      + ' channel bigint not null,'
      + ' is_active boolean default true not null,'
      + ' category bigint not null'
      + '   constraint threads_categories_id_fk'
      + '   references modmail.categories);',
    );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS threads_channel_uindex ON ${this.name} (channel);`,
    );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS threads_channel_uindex_2 ON ${this.name} (channel);`,
    );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS threads_id_uindex ON ${this.name} (id);`,
    );
  }

  private static parse(data: DBThread): Thread {
    return {
      author: { id: data.author },
      channel: data.channel.toString(),
      id: data.id.toString(),
      isActive: data.is_active,
      messages: [],
      category: data.category.toString(),
    };
  }

  public async updateThread(
    threadID: string,
    channelID: string,
    categoryID: string,
  ): Promise<void> {
    await this.pool.query(
      'UPDATE modmail.threads SET channel = $1, category = $2 WHERE id = $3',
      [channelID, categoryID, threadID],
    );
  }
}
