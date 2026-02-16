import { Controller, Get, Post, Body, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CommitsService } from './commits.service';

@ApiTags('Commits')
@Controller('api/commits')
export class CommitsController {
  constructor(private readonly commitsService: CommitsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all commits' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'repositoryId', required: false, type: String })
  @ApiQuery({ name: 'developerId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('repositoryId') repositoryId?: string,
    @Query('developerId') developerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commitsService.findAll(
      page || 1,
      limit || 20,
      repositoryId,
      developerId,
      startDate,
      endDate,
    );
  }

  @Get('analysis')
  @ApiOperation({ summary: 'Get commit analysis' })
  @ApiQuery({ name: 'repositoryId', required: false, type: String })
  @ApiQuery({ name: 'developerId', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  async getAnalysis(
    @Query('repositoryId') repositoryId?: string,
    @Query('developerId') developerId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.commitsService.getAnalysis(
      repositoryId,
      developerId,
      startDate,
      endDate,
    );
  }

  @Post('import')
  @ApiOperation({ summary: 'Import commits from GitHub' })
  async importFromGithub(
    @Body() body: { repositoryId: string; owner: string; repo: string; branch?: string },
  ) {
    return this.commitsService.importFromGithub(
      body.repositoryId,
      body.owner,
      body.repo,
      body.branch,
    );
  }
}
