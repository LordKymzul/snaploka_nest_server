import { BadRequestException, Injectable } from '@nestjs/common';
import { FirebaseService } from 'src/core/shared/firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';
import { PresignedUrlResponseDto } from './dto/presigned-url-response.dto';
import { EventMediaEntity } from './entities/event_media.entity';

@Injectable()
export class EventMediaStorageService {
    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async generateUploadPresignedUrl(eventId: string, mimeType: string, fileSizeBytes: number): Promise<PresignedUrlResponseDto> {

        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException('Unsupported file format');
        }

        const fileExtension = mimeType.split('/')[1] || 'jpg';
        const storageKey = `events/${eventId}/${uuidv4()}.${fileExtension}`;
        const file = this.firebaseService.getStorage().bucket().file(storageKey);

        const expiresAt = Date.now() + 15 * 60 * 1000;

        const [uploadUrl] = await file.getSignedUrl({
            version: 'v4',
            action: 'write',
            expires: expiresAt,
            contentType: mimeType,
        });

        return { upload_url: uploadUrl, storage_key: storageKey };
    }


    getMediaUrl(storageKey: string): string {
        return this.firebaseService.getStorage().bucket().file(storageKey).publicUrl();
    }
}