import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats() {
    const [
      totalDevelopers,
      totalTeams,
      totalRepositories,
      totalCommits,
      avgScore,
    ] = await Promise.all([
      this.prisma.developer.count(),
      this.prisma.team.count(),
      this.prisma.repository.count(),
      this.prisma.commit.count(),
      this.prisma.commit.aggregate({
        _avg: { score: true },
      }),
    ]);

    return {
      totalDevelopers,
      totalTeams,
      totalRepositories,
      totalCommits,
      avgScore: avgScore._avg.score || 0,
    };
  }

  async getPerformanceTrend(months: number = 12) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const commits = await this.prisma.commit.findMany({
      where: {
        committedAt: {
          gte: startDate,
        },
      },
      select: {
        committedAt: true,
        score: true,
      },
      orderBy: {
        committedAt: 'asc',
      },
    });

    // Group by month
    const monthlyScores: Record<string, { total: number; count: number }> = {};
    
    commits.forEach((commit) => {
      const monthKey = `${commit.committedAt.getFullYear()}-${String(commit.committedAt.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyScores[monthKey]) {
        monthlyScores[monthKey] = { total: 0, count: 0 };
      }
      monthlyScores[monthKey].total += commit.score;
      monthlyScores[monthKey].count += 1;
    });

    const trend = Object.entries(monthlyScores).map(([month, data]) => ({
      month,
      avgScore: Math.round(data.total / data.count),
      commits: data.count,
    }));

    return trend;
  }

  async getTopPerformers(limit: number = 10) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const performers = await this.prisma.developer.findMany({
      include: {
        commits: {
          where: {
            committedAt: {
              gte: thirtyDaysAgo,
            },
          },
          select: {
            score: true,
          },
        },
      },
    });

    return performers
      .map((dev) => ({
        id: dev.id,
        username: dev.username,
        avatarUrl: dev.avatarUrl,
        name: dev.name,
        avgScore: dev.commits.length > 0
          ? Math.round(dev.commits.reduce((sum, c) => sum + c.score, 0) / dev.commits.length)
          : 0,
        commitCount: dev.commits.length,
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, limit);
  }

  async getRecentActivity(limit: number = 5) {
    const commits = await this.prisma.commit.findMany({
      take: limit,
      orderBy: {
        committedAt: 'desc',
      },
      include: {
        developer: {
          select: {
            username: true,
            avatarUrl: true,
            name: true,
          },
        },
        repository: {
          select: {
            name: true,
          },
        },
      },
    });

    return commits.map((commit) => ({
      id: commit.id,
      sha: commit.sha,
      message: commit.message,
      score: commit.score,
      committedAt: commit.committedAt,
      developer: commit.developer,
      repository: commit.repository.name,
    }));
  }
}
