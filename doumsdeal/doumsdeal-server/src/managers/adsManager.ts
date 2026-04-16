import { prisma } from '../prisma';

export class AdsManager {
    static async findAllAds(filters: any = {}) {
        const { search, category, minPrice, maxPrice, sort, page } = filters;
        
        const take = 25;
        const skip = page ? (page - 1) * take : 0;

        const whereClause: any = {};
        
        if (search) {
            whereClause.title = { contains: search, mode: 'insensitive' };
        }
        if (category) {
            whereClause.category_id = category;
        }
        if (minPrice !== undefined || maxPrice !== undefined) {
            whereClause.price = {};
            if (minPrice !== undefined) whereClause.price.gte = minPrice;
            if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
        }

        let orderByClause: any = { created_at: 'desc' };
        
        if (sort === 'price_asc') orderByClause = { price: 'asc' };
        if (sort === 'price_desc') orderByClause = { price: 'desc' };
        if (sort === 'date_asc') orderByClause = { created_at: 'asc' };

        return await prisma.ads.findMany({
            where: whereClause,
            orderBy: orderByClause,
            skip: skip,
            take: take,
            include: {
                categories: true,
                users: { select: { username: true, avatar_url: true } },
            },
        });
    }

    static async findById(id: number) {
        return await prisma.ads.findUnique({
            where: { id },
            include: {
                categories: true,
                users: { select: { username: true, avatar_url: true } },
            },
        });
    }

    static async incrementViews(id: number) {
        return await prisma.ads.update({
            where: { id },
            data: { views_count: { increment: 1 } },
        });
    }
    
    static async create(data : any) {
        return await prisma.ads.create({data});
    }

    static async update(id: number, data: any) {
        return await prisma.ads.update({ where: { id }, data });
    }

    static async delete(id: number) {
        return await prisma.ads.delete({ where: { id } });
    }

    // ===== FAVORIS =====
    static async addFavorite(userId: number, adId: number) {
        await prisma.favorites.upsert({
            where: { user_id_ad_id: { user_id: userId, ad_id: adId } },
            create: { user_id: userId, ad_id: adId },
            update: {},
        });
    }

    static async removeFavorite(userId: number, adId: number) {
        await prisma.favorites.deleteMany({
            where: { user_id: userId, ad_id: adId },
        });
    }

    static async getUserFavorites(userId: number) {
        const favs = await prisma.favorites.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            select: { ad_id: true },
        });
        if (favs.length === 0) return [];
        const adIds = favs.map(f => f.ad_id);
        return await prisma.ads.findMany({
            where: { id: { in: adIds } },
            include: {
                categories: true,
                users: { select: { username: true, avatar_url: true } },
            },
        });
    }

    static async isFavorite(userId: number, adId: number) {
        const fav = await prisma.favorites.findFirst({
            where: { user_id: userId, ad_id: adId },
        });
        return !!fav;
    }

    static async markAsSold(id: number) {
        return await prisma.ads.update({
            where: { id },
            data: { status: 'SOLD' },
        });
    }
}
