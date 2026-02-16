import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings(userId: string = 'default') {
    let settings = await this.prisma.settings.findUnique({
      where: { userId },
    });

    if (!settings) {
      settings = await this.prisma.settings.create({
        data: { userId },
      });
    }

    return {
      githubConnected: !!settings.githubToken,
      preferences: settings.preferences,
    };
  }

  async updateSettings(
    userId: string = 'default',
    data: { githubToken?: string; preferences?: any },
  ) {
    const updateData: any = {};
    
    if (data.githubToken !== undefined) {
      updateData.githubToken = data.githubToken;
    }
    if (data.preferences !== undefined) {
      updateData.preferences = data.preferences;
    }

    return this.prisma.settings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData,
      },
    });
  }

  async getGithubToken(userId: string = 'default') {
    const settings = await this.prisma.settings.findUnique({
      where: { userId },
    });
    
    return settings?.githubToken || null;
  }
}
