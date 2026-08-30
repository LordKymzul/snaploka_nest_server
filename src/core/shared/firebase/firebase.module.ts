import { Module, Global } from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { FirebaseController } from './firebase.controller';
import { Config } from 'src/core/util/config';
import {
  initializeApp,
  getApps,
  getApp,
  cert
} from 'firebase-admin/app';

@Global()
@Module({
  controllers: [FirebaseController],
  providers: [
    Config,
    {
      provide: 'FIREBASE_ADMIN',
      inject: [Config],
      useFactory: (config: Config) => {
        if (!getApps().length) {
          const firebaseConfig = config.getFirebaseConfig();

          return initializeApp({
            credential: cert({
              projectId: firebaseConfig.projectId,
              clientEmail: firebaseConfig.clientEmail,
              privateKey: firebaseConfig.privateKey?.replace(/\\n/g, '\n'),
            }),
            storageBucket: firebaseConfig.storageBucket,
          });
        }
        return getApp();
      },
    },
    FirebaseService,
  ],
  exports: ['FIREBASE_ADMIN', FirebaseService],
})
export class FirebaseModule { }
