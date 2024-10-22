import { error } from "console";
import fs from "fs";
import { NextResponse } from "next/server";

export async function saveToFile(filePath: string, data: any) {
  if (process.env.NODE_ENV === "development") {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  }
  return;
}

// export enum REQUEST_SENDER {
//   SERVER = "server",
//   CLIENT = "client",
// }

// const MESSAGE = `All actions are disabled in demo mode.`;

// export function checkDemoMode() {
//   if (process.env.DEMO_MODE === "true") {
//     return {
//       error: MESSAGE,
//       status: 403,
//     };
//   }
// }
