import { RecursiveCharacterTextSplitter, TextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class CaptionsAiService {
  private llm: OpenAI;
  private splitter: RecursiveCharacterTextSplitter;
  constructor(private config: ConfigService) {
    this.llm = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
      baseURL: 'https://api.openai.com/v1',
      timeout: 10000, // 10 seconds
    });

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Adjust chunk size as needed
      separators: ['\n\n', '\n', ' ', ''],
      chunkOverlap: 200, // Adjust overlap as needed
    });
  }

  async generateCaptions(text: string) {
    try {
      const response = await this.llm.responses.create({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'developer',
            content:
              'You are a powerful Social media manager and content creator. You are tasked with generating engaging captions for social media posts based on the provided text. The captions should be concise, creative, and tailored to the target audience.',
          },
          {
            role: 'user',
            content: `generate a caption (not exceeding 80 words) and 5 hashtags for the following text: ${text}`,
          },
        ],
      });

      return response;
    } catch (error) {
      console.error('Error generating captions:', error);
      throw new Error('Failed to generate captions');
    }
  }

  async splitText(text: string) {
    try {
        //console.log(typeof text);
      const chunks = await this.splitTextIntoChunks(text);
      return chunks;
    } catch (error) {
      console.error('Error splitting text:', error);
    }
  }

  //-----------------------------------------------------------------------------

  private async splitTextIntoChunks(text: string) {
    
    const output = await this.splitter.createDocuments([text]);
    return output;
  }
}
