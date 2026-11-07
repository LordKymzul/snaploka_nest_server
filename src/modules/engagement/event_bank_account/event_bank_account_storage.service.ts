import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { FirebaseService } from 'src/core/shared/firebase/firebase.service';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class EventBankAccountStorageService {

    private readonly logger = new Logger(EventBankAccountStorageService.name);

    constructor(
        private readonly firebaseService: FirebaseService,
    ) { }

    async generateUploadPresignedUrl(eventBankAccountId: string, mimeType: string, fileSizeBytes: number) {
        this.logger.log(`Generating upload presigned URL for event bank account ${eventBankAccountId} with mime type ${mimeType} and file size ${fileSizeBytes}`);
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic'];
        if (!allowedMimeTypes.includes(mimeType)) {
            throw new BadRequestException('Unsupported file format');
        }

        const fileExtension = mimeType.split('/')[1] || 'jpg';
        const storageKey = `event-bank-accounts/${eventBankAccountId}/qr-code/${uuidv4()}.${fileExtension}`;
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


    async deleteMedia(storageKey: string): Promise<void> {
        this.logger.log(`Deleting media from storage for storage key ${storageKey}`);
        const file = this.firebaseService.getStorage().bucket().file(storageKey);
        if (!file) {
            throw new NotFoundException('QR code not found');
        }
        await file.delete();
        this.logger.log(`Deleted QR code from storage for storage key ${storageKey}`);
    }
}