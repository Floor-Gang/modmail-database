/* eslint-disable no-shadow */
import { FileType } from '@Floor-Gang/modmail-types';

/**
 * CreateCategoryOpt is used by ICategoryManager.create()
 * @type CreateCategoryOpt
 * @property {string} name New category name
 * @property {string?} description Optional description
 * @property {string} guildID Category guild
 * @property {string} emoji A unique emote assigned to the category
 * @property {string} channelID Channel category ID to utilize
 */
export type CreateCategoryOpt = {
    name: string,
    description?: string,
    guildID: string,
    emoji: string,
    channelID: string,
}

/**
 * CreateAttachmentOpt is used by IAttachmentManger.create()
 * @type CreateAttachmentOpt
 * @property {string} messageID
 * @property {string} name
 * @property {string} source
 * @property {string} sender
 * @property {string} type
 */
export type CreateAttachmentOpt = {
    messageID: string,
    name: string,
    source: string,
    sender: string,
    type: FileType,
}

export type DBAttachment = {
    id: number,
    message_id: number,
    name: string,
    source: string,
    sender: number,
    type: string,
}

export type DBCategory = {
    is_active: boolean,
    channel_id: number | null,
    emoji: string,
    description: string,
    guild_id: number,
    id: number,
    name: string,
}

export type DBMessage = {
    content: string,
    client_id: number | null,
    is_deleted: boolean,
    modmail_id: number,
    sender: number,
    thread_id: number,
    internal: boolean
}

export type DBThread = {
    author: string,
    channel: number,
    id: number,
    is_admin_only: boolean,
    is_active: boolean,
    category: number,
}

export type DBMuteStatus = {
    user_id: number,
    till: number,
    category_id: number,
    reason: string,
}

export type DBStandardReply = {
    reply: string,
    name: string,
    id: bigint,
}

export type DBRole = {
    category_id: number,
    role_id: number,
    level: string,
}
