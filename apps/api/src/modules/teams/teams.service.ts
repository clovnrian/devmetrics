import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TeamsService {
  constructor(private prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 20) {
    const [teams, total] = await Promise.all([
      this.prisma.team.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          members: {
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
          repositories: {
            include: {
              repository: true,
            },
          },
          _count: {
            select: {
              members: true,
              repositories: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.team.count(),
    ]);

    // Calculate team scores
    const teamsWithScores = await Promise.all(
      teams.map(async (team) => {
        const memberIds = team.members.map((m) => m.developerId);
        if (memberIds.length === 0) {
          return {
            ...team,
            memberCount: team._count.members,
            repositoryCount: team._count.repositories,
            avgScore: 0,
            trend: 'neutral',
          };
        }

        const commits = await this.prisma.commit.findMany({
          where: {
            developerId: { in: memberIds },
          },
          select: { score: true },
        });

        const avgScore =
          commits.length > 0
            ? Math.round(
                commits.reduce((sum, c) => sum + c.score, 0) / commits.length,
              )
            : 0;

        // Calculate trend based on recent commits
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentCommits = commits.filter(
          (c) => new Date(c.committedAt) >= thirtyDaysAgo,
        );
        // Note: This is simplified - in production you'd need to fetch with committedAt

        return {
          id: team.id,
          name: team.name,
          description: team.description,
          members: team.members.map((m) => m.developer),
          repositories: team.repositories.map((r) => r.repository),
          memberCount: team._count.members,
          repositoryCount: team._count.repositories,
          avgScore,
          trend: 'neutral', // Simplified for now
        };
      }),
    );

    return {
      data: teamsWithScores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            developer: {
              include: {
                commits: {
                  take: 30,
                  orderBy: { committedAt: 'desc' },
                  select: { score: true, committedAt: true },
                },
              },
            },
          },
        },
        repositories: {
          include: {
            repository: true,
          },
        },
      },
    });

    if (!team) {
      throw new NotFoundException(`Team with ID ${id} not found`);
    }

    // Calculate team metrics
    const membersWithScores = team.members.map((member) => {
      const commits = member.developer.commits;
      const avgScore =
        commits.length > 0
          ? Math.round(
              commits.reduce((sum, c) => sum + c.score, 0) / commits.length,
            )
          : 0;

      return {
        id: member.developer.id,
        username: member.developer.username,
        avatarUrl: member.developer.avatarUrl,
        name: member.developer.name,
        role: member.role,
        joinedAt: member.joinedAt,
        avgScore,
        commitCount: commits.length,
      };
    });

    const allScores = membersWithScores.flatMap((m) =>
      Array(m.commitCount).fill(m.avgScore),
    );
    const teamAvgScore =
      allScores.length > 0
        ? Math.round(allScores.reduce((sum, s) => sum + s, 0) / allScores.length)
        : 0;

    return {
      id: team.id,
      name: team.name,
      description: team.description,
      members: membersWithScores,
      repositories: team.repositories.map((r) => r.repository),
      metrics: {
        memberCount: team.members.length,
        repositoryCount: team.repositories.length,
        avgScore: teamAvgScore,
      },
      createdAt: team.createdAt,
    };
  }

  async create(data: { name: string; description?: string }) {
    return this.prisma.team.create({ data });
  }

  async addMember(teamId: string, developerId: string, role: string = 'member') {
    return this.prisma.teamMember.create({
      data: {
        teamId,
        developerId,
        role,
      },
    });
  }
}
