import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CaptionsAiService } from './captions-ai.service';
import { TextDto } from './dto/text.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('captions-ai')
export class CaptionsAiController {
  constructor(private readonly captionsAiService: CaptionsAiService) {}

  @Get('generate')
  generateCaptions(@Body() dto: TextDto) {
    return this.captionsAiService.generateCaptions(dto.text);
  }

  @Get('split')
  splitText(@Body() dto: TextDto) {
    console.log(dto.text, 'Type:', typeof dto.text);
    return this.captionsAiService.splitText(dto.text);
  }

  @Post('transcribe')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${Date.now()}${ext}`);
        },
      }),
    }),
  )
  async transcribeAudio(@UploadedFile() audio: Express.Multer.File) {
    if (!audio) {
      throw new Error('No audio file provided');
    }

    console.log('Received audio file:', audio);

    // Check size (25 MB = 25 * 1024 * 1024)
    const MAX_SIZE = 25 * 1024 * 1024;
    const ext = extname(audio.originalname).toLowerCase();

    let filePath = audio.path;

    if (ext !== '.mp3' || audio.size > MAX_SIZE) {
      // Call your conversion function here
      filePath = await this.captionsAiService.convertToMp3(audio.path);
    }

    return this.captionsAiService.splitText(filePath);
  }

  @Get('summary')
  async summary(@Body() dto:TextDto){
    console.log(dto, dto.text)
    return this.captionsAiService.summary(dto.text)
  }

  @Get('pipe')
  async pipeExample() {
    return await this.captionsAiService.pipeExample();
  }
}
