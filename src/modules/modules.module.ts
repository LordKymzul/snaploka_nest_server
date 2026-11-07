import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EngagementModule } from './engagement/engagement.module';
import { GuestModule } from './guest/guest.module';

@Module({
  imports: [IdentityModule, SubscriptionModule, EngagementModule, GuestModule]
})
export class ModulesModule { }
