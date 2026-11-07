import { Module } from '@nestjs/common';
import { GuestService } from './guest.service';
import { GuestController } from './guest.controller';
import { EventModule } from '../engagement/event/event.module';
import { EventMediaModule } from '../engagement/event_media/event_media.module';
import { DbappModule } from 'src/core/database/dbapp/dbapp.module';
import { EventNoteModule } from '../engagement/event_note/event_note.module';
import { EventBankAccountModule } from '../engagement/event_bank_account/event_bank_account.module';
import { EventPostModule } from '../engagement/event_post/event_post.module';

@Module({
  imports: [
    DbappModule,
    EventModule,
    EventMediaModule,
    EventNoteModule,
    EventBankAccountModule,
    EventPostModule,
  ],
  controllers: [GuestController],
  providers: [GuestService],
})
export class GuestModule { }
