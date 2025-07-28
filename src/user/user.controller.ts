import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { GetUser } from '../auth/decoraters/getuser.decorator';
import { JwtGuard } from '../auth/guard/authguard.guard';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {

    @Get('profile')
    getProfile(@GetUser() user) {
        return user;
    }
}
