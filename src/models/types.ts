/* eslint-disable no-shadow */
import { FileType } from 'modmail-types';

/**
 * CreateCategoryOpt is used by ICategoryManager.create()
 * @type CreateCategoryOpt
 * @property {string} name New category name
 * @property {string} guildID Category guild
 * @property {string} emote A unique emote assigned to the category
 * @property {string} channelID Channel category ID to utilize
 */
export type CreateCategoryOpt = {
    name: string,
    guildID: string,
    emote: string,
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

/**
 * CreateStandardReplyOpt is ued my IStandardRepliesManager.create()
 * @type CreateStandardReplyOpt
 * @property {string} name
 * @property {string} reply
 */
export type CreateStandardReplyOpt = {
    name: string,
    reply: string
}

/**
 * Fetch a category by any of the following
 * @enum CategoryResolvable
 */
export enum CategoryResolvable {
    activity,
    name,
    guild,
    emote,
    channel,
    id,
}

export type DBCategory = {
    is_active: boolean,
    channel_id: number,
    emote: string,
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
