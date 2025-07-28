import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { SignupDto, LoginDto } from './dto';
import { ConfigService } from '@nestjs/config';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async register(dto: SignupDto) {
    try {
      const hash = await argon.hash(dto.password);
      const user = await this.prisma.user.create({
        data: {
          name: dto.name,
          email: dto.email,
          password: hash,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw new Error('Something went wrong during registration');
    }

    return {
      message: 'User registered successfully',
    };
  }

  async login(dto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

      if(!user){
        throw new Error('User not found');
      }
   
    const isPasswordValid = await argon.verify(user.password, dto.password);
      if (!user || !isPasswordValid) {
        throw new Error('Invalid credentials');
      }

      const payload = { sub: user.id, email: user.email, name: user.name };

      const access_token = await this.jwt.signAsync(payload, {
        secret: await this.config.get('JWT_ACCESS_SECRET'),
        expiresIn: '1h',
      });

      const refresh_token = await this.jwt.signAsync(payload, {
        secret: await this.config.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      });

      

      return {
        access_token: access_token,
        refresh_token: refresh_token,
      };
    } catch (error) {
      throw new Error('Login failed');
    }
  }
}
