const puppeteer = require("puppeteer");
const path = require("path");

async function captureScreenshots() {
  const browser = await puppeteer.launch({
    defaultViewport: null,
    headless: "new",
  });

  try {
    const page = await browser.newPage();

    // Desktop Screenshot (1280x720)
    await page.setViewport({ width: 1280, height: 720 });
    await page.goto("https://convo.cafe", { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(__dirname, "../public/images/screenshots/desktop.png"),
      fullPage: false,
    });
    console.log("Desktop screenshot captured");

    // Mobile Screenshot (750x1334)
    await page.setViewport({ width: 750, height: 1334 });
    await page.goto("https://convo.cafe", { waitUntil: "networkidle0" });
    await page.screenshot({
      path: path.join(__dirname, "../public/images/screenshots/mobile.png"),
      fullPage: false,
    });
    console.log("Mobile screenshot captured");
  } catch (error) {
    console.error("Error capturing screenshots:", error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();
