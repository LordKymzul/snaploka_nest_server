import { SignInDto } from "../dto/sign-in.dto";

export class LoginEvent {
    constructor(
        public readonly signInDto: SignInDto,
        public readonly ipAddress: string,
        public readonly isSuccess: boolean,
        public readonly userId?: string | null,
        public readonly userAgent?: string,
        public readonly failureReason?: string,
    ) { }
}