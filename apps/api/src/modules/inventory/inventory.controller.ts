import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions, type AuthUser } from '../../common/auth.decorators';
import { AdjustStockDto, InventoryQueryDto } from './inventory.dto';
import { InventoryService } from './inventory.service';

@ApiTags('inventory')
@Controller('admin/inventory')
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}
  @RequirePermissions('inventory:read') @Get() list(@CurrentUser() user: AuthUser, @Query() query: InventoryQueryDto) { return this.inventory.list(user.tenantId, query); }
  @RequirePermissions('inventory:write') @Post(':variantId/adjustments') adjust(@CurrentUser() user: AuthUser, @Param('variantId') variantId: string, @Body() dto: AdjustStockDto) { return this.inventory.adjust(user.tenantId, variantId, dto, user.sub); }
}
