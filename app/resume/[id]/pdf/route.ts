import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const { id } = params;
  const resumeUrl = `${process.env.BASE_URL}/resume/${id}`; // Set BASE_URL in your .env file

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.goto(resumeUrl, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({ format: "A4" });

  await browser.close();

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume-${id}.pdf"`,
    },
  });
}
