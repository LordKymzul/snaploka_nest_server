import { Module } from '@nestjs/common';
import { IdentityModule } from './identity/identity.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { EngagementModule } from './engagement/engagement.module';

@Module({
  imports: [IdentityModule, SubscriptionModule, EngagementModule]
})
export class ModulesModule { }
