import {
    Inject,
    Injectable
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
}
