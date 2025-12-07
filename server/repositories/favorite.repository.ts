import prisma from '../db/client';

export class FavoriteRepository {
  async toggle(userId: string, campaignId: string): Promise<boolean> {
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_campaignId: { userId, campaignId },
      },
    });

    if (existing) {
      await prisma.favorite.delete({
        where: { id: existing.id },
      });
      return false;
    } else {
      await prisma.favorite.create({
        data: { userId, campaignId },
      });
      return true;
    }
  }

  async isFavorite(userId: string, campaignId: string): Promise<boolean> {
    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_campaignId: { userId, campaignId },
      },
    });

    return !!favorite;
  }

  async getUserFavorites(userId: string): Promise<string[]> {
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      select: { campaignId: true },
    });

    return favorites.map(f => f.campaignId);
  }
}
