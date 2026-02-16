import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery, ApiParam } from '@nestjs/swagger';
import { RepositoriesService } from './repositories.service';

@ApiTags('Repositories')
@Controller('api/repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all repositories' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.repositoriesService.findAll(page || 1, limit || 20);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get repository by ID' })
  @ApiParam({ name: 'id', description: 'Repository UUID' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.repositoriesService.findOne(id);
  }
}
