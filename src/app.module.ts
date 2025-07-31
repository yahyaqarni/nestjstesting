import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { CaptionsAiModule } from './captions-ai/captions-ai.module';

@Module({
  imports: [ ConfigModule.forRoot({
    isGlobal: true,}),
    AuthModule, PrismaModule, UserModule, CaptionsAiModule],
})
export class AppModule {}
