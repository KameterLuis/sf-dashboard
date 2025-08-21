import { getMonthFromWeek } from "@/lib/date-helper";
import { opendir, stat } from "fs/promises";
import path from "path";

async function folderMissingOrEmpty(dirPath: string): Promise<boolean> {
  try {
    const stats = await stat(dirPath);
    if (!stats.isDirectory()) return true;

    const dir = await opendir(dirPath);
    const entry = await dir.read();
    await dir.close();
    return entry === null;
  } catch (err: any) {
    if (err.code === "ENOENT") return true;
    throw err;
  }
}

export const POST = async (req: Request) => {
  try {
    const data = await req.json();
    const kw = data.kw;
    const type = data.type;

    const currentYear = new Date().getFullYear();
    const currentMonth = getMonthFromWeek(kw) - 1;

    const months = [
      "january",
      "february",
      "march",
      "april",
      "may",
      "june",
      "july",
      "august",
      "september",
      "october",
      "november",
      "december",
    ];
    const monthString = months[currentMonth];

    let dir;

    if (type == "datev") {
      dir = path.join(
        process.cwd(),
        `uploads/${currentYear}/monthly/${monthString}/${type}`
      );
    } else {
      dir = path.join(
        process.cwd(),
        `uploads/${currentYear}/weekly/kw${kw}/${type}`
      );
    }

    const isEmpty = await folderMissingOrEmpty(dir);

    return new Response(JSON.stringify({ missing: isEmpty }), { status: 200 });
  } catch (err) {
    console.error("File upload error:", err);
    return new Response(JSON.stringify({ missing: true }), {
      status: 500,
    });
  }
};
