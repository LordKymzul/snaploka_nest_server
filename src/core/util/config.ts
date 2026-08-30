import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";


@Injectable()
export class Config {
    constructor(private readonly configService: ConfigService) { }

    getPrismaConfig() {
        return {
            url: this.configService.get('DATABASE_URL'),
        }
    }

    getJwtConfig() {
        return {
            secret: this.configService.get('JWT_SECRET_KEY'),
            refreshSecret: this.configService.get('JWT_REFRESH_SECRET_KEY'),
        }
    }

    getPortConfig() {
        return {
            port: this.configService.get('PORT'),
        }
    }


    getFirebaseConfig() {
        return {
            projectId: this.configService.get('FIREBASE_PROJECT_ID'),
            clientEmail: this.configService.get('FIREBASE_CLIENT_EMAIL'),
            privateKey: this.configService.get('FIREBASE_PRIVATE_KEY'),
            type: this.configService.get('FIREBASE_TYPE'),
            privateKeyId: this.configService.get('FIREBASE_PRIVATE_KEY_ID'),
            storageBucket: this.configService.get('FIREBASE_STORAGE_BUCKET'),
        }
    }

    getSnaplokaApiKey() {
        return this.configService.get('SNAPLOKA_API_KEY');
    }

    getCurrentAcademicPeriod() {
        return {
            year: Number(this.configService.get('CURRENT_YEAR')),
            semester: Number(this.configService.get('CURRENT_SEMESTER')),
        }
    }

    getRedisConfig() {
        return {
            host: this.configService.get('REDIS_HOST'),
            port: parseInt(this.configService.get('REDIS_PORT') || '6379'),
            password: this.configService.get('REDIS_PASSWORD') || '',
            url: this.configService.get('REDIS_URL'),
        }
    }


    getBaseUrl() {
        return this.configService.get('BASE_URL');
    }

    getStripeConfig() {
        return {
            secretKey: this.configService.get('STRIPE_SECRET_KEY'),
            publishableKey: this.configService.get('STRIPE_PUBLISHABLE_KEY'),
            webhookSecret: this.configService.get('STRIPE_WEBHOOK_SECRET'),
        }
    }
}