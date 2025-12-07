import { FavoriteRepository } from '../repositories/favorite.repository';

export class FavoriteService {
  private favoriteRepository: FavoriteRepository;

  constructor() {
    this.favoriteRepository = new FavoriteRepository();
  }

  async toggleFavorite(userId: string, campaignId: string) {
    const added = await this.favoriteRepository.toggle(userId, campaignId);
    return {
      favorited: added,
      message: added ? 'Added to favorites' : 'Removed from favorites',
    };
  }

  async getUserFavorites(userId: string) {
    return this.favoriteRepository.getUserFavorites(userId);
  }

  async isFavorite(userId: string, campaignId: string) {
    return this.favoriteRepository.isFavorite(userId, campaignId);
  }
}
