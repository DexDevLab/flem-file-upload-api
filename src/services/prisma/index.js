import { PrismaClient } from "@prisma/client";

/**
 * Client de inicialização do Prisma. Chama o
 * Prisma Client e cria um pool de conexão ao BD.
 * @method prisma
 * @memberof module:services
 * @returns {Function} Instância Prisma atualmente em execução.
 */
export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [],
    errorFormat: "pretty",
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;