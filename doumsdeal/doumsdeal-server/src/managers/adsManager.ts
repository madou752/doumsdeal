import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export class AdsManager {
    static async findAllAds() {
        return await prisma.ads.findMany({
            include: {
                categories: true,
                users: {select : { username:true }},
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
}
