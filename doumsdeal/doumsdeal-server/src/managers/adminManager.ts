import { prisma } from '../prisma';

export class AdminManager {
    static async findAllUsers() {
        return await prisma.users.findMany({
            select: { id: true, username: true, email: true, role: true, is_active: true, created_at: true }
        });
    }

    static async toggleUserActive(id: number) {
        const user = await prisma.users.findUnique({ where: { id }, select: { is_active: true } });
        if (!user) throw new Error('Utilisateur introuvable');
        return await prisma.users.update({
            where: { id },
            data: { is_active: !user.is_active },
            select: { id: true, is_active: true },
        });
    }

    static async deleteUser(id: number) {
        return await prisma.users.delete({ where: { id } });
    }

    static async getLogs(limit = 200) {
        return await prisma.logs.findMany({
            orderBy: { created_at: 'desc' },
            take: limit,
            include: { users: { select: { username: true } } },
        });
    }
}