// import { PrismaClient } from "@prisma/prisma-edge";
// import { Pool, neonConfig } from "@neondatabase/serverless";
// // import { PrismaNeon } from "@prisma/adapter-neon";

// // import dotenv from "dotenv";
// import ws from "ws";

// // dotenv.config();
// neonConfig.webSocketConstructor = ws;
// const connectionString = `${process.env.DATABASE_URL}`;
// // console.log("DATABASE_URL : ", process.env.DATABASE_URL);
// // const connectionString = `${process.env.DATABASE_URL_NEON}`;
// // console.log("DATABASE_URL : ", process.env.DATABASE_URL_NEON);

// declare global {
//   var prismaEdge: PrismaClient | undefined;
// }

// const pool = new Pool({ connectionString });
// // const adapter = new PrismaNeon(pool);

// // const prismaEdge = global.prisma || new PrismaClient({adapter})
// // const prismaEdge =
// //   global.prismaEdge ||
// //   new PrismaClient({ adapter, log: ["info", "warn", "error"] });

// // if (process.env.NODE_ENV === "development") global.prismaEdge = prismaEdge;

// export default prismaEdge;

// //---------------------------------------------------
// //---------------------------------------------------
// //---------------------------------------------------
// //---------------------------------------------------
// //---------------------------------------------------

// // import { Pool } from "pg";
// // import { PrismaPg } from "@prisma/adapter-pg";
// // import { PrismaClient } from "@prisma/prisma-edge";

// // const connectionString = `${process.env.DATABASE_URL}`;

// // declare global {
// //   var prismaEdge: PrismaClient | undefined;
// // }

// // const pool = new Pool({
// //   connectionString: process.env.DATABASE_URL,
// // });

// // const adapter = new PrismaPg(pool);
// // const prismaEdge = new PrismaClient({ adapter });

// // export default prismaEdge;
// //---------------------------------------------------
// //---------------------------------------------------
// //---------------------------------------------------
// //---------------------------------------------------
// //---------------------------------------------------

// // import { Client } from "@planetscale/database";
// // import { PrismaPlanetScale } from "@prisma/adapter-planetscale";
// // import { PrismaClient } from "@prisma/prisma-edge";

// // const connectionString = `${process.env.DATABASE_URL}`;
// // const client = new Client({ url: process.env.DATABASE_URL });

// // const adapter = new PrismaPlanetScale(client);
// // const prismaEdge = new PrismaClient({ adapter });

// // export default prismaEdge;
