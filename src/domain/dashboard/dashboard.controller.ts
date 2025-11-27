import {
  Controller,
  Get,
  Query,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { SalesDashboardResponseDto } from './dto/sales-dashboard-response.dto';
import { SalesDashboardQueryDto } from './dto/sales-dashboard-query.dto';
import { InventoryDashboardResponseDto } from './dto/inventory-dashboard-response.dto';
import { InventoryDashboardQueryDto } from './dto/inventory-dashboard-query.dto';
import { JwtAuthGuard, PoliciesGuard } from '@app/authentication';
import { plainToClass } from 'class-transformer';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard, PoliciesGuard)
@UseInterceptors(ClassSerializerInterceptor)
@ApiBearerAuth('JWT-auth')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('sales')
  @ApiOperation({
    summary: 'Get sales dashboard data',
    description:
      'Returns sales metrics including total sales, metal sold (by metal type), metal credits, sales trend, and top categories by revenue. If metalTypeId is not provided, returns data for all metals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales dashboard data retrieved successfully',
    type: SalesDashboardResponseDto,
  })
  async getSalesDashboard(@Query() query: SalesDashboardQueryDto) {
    const data = await this.dashboardService.getSalesDashboard(
      query.metalTypeId,
    );
    return plainToClass(SalesDashboardResponseDto, data);
  }

  @Get('inventory')
  @ApiOperation({
    summary: 'Get inventory dashboard data',
    description:
      'Returns inventory metrics including total value, metal stock, items count, metal-wise breakdown, most stocked category, inventory flow trend, and stock distribution by purity. If metalTypeId is not provided, returns data for all metals.',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory dashboard data retrieved successfully',
    type: InventoryDashboardResponseDto,
  })
  async getInventoryDashboard(@Query() query: InventoryDashboardQueryDto) {
    const data = await this.dashboardService.getInventoryDashboard(
      query.metalTypeId,
    );
    return plainToClass(InventoryDashboardResponseDto, data);
  }
}
