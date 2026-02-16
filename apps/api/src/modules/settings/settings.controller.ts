import { Controller, Get, Put, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('api/settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Get settings' })
  async getSettings() {
    return this.settingsService.getSettings();
  }

  @Put()
  @ApiOperation({ summary: 'Update settings' })
  @ApiBody({
    schema: {
      properties: {
        githubToken: { type: 'string' },
        preferences: { type: 'object' },
      },
    },
  })
  async updateSettings(@Body() body: { githubToken?: string; preferences?: any }) {
    return this.settingsService.updateSettings('default', body);
  }
}
