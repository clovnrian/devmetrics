import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DevelopersService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20, search?: string) {
    const where = search
      ? {
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [developers, total] = await Promise.all([
      this.prisma.developer.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          teams: {
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
          _count: {
            select: {
              commits: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.developer.count({ where }),
    ]);

    // Calculate average scores
    const developersWithScores = await Promise.all(
      developers.map(async (dev) => {
        const commits = await this.prisma.commit.findMany({
          where: { developerId: dev.id },
          select: { score: true, committedAt: true },
        });

        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCommits = commits.filter(
          (c) => new Date(c.committedAt) >= thirtyDaysAgo,
        );

        const avgScore =
          commits.length > 0
            ? Math.round(commits.reduce((sum, c) => sum + c.score, 0) / commits.length)
            : 0;

        const recentScore =
          recentCommits.length > 0
            ? Math.round(
                recentCommits.reduce((sum, c) => sum + c.score, 0) /
                  recentCommits.length,
              )
            : 0;

        return {
          id: dev.id,
          githubId: dev.githubId,
          username: dev.username,
          avatarUrl: dev.avatarUrl,
          email: dev.email,
          name: dev.name,
          teams: dev.teams.map((t) => t.team),
          commitCount: dev._count.commits,
          avgScore,
          recentScore,
          lastActive: commits[0]?.committedAt || null,
        };
      }),
    );

    return {
      data: developersWithScores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const developer = await this.prisma.developer.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
        commits: {
          take: 50,
          orderBy: {
            committedAt: 'desc',
          },
          include: {
            repository: {
              select: {
                id: true,
                name: true,
                fullName: true,
              },
            },
          },
        },
      },
    });

    if (!developer) {
      throw new NotFoundException(`Developer with ID ${id} not found`);
    }

    // Calculate metrics
    const commits = developer.commits;
    const totalAdditions = commits.reduce((sum, c) => sum + c.additions, 0);
    const totalDeletions = commits.reduce((sum, c) => sum + c.deletions, 0);
    const totalFiles = commits.reduce((sum, c) => sum + c.filesChanged, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentCommits = commits.filter(
      (c) => new Date(c.committedAt) >= thirtyDaysAgo,
    );

    const avgScore =
      commits.length > 0
        ? Math.round(commits.reduce((sum, c) => sum + c.score, 0) / commits.length)
        : 0;

    const recentScore =
      recentCommits.length > 0
        ? Math.round(
            recentCommits.reduce((sum, c) => sum + c.score, 0) /
              recentCommits.length,
          )
        : 0;

    // Group commits by month for trend
    const monthlyScores: Record<string, { total: number; count: number }> = {};
    commits.forEach((commit) => {
      const monthKey = `${new Date(commit.committedAt).getFullYear()}-${String(
        new Date(commit.committedAt).getMonth() + 1,
      ).padStart(2, '0')}`;
      if (!monthlyScores[monthKey]) {
        monthlyScores[monthKey] = { total: 0, count: 0 };
      }
      monthlyScores[monthKey].total += commit.score;
      monthlyScores[monthKey].count += 1;
    });

    const performanceTrend = Object.entries(monthlyScores)
      .map(([month, data]) => ({
        month,
        avgScore: Math.round(data.total / data.count),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    return {
      id: developer.id,
      githubId: developer.githubId,
      username: developer.username,
      avatarUrl: developer.avatarUrl,
      email: developer.email,
      name: developer.name,
      teams: developer.teams.map((t) => t.team),
      createdAt: developer.createdAt,
      metrics: {
        totalCommits: commits.length,
        recentCommits: recentCommits.length,
        avgScore,
        recentScore,
        totalAdditions,
        totalDeletions,
        totalFilesChanged: totalFiles,
        codeChurn: totalAdditions + totalDeletions,
      },
      performanceTrend,
      recentCommits: commits.slice(0, 10).map((c) => ({
        id: c.id,
        sha: c.sha,
        message: c.message,
        score: c.score,
        additions: c.additions,
        deletions: c.deletions,
        filesChanged: c.filesChanged,
        committedAt: c.committedAt,
        repository: c.repository,
      })),
    };
  }

  async findByGithubId(githubId: string) {
    return this.prisma.developer.findUnique({
      where: { githubId: String(githubId) },
    });
  }

  async create(data: {
    githubId: string;
    username: string;
    avatarUrl?: string;
    email?: string;
    name?: string;
  }) {
    return this.prisma.developer.create({
      data,
    });
  }

  async upsert(data: {
    githubId: string;
    username: string;
    avatarUrl?: string;
    email?: string;
    name?: string;
  }) {
    return this.prisma.developer.upsert({
      where: { githubId: data.githubId },
      update: data,
      create: data,
    });
  }
}
