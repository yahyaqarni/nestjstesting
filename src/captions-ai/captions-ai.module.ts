import { Module } from '@nestjs/common';
import { CaptionsAiController } from './captions-ai.controller';
import { CaptionsAiService } from './captions-ai.service';

@Module({
  controllers: [CaptionsAiController],
  providers: [CaptionsAiService]
})
export class CaptionsAiModule {}
