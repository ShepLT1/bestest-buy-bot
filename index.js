const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ product: 'firefox' });
  const page = await browser.newPage();
  await page.emulate({
    name: "Desktop 1280x800",
    viewport: {
      width: 1024,
      height: 1200,
    },
  });
  await page.goto('https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442');
  await page.screenshot({ path: 'rtx3070.png' }, { fullPage: true });
  console.log("screenshot acquired")
  await browser.close();
})();