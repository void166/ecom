import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '../../common/auth.decorators';
import { AddInteractionDto, AddNoteDto, CustomerQueryDto } from './crm.dto';
import { CrmService } from './crm.service';

@ApiTags('crm')
@RequirePermissions('customers:read')
@Controller('admin/customers')
export class CrmController {
  constructor(private readonly crm: CrmService) {}
  @Get() list(@CurrentUser() user: AuthUser, @Query() query: CustomerQueryDto) { return this.crm.list(user.tenantId, query); }
  @Get(':id') detail(@CurrentUser() user: AuthUser, @Param('id') id: string) { return this.crm.detail(user.tenantId, id); }
  @RequirePermissions('customers:write') @Post(':id/notes') note(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AddNoteDto) { return this.crm.note(user.tenantId, id, user.sub, dto.body); }
  @RequirePermissions('customers:write') @Post(':id/interactions') interaction(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: AddInteractionDto) { return this.crm.interaction(user.tenantId, id, dto); }
}
