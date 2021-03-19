const puppeteer = require('puppeteer');
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook("https://discord.com/api/webhooks/822600815554330674/rEdI_ksH_BXLY4LmWnTTWMwiLRMsGJsSkefiDn6lvJ0Ie3Z-bMqrJ66usKMfXFSAyyVI");

(async () => {
  const browser = await puppeteer.launch({ product: 'firefox' });
  const page = await browser.newPage();
  await page.emulate({
    name: "Desktop 10240x1200",
    viewport: {
      width: 1024,
      height: 1200,
    },
  });

  // test: https://www.bestbuy.com/site/hp-omen-30l-gaming-desktop-amd-ryzen-7-series-3700x-16gb-memory-nvidia-geforce-rtx-2060-1tb-hdd-256gb-ssd-black/6402514.p?skuId=6402514
  // 3070: https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442

  try {
    await page.goto('https://www.bestbuy.com/site/hp-omen-30l-gaming-desktop-amd-ryzen-7-series-3700x-16gb-memory-nvidia-geforce-rtx-2060-1tb-hdd-256gb-ssd-black/6402514.p?skuId=6402514');
    await page.waitForSelector('.add-to-cart-button')
    const buttonText = await page.$eval('.add-to-cart-button', el => el.innerText);
    await page.waitForTimeout(5000)

    if (buttonText === "Add to Cart") {
      await page.evaluate(() =>
        document.querySelectorAll('.add-to-cart-button')[0].scrollIntoView(false))
      await page.evaluate(() =>
        document.querySelectorAll(".add-to-cart-button")[0].click()
      );
      await page.screenshot({ path: 'added-to-cart.png' }, { fullPage: true });
      console.log("add to cart screenshot acquired")
      hook.send("Added rtx 3070 to cart!");
      hook.sendFile("./added-to-cart.png");
      await page.waitForSelector('.dot')
      await page.goto('https://www.bestbuy.com/cart');
      await page.waitForSelector('.checkout-buttons__checkout');
      await page.evaluate(() =>
        document.querySelectorAll('.checkout-buttons__checkout button:not(disabled)')[0].click()
      );
      await page.screenshot({ path: 'checkout.png' }, { fullPage: true });
      console.log("click checkout button screenshot acquired")
      hook.send("Proceeding with checkout!");
      hook.sendFile("./checkout.png");
      await page.waitForSelector('.cia-form__controls');
      await page.screenshot({ path: 'login-page.png' }, { fullPage: true });
      console.log("log in screenshot acquired");
      hook.send("Arrived at login page!");
      hook.sendFile("./login-page.png");
    }
  } catch (e) {
    browser.close()
    throw e
  }

  await browser.close();
})();