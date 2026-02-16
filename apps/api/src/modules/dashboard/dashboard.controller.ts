import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('api/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.dashboardService.getStats();
  }

  @Get('trend')
  @ApiOperation({ summary: 'Get performance trend' })
  @ApiQuery({ name: 'months', required: false, type: Number })
  async getPerformanceTrend(@Query('months') months?: number) {
    return this.dashboardService.getPerformanceTrend(months || 12);
  }

  @Get('top-performers')
  @ApiOperation({ summary: 'Get top performers' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopPerformers(@Query('limit') limit?: number) {
    return this.dashboardService.getTopPerformers(limit || 10);
  }

  @Get('recent-activity')
  @ApiOperation({ summary: 'Get recent activity' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRecentActivity(@Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivity(limit || 5);
  }
}
