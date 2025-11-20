import {
  Controller,
  Get,
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
import { InventoryDashboardResponseDto } from './dto/inventory-dashboard-response.dto';
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
      'Returns sales metrics including total sales, gold/silver sold, old gold credit, sales trend, and top categories by revenue',
  })
  @ApiResponse({
    status: 200,
    description: 'Sales dashboard data retrieved successfully',
    type: SalesDashboardResponseDto,
  })
  async getSalesDashboard() {
    const data = await this.dashboardService.getSalesDashboard();
    return plainToClass(SalesDashboardResponseDto, data);
  }

  @Get('inventory')
  @ApiOperation({
    summary: 'Get inventory dashboard data',
    description:
      'Returns inventory metrics including total value, metal stock, items count, most stocked category, inventory flow trend, and stock distribution by purity',
  })
  @ApiResponse({
    status: 200,
    description: 'Inventory dashboard data retrieved successfully',
    type: InventoryDashboardResponseDto,
  })
  async getInventoryDashboard() {
    const data = await this.dashboardService.getInventoryDashboard();
    return plainToClass(InventoryDashboardResponseDto, data);
  }
}
