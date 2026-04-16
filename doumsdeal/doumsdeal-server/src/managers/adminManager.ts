import { PrismaClient } from "../../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

export class AdminManager {
    static async findAllUsers(filters: any = {}) {
        return await prisma.users.findMany({
            select: { id: true, username: true, email: true, role: true, created_at: true }
        });
    }

    static async deleteUser(id: number) {
        return await prisma.users.delete({ where: { id } });
    }
}