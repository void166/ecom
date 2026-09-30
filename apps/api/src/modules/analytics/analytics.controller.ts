import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '../../common/auth.decorators';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@Controller('admin')
export class AnalyticsController {
  constructor(private readonly analytics: AnalyticsService) {}
  @RequirePermissions('analytics:read') @Get('analytics/dashboard') dashboard(@CurrentUser() user: AuthUser) { return this.analytics.dashboard(user.tenantId); }
  @RequirePermissions('audit:read') @Get('audit-logs') logs(@CurrentUser() user: AuthUser) { return this.analytics.auditLogs(user.tenantId); }
}
