import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../../common/auth.decorators';
import { AddCartItemDto, CreateCartDto, UpdateCartItemDto } from './cart.dto';
import { CartService } from './cart.service';

@ApiTags('carts')
@Public()
@Controller('carts')
export class CartController {
  constructor(private readonly carts: CartService) {}
  @Post() create(@Body() dto: CreateCartDto) { return this.carts.create(dto.anonymousId); }
  @Get(':id') get(@Param('id') id: string) { return this.carts.get(id); }
  @Post(':id/items') add(@Param('id') id: string, @Body() dto: AddCartItemDto) { return this.carts.add(id, dto.variantId, dto.quantity); }
  @Patch(':id/items/:itemId') update(@Param('id') id: string, @Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) { return this.carts.update(id, itemId, dto.quantity); }
  @Delete(':id/items/:itemId') remove(@Param('id') id: string, @Param('itemId') itemId: string) { return this.carts.remove(id, itemId); }
}
