import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import * as fs from 'fs';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { RunnableLambda } from '@langchain/core/runnables';
import * as ffmpeg from 'fluent-ffmpeg';
import { join } from 'path';
import { SupabaseService } from 'src/supabase/supabase.service';
import { SupabaseVectorStore } from '@langchain/community/vectorstores/supabase';

@Injectable()
export class CaptionsAiService {
  private llm: OpenAI;
  private splitter: RecursiveCharacterTextSplitter;
  constructor(
    private config: ConfigService,
    private supabase: SupabaseService,
  ) {
    this.llm = new OpenAI({
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
      baseURL: 'https://api.openai.com/v1',
      timeout: 10000 * 60, // 10 minutes
    });

    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000, // Adjust chunk size as needed
      separators: ['\n\n', '\n', ' ', ''],
      chunkOverlap: 200, // Adjust overlap as needed
    });
  }

  async convertToMp3(inputPath: string): Promise<string> {
    const outputPath = join('./uploads', `${Date.now()}.mp3`);

    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k') // you can try 64k for even smaller size
        .toFormat('mp3')
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  async pipeExample() {
    const gpt = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 100,
      apiKey: this.config.get<string>('OPENAI_API_KEY'),
    });

    const standaloneQuestionTemplate =
      'Given a question, convert it to a standalone question. question: {question} standalone question:';

    const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
      standaloneQuestionTemplate,
    );

    const standaloneQuestionChain = standaloneQuestionPrompt.pipe(gpt);

    try {
      const response = await standaloneQuestionChain.invoke({
        question:
          "I'm building a web application using Next.js for the frontend and Node.js with Express for the backend. I want to implement user authentication where users can sign up, log in, and stay logged in using JWT tokens stored in HTTP-only cookies. The tricky part is that I also want to allow users to connect their social media accounts (like Facebook and Instagram) after logging in, and then be able to fetch their posts and insights. How should I structure my backend in terms of routes, middleware, and database schema to support both JWT authentication and OAuth-based social account linking, while keeping the codebase clean and secure?",
      });
      return response;
    } catch (error) {
      console.error('Error in pipeExample:', error);
      throw new Error('Failed to execute pipe example');
    }
  }

  async generateCaptions(text: string) {
    try {
      //const result = await this.llm.chat.completions.create({
      const response = await this.llm.responses.create({
        model: 'gpt-4o-mini',
        instructions: 'Generate a caption and hashtags',
        max_output_tokens: 100,
        temperature: 0.7,
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

  async splitText(audio: string) {
    try {
      //console.log(typeof text);
      const chunks = await this.ingestionChain.invoke(audio)
      const embeddings = new OpenAIEmbeddings();

      await SupabaseVectorStore.fromDocuments(chunks, embeddings, {
        client: this.supabase,
        tableName: 'documents',
      });

      return { chunks, message: 'embeddings stored successfully' };
    } catch (error) {
      console.error('Error splitting text:', error);
    }
  }


   //-------------------------------------------------------------------------------

  private transcribeAudio = new RunnableLambda({
    func: async (audio: string) => {
      const transcript = await this.llm.audio.transcriptions.create({
        file: fs.createReadStream(audio),
        model: 'whisper-1',
        response_format: 'text',
      });
      fs.unlinkSync(audio); // Delete the file after processing
      return transcript;
    },
  })

 

  private textSplit = new RunnableLambda({
    func: async (trancript: string)=> {
      return await this.splitter.createDocuments([trancript]);
    }
  })

  private ingestionChain = this.transcribeAudio.pipe(this.textSplit);


}
