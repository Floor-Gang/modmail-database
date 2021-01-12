import { PoolClient } from 'pg';

/**
 * Table represents a table in the database which is used by DatabaseManager
 */
export default class Table {
    protected readonly pool: PoolClient;

    protected readonly name: string;

    constructor(pool: PoolClient, name: string) {
      this.pool = pool;
      this.name = `modmail.${name}`;
    }

    /**
     * This is called by the constructor, if the table exists then make sure
     * it doesn't need to be migrated. Otherwise create the table
     * @returns {Promise<void>}
     */
    public async validate(): Promise<void> {
      const res = await this.pool.query(
        'SELECT * FROM information_schema.tables'
        + ' WHERE table_schema=$1'
        + '   AND table_name = $2',
        ['modmail', this.name],
      );

      if (res.rowCount === 0) {
        await this.init();
      } else {
        await this.migrate();
      }
    }

    /**
     * Alter existing tables if needed
     * @returns {Promise<void>}
     */
    protected async migrate(): Promise<void> { }

    /**
     * Initialize the table if it doesn't exist
     * @returns {Promise<void>}
     */
    protected async init(): Promise<void> {
      throw new Error(`Table init for ${this.name} has not been implemented.`);
    }
}
