import { prisma } from '../prisma';

export interface LogPayload {
    user_id?: number;
    action: string;
    target_type?: string;
    target_id?: number;
    details?: string;
}

export async function logAction(payload: LogPayload): Promise<void> {
    try {
        await prisma.logs.create({ data: payload });
    } catch {
        // Ne jamais bloquer une action à cause d'un log raté
    }
}
