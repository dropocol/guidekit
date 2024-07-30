import { PrismaClient } from "@prisma/client";
import { Client } from "@planetscale/database";
import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
declare global {
  var prisma: PrismaClient | undefined;
}

const prisma =
  global.prisma || new PrismaClient({ log: ["info", "warn", "error"] });
if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
