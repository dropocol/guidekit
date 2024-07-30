import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";

// import dotenv from "dotenv";
// import ws from "ws";

// dotenv.config();
// neonConfig.webSocketConstructor = ws;
const connectionString = `${process.env.DATABASE_URL}`;
console.log("DATABASE_URL : ", process.env.DATABASE_URL);

declare global {
  var prisma: PrismaClient | undefined;
}

const pool = new Pool({ connectionString });
const adapter = new PrismaNeon(pool);

// const prismaEdge = global.prisma || new PrismaClient({adapter})
const prisma =
  global.prisma ||
  new PrismaClient({ adapter, log: ["info", "warn", "error"] });

if (process.env.NODE_ENV === "development") global.prisma = prisma;

export default prisma;
