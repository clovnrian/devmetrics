import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { DevelopersModule } from './modules/developers/developers.module';
import { TeamsModule } from './modules/teams/teams.module';
import { RepositoriesModule } from './modules/repositories/repositories.module';
import { CommitsModule } from './modules/commits/commits.module';
import { GithubModule } from './modules/github/github.module';
import { SettingsModule } from './modules/settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    DashboardModule,
    DevelopersModule,
    TeamsModule,
    RepositoriesModule,
    CommitsModule,
    GithubModule,
    SettingsModule,
  ],
})
export class AppModule {}
