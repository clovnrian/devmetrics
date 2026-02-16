import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GithubService } from '../github/github.service';

export interface CommitScoreBreakdown {
  linesScore: number;
  filesScore: number;
  messageScore: number;
  consistencyBonus: number;
  qualityIndicators: number;
}

@Injectable()
export class CommitsService {
  constructor(
    private prisma: PrismaService,
    private githubService: GithubService,
  ) {}

  /**
   * Calculate performance score for a commit
   * Score range: 0-100
   */
  calculateCommitScore(
    additions: number,
    deletions: number,
    filesChanged: number,
    message: string,
  ): { score: number; breakdown: CommitScoreBreakdown } {
    let score = 50; // Base neutral score
    const breakdown: CommitScoreBreakdown = {
      linesScore: 0,
      filesScore: 0,
      messageScore: 0,
      consistencyBonus: 0,
      qualityIndicators: 0,
    };

    // Lines Score (0-15 points)
    // Productive code volume - too few lines might be trivial, too many might be risky
    const totalChanges = additions + deletions;
    if (totalChanges > 0 && totalChanges <= 50) {
      breakdown.linesScore = 10; // Small, focused changes
      score += 10;
    } else if (totalChanges > 50 && totalChanges <= 200) {
      breakdown.linesScore = 15; // Good sized changes
      score += 15;
    } else if (totalChanges > 200 && totalChanges <= 500) {
      breakdown.linesScore = 12; // Larger but reasonable
      score += 12;
    } else if (totalChanges > 500 && totalChanges <= 1000) {
      breakdown.linesScore = 8; // Getting large
      score += 8;
    } else if (totalChanges > 1000) {
      breakdown.linesScore = 5; // Very large - might need review
      score += 5;
    }

    // Files Score (0-10 points)
    // Appropriate scope - too few files might be trivial, too many is risky
    if (filesChanged >= 1 && filesChanged <= 3) {
      breakdown.filesScore = 10; // Focused, easy to review
      score += 10;
    } else if (filesChanged >= 4 && filesChanged <= 7) {
      breakdown.filesScore = 8; // Moderate scope
      score += 8;
    } else if (filesChanged >= 8 && filesChanged <= 15) {
      breakdown.filesScore = 5; // Getting broad
      score += 5;
    } else if (filesChanged > 15) {
      breakdown.filesScore = 2; // Very broad changes
      score += 2;
    }

    // Message Score (0-10 points)
    // Quality of commit message
    const msgLength = message.length;
    const hasPrefix = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)\(/i.test(message);
    const hasTicket = /\b(A-Z+-\d+|#\d+)\b/.test(message);
    const hasDescription = msgLength > 20;
    
    if (hasPrefix && hasDescription) {
      breakdown.messageScore = 10;
      score += 10;
    } else if (hasPrefix || hasTicket) {
      breakdown.messageScore = 7;
      score += 7;
    } else if (hasDescription && msgLength > 50) {
      breakdown.messageScore = 5;
      score += 5;
    } else if (hasDescription) {
      breakdown.messageScore = 3;
      score += 3;
    }

    // Quality Indicators (0-5 points)
    // Bonus for helpful commit types
    const isFix = /\b(fix|bug|hotfix|hack|workaround)\b/i.test(message);
    const isRefactor = /\b(refactor|cleanup|reformat)\b/i.test(message);
    const isTest = /\b(test|spec)\b/i.test(message);
    
    if (isRefactor) {
      breakdown.qualityIndicators = 5; // Refactoring is valuable
      score += 5;
    } else if (isFix) {
      breakdown.qualityIndicators = 4; // Bug fixes are important
      score += 4;
    } else if (isTest) {
      breakdown.qualityIndicators = 3; // Tests are valuable
      score += 3;
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    breakdown.linesScore = Math.max(0, Math.min(15, breakdown.linesScore));
    breakdown.filesScore = Math.max(0, Math.min(10, breakdown.filesScore));
    breakdown.messageScore = Math.max(0, Math.min(10, breakdown.messageScore));
    breakdown.consistencyBonus = Math.max(0, Math.min(10, breakdown.consistencyBonus));
    breakdown.qualityIndicators = Math.max(0, Math.min(5, breakdown.qualityIndicators));

    return { score, breakdown };
  }

  async findAll(
    page: number = 1,
    limit: number = 20,
    repositoryId?: string,
    developerId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (repositoryId) {
      where.repositoryId = repositoryId;
    }
    if (developerId) {
      where.developerId = developerId;
    }
    if (startDate || endDate) {
      where.committedAt = {};
      if (startDate) {
        where.committedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.committedAt.lte = new Date(endDate);
      }
    }

    const [commits, total] = await Promise.all([
      this.prisma.commit.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          developer: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
              name: true,
            },
          },
          repository: {
            select: {
              id: true,
              name: true,
              fullName: true,
            },
          },
        },
        orderBy: {
          committedAt: 'desc',
        },
      }),
      this.prisma.commit.count({ where }),
    ]);

    return {
      data: commits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getAnalysis(
    repositoryId?: string,
    developerId?: string,
    startDate?: string,
    endDate?: string,
  ) {
    const where: any = {};

    if (repositoryId) {
      where.repositoryId = repositoryId;
    }
    if (developerId) {
      where.developerId = developerId;
    }
    if (startDate || endDate) {
      where.committedAt = {};
      if (startDate) {
        where.committedAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.committedAt.lte = new Date(endDate);
      }
    }

    const commits = await this.prisma.commit.findMany({
      where,
      select: {
        score: true,
        additions: true,
        deletions: true,
        filesChanged: true,
        scoreBreakdown: true,
        committedAt: true,
      },
    });

    if (commits.length === 0) {
      return {
        summary: {
          totalCommits: 0,
          avgScore: 0,
          avgAdditions: 0,
          avgDeletions: 0,
          avgFilesChanged: 0,
        },
        distribution: [],
      };
    }

    // Calculate summary stats
    const avgScore = Math.round(
      commits.reduce((sum, c) => sum + c.score, 0) / commits.length,
    );
    const avgAdditions = Math.round(
      commits.reduce((sum, c) => sum + c.additions, 0) / commits.length,
    );
    const avgDeletions = Math.round(
      commits.reduce((sum, c) => sum + c.deletions, 0) / commits.length,
    );
    const avgFilesChanged = Math.round(
      commits.reduce((sum, c) => sum + c.filesChanged, 0) / commits.length,
    );

    // Score distribution
    const distribution = [
      { range: '0-49', label: 'Needs Improvement', count: 0, percentage: 0 },
      { range: '50-69', label: 'Average', count: 0, percentage: 0 },
      { range: '70-89', label: 'Good', count: 0, percentage: 0 },
      { range: '90-100', label: 'Excellent', count: 0, percentage: 0 },
    ];

    commits.forEach((c) => {
      if (c.score < 50) distribution[0].count++;
      else if (c.score < 70) distribution[1].count++;
      else if (c.score < 90) distribution[2].count++;
      else distribution[3].count++;
    });

    distribution.forEach((d) => {
      d.percentage = Math.round((d.count / commits.length) * 100);
    });

    return {
      summary: {
        totalCommits: commits.length,
        avgScore,
        avgAdditions,
        avgDeletions,
        avgFilesChanged,
      },
      distribution,
    };
  }

  async importFromGithub(
    repositoryId: string,
    owner: string,
    repo: string,
    branch?: string,
  ) {
    const githubCommits = await this.githubService.getCommits(
      owner,
      repo,
      branch,
    );

    let imported = 0;
    let skipped = 0;

    for (const ghCommit of githubCommits) {
      // Check if commit already exists
      const existing = await this.prisma.commit.findUnique({
        where: { sha: ghCommit.sha },
      });

      if (existing) {
        skipped++;
        continue;
      }

      // Find or create developer
      let developer = await this.prisma.developer.findUnique({
        where: { githubId: String(ghCommit.author?.id || ghCommit.author?.login) },
      });

      if (!developer && ghCommit.author) {
        developer = await this.prisma.developer.create({
          data: {
            githubId: String(ghCommit.author.id || ghCommit.author.login),
            username: ghCommit.author.login,
            avatarUrl: ghCommit.author.avatar_url,
          },
        });
      }

      if (!developer) {
        skipped++;
        continue;
      }

      // Find or create repository
      const repository = await this.prisma.repository.findUnique({
        where: { githubId: String(repositoryId) },
      });

      if (!repository) {
        skipped++;
        continue;
      }

      // Calculate score
      const { score, breakdown } = this.calculateCommitScore(
        ghCommit.stats?.additions || 0,
        ghCommit.stats?.deletions || 0,
        ghCommit.files?.length || 0,
        ghCommit.commit.message,
      );

      // Create commit
      await this.prisma.commit.create({
        data: {
          sha: ghCommit.sha,
          message: ghCommit.commit.message,
          author: ghCommit.commit.author?.name || ghCommit.author?.login || 'Unknown',
          authorEmail: ghCommit.commit.author?.email,
          additions: ghCommit.stats?.additions || 0,
          deletions: ghCommit.stats?.deletions || 0,
          filesChanged: ghCommit.files?.length || 0,
          score,
          scoreBreakdown: breakdown,
          committedAt: new Date(ghCommit.commit.author?.date || new Date()),
          repositoryId: repository.id,
          developerId: developer.id,
        },
      });

      imported++;
    }

    return { imported, skipped };
  }
}
