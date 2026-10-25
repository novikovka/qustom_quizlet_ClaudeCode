import { PrismaClient } from '@prisma/client';

// Одно подключение к базе на всё приложение
export const prisma = new PrismaClient();
