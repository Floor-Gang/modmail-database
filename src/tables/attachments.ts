import { FileType } from '@Floor-Gang/modmail-types';
import { SnowflakeUtil } from 'discord.js';
import { PoolClient } from 'pg';
import Table from '../models/table';
import { CreateAttachmentOpt } from '../models/types';

export default class AttachmentsTable extends Table {
  constructor(pool: PoolClient) {
    super(pool, 'attachments');
  }

  /**
  * @param {CreateAttachmentOpt} opt
  */
  public async create(opt: CreateAttachmentOpt): Promise<void> {
    const id = SnowflakeUtil.generate(Date.now());
    const type = opt.type === FileType.Image ? 'image' : 'file';
    await this.pool.query(
      `INSERT INTO modmail.attachments (id, message_id, name, source, sender, type)
       VALUES ($1, $2, $3, $4, $5, $6);`,
      [id, opt.messageID, opt.name, opt.source, opt.sender, type],
    );
  }

  /**
   * Initialize attachments table
   */
  protected async init(): Promise<void> {
    await this.pool.query(
`CREATE TABLE IF NOT EXISTS modmail.attachments
(
    id         BIGINT                                                NOT NULL
    CONSTRAINT attachments_pk PRIMARY KEY,
    message_id BIGINT                                                NOT NULL
    CONSTRAINT attachments_messages_modmail_id_fk
    REFERENCES modmail.messages (modmail_id),
    name       TEXT                                                  NOT NULL,
    source     TEXT                                                  NOT NULL,
    sender     BIGINT                                                NOT NULL
    CONSTRAINT attachments_users_id_fk
    REFERENCES modmail.users,
    TYPE       modmail.file_type DEFAULT 'file' :: modmail.file_type NOT NULL
);`,
      );

    await this.pool.query(
      `CREATE UNIQUE INDEX IF NOT EXISTS attachments_id_uindex ON modmail.attachments (id);`,
    );
  }
}
