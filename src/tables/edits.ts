import { PoolClient } from 'pg';
import { Edit } from 'modmail-types';
import Table from '../models/table';

export default class EditManager extends Table {
  constructor(pool: PoolClient) {
    super(pool, 'edits');
  }

  public async add(edit: Edit): Promise<number> {
    const version = await this.pool.query(
      'WITH last_version (num) AS ('
      + 'SELECT coalesce('
      + `(SELECT version FROM ${this.name}`
      + ' WHERE message = $2 ORDER BY version DESC LIMIT 1), 0)'
      + `) INSERT INTO ${this.name} (content, message, version)`
      + ' VALUES ($1, $2, (SELECT num FROM last_version) + 1)'
      + ' RETURNING version;',
      [edit.content, edit.message],
    );

    return version.rows[0].version;
  }

  /**
   * Initialize the edits table
   */
  protected async init(): Promise<void> {
    await this.pool.query(
      `CREATE TABLE IF NOT EXISTS ${this.name} (`
      + ' content text not null,'
      + ' message bigint not null'
      + '   constraint edits_messages_modmail_id_fk'
      + '     references modmail.messages (modmail_id),'
      + ' version integer default 1 not null)',
    );
  }
}
