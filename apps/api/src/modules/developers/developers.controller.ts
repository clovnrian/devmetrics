import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { DevelopersService } from './developers.service';

@ApiTags('Developers')
@Controller('api/developers')
export class DevelopersController {
  constructor(private readonly developersService: DevelopersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all developers' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    return this.developersService.findAll(page || 1, limit || 20, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get developer by ID' })
  @ApiParam({ name: 'id', description: 'Developer UUID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.developersService.findOne(id);
  }
}
