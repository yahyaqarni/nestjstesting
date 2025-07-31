import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  register(@Body() dto: SignupDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto, @Res() res: any ) {
    const { access_token, refresh_token } = await this.authService.login(dto);
    res.cookie('refresh_token', refresh_token, {
      httpOnly: true,
      secure: true, // only on https
      sameSite: 'strict',
      path: '/auth/refresh', // cookie only sent to refresh route
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({ access_token });
  }
}
