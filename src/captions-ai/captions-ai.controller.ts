import { Body, Controller, Get } from '@nestjs/common';
import { CaptionsAiService } from './captions-ai.service';
import { TextDto } from './dto/text.dto';

@Controller('captions-ai')
export class CaptionsAiController {
  constructor(private readonly captionsAiService: CaptionsAiService) {}

  @Get('generate')
  generateCaptions(@Body() text: string) {
    return this.captionsAiService.generateCaptions(text);
  }

  @Get('split')
  splitText(@Body() dto: TextDto) {
    console.log(dto.text, 'Type:', typeof dto.text);
    return this.captionsAiService.splitText(dto.text);
  }
}
