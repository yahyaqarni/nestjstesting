import { Body, Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
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

  @UseInterceptors(
  FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        // Get original extension (.mp3, .wav etc.)
        const extension = extname(file.originalname);
        // Generate unique name
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${file.fieldname}-${uniqueSuffix}${extension}`);
      },
    }),
  }),
)
@Post('transcribe')
transcribeAudio(@UploadedFile() audio: Express.Multer.File) {
  console.log('Received audio file:', audio); 
  if (!audio) {
    throw new Error('No audio file provided');
  }
  console.log('Audio file path:', audio.path);
  return this.captionsAiService.transcribeAudio(audio.path);
}
}
