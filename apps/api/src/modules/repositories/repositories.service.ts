import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class RepositoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
    const [repositories, total] = await Promise.all([
      this.prisma.repository.findMany({
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
          updatedAt: 'desc',
        },
      }),
      this.prisma.repository.count(),
    ]);

    return {
      data: repositories.map((repo) => ({
        id: repo.id,
        githubId: repo.githubId,
        name: repo.name,
        fullName: repo.fullName,
        owner: repo.owner,
        url: repo.url,
        language: repo.language,
        teams: repo.teams.map((t) => t.team),
        commitCount: repo._count.commits,
        lastUpdated: repo.updatedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const repository = await this.prisma.repository.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: true,
          },
        },
        commits: {
          take: 100,
          orderBy: {
            committedAt: 'desc',
          },
          include: {
            developer: {
              select: {
                id: true,
                username: true,
                avatarUrl: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!repository) {
      throw new NotFoundException(`Repository with ID ${id} not found`);
    }

    // Calculate repository metrics
    const commits = repository.commits;
    const avgScore =
      commits.length > 0
        ? Math.round(commits.reduce((sum, c) => sum + c.score, 0) / commits.length)
        : 0;

    const contributors = new Map();
    commits.forEach((c) => {
      const current = contributors.get(c.developerId) || 0;
      contributors.set(c.developerId, current + 1);
    });

    // Language breakdown (simplified - would need GitHub API for actual data)
    const language = repository.language || 'Unknown';

    return {
      id: repository.id,
      githubId: repository.githubId,
      name: repository.name,
      fullName: repository.fullName,
      owner: repository.owner,
      url: repository.url,
      language,
      teams: repository.teams.map((t) => t.team),
      metrics: {
        totalCommits: commits.length,
        avgScore,
        contributorCount: contributors.size,
      },
      recentCommits: commits.slice(0, 10).map((c) => ({
        id: c.id,
        sha: c.sha,
        message: c.message,
        score: c.score,
        author: c.developer,
        committedAt: c.committedAt,
      })),
      createdAt: repository.createdAt,
      updatedAt: repository.updatedAt,
    };
  }

  async findByGithubId(githubId: string) {
    return this.prisma.repository.findUnique({
      where: { githubId: String(githubId) },
    });
  }

  async upsert(data: {
    githubId: string;
    name: string;
    fullName: string;
    owner: string;
    url: string;
    language?: string;
  }) {
    return this.prisma.repository.upsert({
      where: { githubId: data.githubId },
      update: data,
      create: data,
    });
  }
}
