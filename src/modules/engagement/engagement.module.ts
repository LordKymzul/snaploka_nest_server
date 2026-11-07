import { Module } from '@nestjs/common';
import { EventModule } from './event/event.module';
import { EventMediaModule } from './event_media/event_media.module';
import { EventNoteModule } from './event_note/event_note.module';
import { EventBankAccountModule } from './event_bank_account/event_bank_account.module';
import { EventPostModule } from './event_post/event_post.module';

@Module({
  imports: [EventModule, EventMediaModule, EventNoteModule, EventBankAccountModule, EventPostModule]
})
export class EngagementModule {}
