import { BadRequestException, Injectable } from "@nestjs/common";
import { DbappService } from "src/core/database/dbapp/dbapp.service";
import { PAGINATION_LIMIT, PAGINATION_PAGE } from "src/core/util/constant";
import { QueryEventPostDto } from "./dto/query-event_post.dto";
import { EventPostEntity } from "./entities/event_post.entity";

@Injectable()
export class EventPostRepository {
    constructor(private readonly dbapp: DbappService) { }

    async create(data: {
        eventInternalId: number;
        guest_name?: string;
        content?: string;
        attachments?: Array<{
            mime_type: string;
            storage_key: string;
            file_size_bytes: number;
        }>;
    }): Promise<string> {
        return this.dbapp.$transaction(async (tx) => {
            const results = await tx.$queryRaw<Array<{ id: string; internal_id: number }>>`
                INSERT INTO event_posts (
                    guest_name,
                    content,
                    event_id
                )
                VALUES (
                    ${data.guest_name ?? 'Anonymous Guest'},
                    ${data.content ?? null},
                    ${data.eventInternalId}
                )
                RETURNING guid as id, id as internal_id
            `;

            if (!results || results.length === 0) {
                throw new BadRequestException('Failed to create event post');
            }

            const post = results[0];

            if (data.attachments?.length) {
                for (const attachment of data.attachments) {
                    await tx.$queryRaw`
                        INSERT INTO event_attachments (
                            event_post_id,
                            mime_type,
                            storage_key,
                            file_size_bytes
                        )
                        VALUES (
                            ${post.internal_id},
                            ${attachment.mime_type},
                            ${attachment.storage_key},
                            ${BigInt(attachment.file_size_bytes)}
                        )
                    `;
                }
            }

            return post.id;
        });
    }

    async findAll(queryEventPostDto: QueryEventPostDto): Promise<{
        total: number;
        eventPosts: EventPostEntity[];
        page: number;
        limit: number;
    }> {
        const { event_id, page, limit, with_event } = queryEventPostDto;
        const includeEvent = with_event === 'true';

        const pageNum = Number(page || PAGINATION_PAGE);
        const limitNum = Number(limit || PAGINATION_LIMIT);
        const skip = (pageNum - PAGINATION_PAGE) * limitNum;
        const take = limitNum;

        const whereConditions: string[] = [];
        const queryParams: any[] = [];
        let paramIndex = 1;

        if (event_id) {
            whereConditions.push(`e.guid = $${paramIndex}`);
            queryParams.push(event_id);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        const eventSelect = includeEvent
            ? `,
                e.guid as event_guid,
                e.name as event_name,
                e.description as event_description,
                e.status as event_status,
                e.type as event_type,
                e.start_date as event_start_date,
                e.end_date as event_end_date,
                e.max_media_allowed as event_max_media_allowed,
                e.max_storage_bytes as event_max_storage_bytes,
                e.current_media_count as event_current_media_count,
                e.current_storage_bytes as event_current_storage_bytes,
                e.metadata as event_metadata,
                e.created_at as event_created_at,
                e.updated_at as event_updated_at,
                e.access_mode as event_access_mode,
                e.thumbnail_storage_key as event_thumbnail_storage_key,
                e.thumbnail_mime_type as event_thumbnail_mime_type,
                e.thumbnail_file_size as event_thumbnail_file_size,
                u.guid as event_user_id
            `
            : '';

        const userJoin = includeEvent
            ? 'INNER JOIN users u ON u.id = e.user_id'
            : '';

        const query = `
            SELECT
                ep.guid as id,
                ep.guest_name,
                ep.content,
                ep.metadata,
                e.guid as event_id,
                ep.created_at,
                ep.updated_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'guid', ea.guid,
                            'mime_type', ea.mime_type,
                            'storage_key', ea.storage_key,
                            'file_size_bytes', ea.file_size_bytes,
                            'status', ea.status,
                            'metadata', ea.metadata,
                            'created_at', ea.created_at,
                            'updated_at', ea.updated_at,
                            'event_post_id', ep.guid
                        )
                        ORDER BY ea.created_at ASC
                    ) FILTER (WHERE ea.id IS NOT NULL),
                    '[]'::json
                ) AS attachments
                ${eventSelect}
            FROM event_posts ep
            INNER JOIN events e ON e.id = ep.event_id
            LEFT JOIN event_attachments ea ON ea.event_post_id = ep.id
            ${userJoin}
            ${whereClause}
            GROUP BY ep.id, e.id${includeEvent ? ', u.id' : ''}
            ORDER BY ep.created_at DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        queryParams.push(take, skip);

        const countQuery = `
            SELECT COUNT(*)::int as total
            FROM event_posts ep
            INNER JOIN events e ON e.id = ep.event_id
            ${whereClause}
        `;

        const countParams = queryParams.slice(0, -2);

        const [totalResult, rows] = await Promise.all([
            this.dbapp.$queryRawUnsafe<any[]>(countQuery, ...countParams),
            this.dbapp.$queryRawUnsafe<any[]>(query, ...queryParams),
        ]);

        return {
            total: totalResult[0]?.total || 0,
            eventPosts: rows.map((row) => this.mapToEntity(row, includeEvent)),
            page: pageNum,
            limit: limitNum,
        };
    }

    async findOneByGuid(guid: string, withEvent = false): Promise<EventPostEntity | null> {
        const results = await this.dbapp.$queryRawUnsafe<any[]>(
            `
            SELECT
                ep.guid as id,
                ep.guest_name,
                ep.content,
                ep.metadata,
                e.guid as event_id,
                ep.created_at,
                ep.updated_at,
                COALESCE(
                    json_agg(
                        json_build_object(
                            'guid', ea.guid,
                            'mime_type', ea.mime_type,
                            'storage_key', ea.storage_key,
                            'file_size_bytes', ea.file_size_bytes,
                            'status', ea.status,
                            'metadata', ea.metadata,
                            'created_at', ea.created_at,
                            'updated_at', ea.updated_at,
                            'event_post_id', ep.guid
                        )
                        ORDER BY ea.created_at ASC
                    ) FILTER (WHERE ea.id IS NOT NULL),
                    '[]'::json
                ) AS attachments
                ${withEvent ? `,
                e.guid as event_guid,
                e.name as event_name,
                e.description as event_description,
                e.status as event_status,
                e.type as event_type,
                e.start_date as event_start_date,
                e.end_date as event_end_date,
                e.max_media_allowed as event_max_media_allowed,
                e.max_storage_bytes as event_max_storage_bytes,
                e.current_media_count as event_current_media_count,
                e.current_storage_bytes as event_current_storage_bytes,
                e.metadata as event_metadata,
                e.created_at as event_created_at,
                e.updated_at as event_updated_at,
                e.access_mode as event_access_mode,
                e.thumbnail_storage_key as event_thumbnail_storage_key,
                e.thumbnail_mime_type as event_thumbnail_mime_type,
                e.thumbnail_file_size as event_thumbnail_file_size,
                u.guid as event_user_id
                ` : ''}
            FROM event_posts ep
            INNER JOIN events e ON e.id = ep.event_id
            LEFT JOIN event_attachments ea ON ea.event_post_id = ep.id
            ${withEvent ? 'INNER JOIN users u ON u.id = e.user_id' : ''}
            WHERE ep.guid = $1
            GROUP BY ep.id, e.id${withEvent ? ', u.id' : ''}
            LIMIT 1
            `,
            guid,
        );

        return results.length > 0 ? this.mapToEntity(results[0], withEvent) : null;
    }

    mapToEntity(row: any, withEvent = false): EventPostEntity {
        const attachments = this.parseAttachments(row.attachments);

        return EventPostEntity.fromDBApplication({
            id: row.id,
            guest_name: row.guest_name,
            content: row.content,
            metadata: row.metadata,
            event_id: row.event_id,
            created_at: row.created_at,
            updated_at: row.updated_at,
            attachments,
            ...(withEvent && {
                event: {
                    guid: row.event_guid ?? row.event_id,
                    name: row.event_name,
                    description: row.event_description,
                    status: row.event_status,
                    type: row.event_type,
                    start_date: row.event_start_date,
                    end_date: row.event_end_date,
                    max_media_allowed: row.event_max_media_allowed,
                    max_storage_bytes: row.event_max_storage_bytes,
                    current_media_count: row.event_current_media_count,
                    current_storage_bytes: row.event_current_storage_bytes,
                    metadata: row.event_metadata,
                    created_at: row.event_created_at,
                    updated_at: row.event_updated_at,
                    access_mode: row.event_access_mode,
                    thumbnail_storage_key: row.event_thumbnail_storage_key,
                    thumbnail_mime_type: row.event_thumbnail_mime_type,
                    thumbnail_file_size: row.event_thumbnail_file_size,
                    user_id: row.event_user_id,
                },
            }),
        });
    }

    private parseAttachments(value: any): any[] {
        if (!value) {
            return [];
        }

        const attachments = typeof value === 'string' ? JSON.parse(value) : value;
        if (!Array.isArray(attachments)) {
            return [];
        }

        return attachments.map((attachment) => ({
            ...attachment,
            file_size_bytes: attachment.file_size_bytes != null
                ? Number(attachment.file_size_bytes)
                : attachment.file_size_bytes,
        }));
    }
}
