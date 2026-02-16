import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { GithubService } from './github.service';

@ApiTags('GitHub')
@Controller('api/github')
export class GithubController {
  constructor(private readonly githubService: GithubService) {}

  @Get('verify')
  @ApiOperation({ summary: 'Verify GitHub token' })
  async verifyToken() {
    return this.githubService.verifyToken();
  }

  @Get('user')
  @ApiOperation({ summary: 'Get authenticated user' })
  async getUser() {
    return this.githubService.getAuthenticatedUser();
  }

  @Get('repositories')
  @ApiOperation({ summary: 'Get user repositories' })
  async getRepositories() {
    return this.githubService.getUserRepositories();
  }

  @Get('repositories/:owner/:repo')
  @ApiOperation({ summary: 'Get repository details' })
  async getRepository(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getRepository(owner, repo);
  }

  @Get('repositories/:owner/:repo/commits')
  @ApiOperation({ summary: 'Get repository commits' })
  async getCommits(
    @Param('owner') owner: string,
    @Param('repo') repo: string,
  ) {
    return this.githubService.getCommits(owner, repo);
  }

  @Get('repositories/:owner/:repo/contributors')
  @ApiOperation({ summary: 'Get repository contributors' })
  async getContributors(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getContributors(owner, repo);
  }

  @Get('repositories/:owner/:repo/branches')
  @ApiOperation({ summary: 'Get repository branches' })
  async getBranches(@Param('owner') owner: string, @Param('repo') repo: string) {
    return this.githubService.getBranches(owner, repo);
  }

  @Post('token')
  @ApiOperation({ summary: 'Set GitHub token' })
  @ApiBody({ schema: { properties: { token: { type: 'string' } } } })
  async setToken(@Body('token') token: string) {
    this.githubService.setToken(token);
    return this.githubService.verifyToken();
  }

  @Post('token/clear')
  @ApiOperation({ summary: 'Clear GitHub token' })
  async clearToken() {
    this.githubService.clearToken();
    return { success: true };
  }
}
