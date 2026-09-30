import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser, type AuthUser, Public } from '../../common/auth.decorators';
import { AuthService } from './auth.service';
import { LoginDto, RefreshDto, RegisterDto } from './auth.dto';

@ApiTags('authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Post('register')
  register(@Body() dto: RegisterDto) { return this.auth.register(dto); }

  @Public() @Throttle({ default: { limit: 10, ttl: 60_000 } }) @Post('login')
  login(@Body() dto: LoginDto) { return this.auth.login(dto); }

  @Public() @Throttle({ default: { limit: 20, ttl: 60_000 } }) @Post('refresh')
  refresh(@Body() dto: RefreshDto) { return this.auth.refresh(dto.refreshToken); }

  @Post('logout') logout(@CurrentUser() user: AuthUser) { return this.auth.logout(user.sub); }
  @Get('me') me(@CurrentUser() user: AuthUser) { return user; }
}
