import {
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from '@nestjs/common';
import { App } from 'firebase-admin/app';
import {
    getStorage,
    Storage,
} from 'firebase-admin/storage';
import {
    getMessaging,
    Messaging,
} from 'firebase-admin/messaging';
import {
    getAuth,
    Auth,
} from 'firebase-admin/auth';

@Injectable()
export class FirebaseService {
    constructor(
        @Inject('FIREBASE_ADMIN') private readonly admin: App,
    ) { }

    getStorage(): Storage {
        return getStorage(this.admin);
    }

    getMessaging(): Messaging {
        return getMessaging(this.admin);
    }

    getAuth(): Auth {
        return getAuth(this.admin);
    }

    // async verifyIdToken(token: string): Promise<DecodedIdToken> {
    //     try {
    //         return await this.getAuth().verifyIdToken(token);
    //     } catch (error) {
    //         throw new UnauthorizedException('Invalid token');
    //     }
    // }

    // async getUserByUid(uid: string): Promise<UserRecord> {
    //     try {
    //         return await this.getAuth().getUser(uid);
    //     } catch (error) {
    //         throw new NotFoundException('User not found');
    //     }
    // }
}
