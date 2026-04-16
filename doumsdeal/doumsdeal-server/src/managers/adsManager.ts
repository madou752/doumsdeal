import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

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
                users: { select: { username: true } },
            },
        });
    }

    static async findById(id: number) {
        return await prisma.ads.findUnique({
            where: { id }
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
}
