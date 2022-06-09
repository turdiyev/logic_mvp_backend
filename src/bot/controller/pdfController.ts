import puppeteer from "puppeteer";
import path from "path";
import * as fs from "fs";

export default class PdfController {

  public htmlToPDF = async ({ data: dataBinding, options }: any): Promise<Buffer> => {
    const templateHtml = fs.readFileSync(
      path.join(process.cwd(), "public/pdf.html"),
      "utf8"
    );

    const browser = await puppeteer.launch({
      args: ["--no-sandbox"],
      headless: true
    });
    const page = await browser.newPage();
    await page.goto(`data:text/html;charset=UTF-8,${'<html></html>'}`, {
      waitUntil: "networkidle0"
    });
    const pdf = await page.pdf(options);

    await browser.close();

    return pdf;
  };
}
