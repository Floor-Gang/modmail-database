import { Category } from '@Floor-Gang/modmail-types';
import { DBCategory } from '../models/types';
import { PoolClient } from 'pg';
import { SnowflakeUtil } from 'discord.js';
import Table from '../models/table';
import {
  CategoryResolvable,
  CreateCategoryOpt,
} from '../models/types';

export default class CategoriesTable extends Table {
  constructor(pool: PoolClient) {
    super(pool, 'categories');
  }

  /**
   * Handles added attachments and sends them.
   * @method create
   * @param {CreateCategoryOpt} opt Required options for a new category
   * @returns {Promise<Category>}
   */
  public async create(opt: CreateCategoryOpt): Promise<Category> {
    const categoryID = SnowflakeUtil.generate(Date.now());
    const {
      name,
      guildID,
      emote,
      channelID,
    } = opt;
    await this.pool.query(
      `INSERT INTO modmail.categories (id, name, guild_id, emote, channel_id)
       VALUES ($1, $2, $3, $4, $5)`,
      [categoryID, name, guildID, emote, channelID],
    );

    return {
      channelID,
      emojiID: emote,
      guildID,
      id: categoryID,
      isActive: true,
      name,
    };
  }

  /**
   * Set the activity of a category based on a provided emote.
   * @param {string} id
   * @param {boolean} active
   * @returns {Promise<boolean>}
   */
  public async setActive(id: string, active: boolean): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE modmail.categories
       SET is_active=$2
       WHERE id = $1`,
      [id, active],
    );

    return res.rowCount !== 0;
  }

  /**
   * Set a unique emote for a given category.
   * @param {string} id Category identifier
   * @param {string} emote New unique emote
   * @returns {Promise<boolean>} Whether or not something changed
   */
  public async setEmote(id: string, emote: string): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE modmail.categories
       SET emote = $1
       WHERE id = $2`,
      [emote, id],
    );

    return res.rowCount !== 0;
  }

  /**
   * Set a unique name for a given category.
   * @param {string} id Targeted category
   * @param {string} name A new unique name
   * @returns {Promise<boolean>}
   */
  public async setName(id: string, name: string): Promise<boolean> {
    const res = await this.pool.query(
      `UPDATE modmail.categories
       SET name = $1
       WHERE id = $2`,
      [name, id],
    );

    return res.rowCount !== 0;
  }

  /**
   * @method fetchAll
   * @param {CategoryResolvable} by
   * @param {string} id
   * @returns {Promise<Category[]>}
   */
  public async fetchAll(by: CategoryResolvable, id: string): Promise<Category[]> {
    const target = CategoriesTable.resolve(by);
    let parsed: null | boolean = null;

    if (by === CategoryResolvable.activity) {
      parsed = id === 'true';
    }

    const res = await this.pool.query(
      `SELECT * FROM modmail.categories WHERE ${target} = $1`,
      [parsed || id],
    );

    if (res.rowCount === 0) {
      return [];
    }

    return res.rows.map(CategoriesTable.parse);
  }

  /**
   * @method fetch
   * @param {CategoryResolvable} by
   * @param {string} id
   * @returns {Promise<Category | null>}
   */
  public async fetch(by: CategoryResolvable, id: string): Promise<Category | null> {
    const res = await this.fetchAll(by, id);

    if (res.length === 0) {
      return null;
    }

    return res[0];
  }

  /**
   * Initialize the categories table if it doesn't exist
   */
  protected async init(): Promise<void> {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS modmail.categories
       (
           id         BIGINT               NOT NULL
               CONSTRAINT categories_pk PRIMARY KEY,
           channel_id BIGINT UNIQUE        NOT NULL,
           name       TEXT                 NOT NULL,
           is_active  BOOLEAN DEFAULT true NOT NULL,
           guild_id   BIGINT               NOT NULL,
           emote      TEXT                 NOT NULL
       );`,
    );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS categories_emote_uindex ON modmail.categories (emote);`,
    );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS categories_id_uindex ON modmail.categories (id);`,
    );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS categories_name_uindex ON modmail.categories (name);`,
    );
  }

  /**
   * @param {CategoryResolvable} resolvable
   * @returns {string}
   */
  private static resolve(resolvable: CategoryResolvable): string {
    switch (resolvable) {
      case CategoryResolvable.name:
        return 'name';
      case CategoryResolvable.channel:
        return 'channel_id';
      case CategoryResolvable.emote:
        return 'emote';
      case CategoryResolvable.activity:
        return 'is_active';
      case CategoryResolvable.id:
        return 'id';
      case CategoryResolvable.guild:
        return 'guild_id';
      default:
        throw new Error('An invalid resolvable was provided.');
    }
  }

  /**
   * @method parse
   * @param {DBCategory} data
   * @returns {Category}
   */
  private static parse(data: DBCategory): Category {
    return {
      channelID: data.channel_id.toString(),
      emojiID: data.emote,
      guildID: data.guild_id.toString(),
      id: data.id.toString(),
      isActive: data.is_active,
      name: data.name,
    };
  }
}
