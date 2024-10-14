import fs from "fs";

export async function saveToFile(filePath: string, data: any) {
  if (process.env.NODE_ENV === "development") {
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  }
  return;
}
