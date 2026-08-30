import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { EventMediaModule } from './event_media/event_media.module';

@Module({
  imports: [EventModule, EventMediaModule]
})
export class EngagementModule {}
