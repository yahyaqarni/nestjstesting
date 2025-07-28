import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt'){
    constructor(private config: ConfigService,
        private prisma: PrismaService
    ) {

        const jwtSecret = config.get<string>('JWT_ACCESS_SECRET');
        if (!jwtSecret) {
            throw new Error('JWT_SECRET is not defined in configuration');
        }
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: jwtSecret,
        })
    }

    async validate(payload: {
        sub: string;
        email: string;
        name: string;
    }) {
        const user = await this.prisma.user.findUnique({
            where: {
                id: payload.sub,
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        // Remove password before returning user
        const { password, ...userWithoutPassword } = user;

        return userWithoutPassword;
    }
}

