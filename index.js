const puppeteer = require('puppeteer');

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
    console.log(buttonText)

    await page.waitForTimeout(5000)

    if (buttonText === "Add to Cart") {
      // await page.evaluate(() =>
      //   document.querySelectorAll('.add-to-cart-button')[0].scrollIntoView())
      await page.evaluate(() =>
        document.querySelectorAll(".add-to-cart-button")[0].click()
      );

      await page.waitForSelector('.dot')

      await page.goto('https://www.bestbuy.com/cart');

      // await page.evaluate(() =>
      //   document.querySelectorAll("a[href='/cart']")[0].click()
      // );

      // await page.waitForTimeout(5000)

      await page.waitForSelector('.checkout-buttons__checkout');

      await page.evaluate(() =>
        document.querySelectorAll('.checkout-buttons__checkout button:not(disabled)')[0].click()
      );

      await page.waitForSelector('#fld-e');

      await page.screenshot({ path: 'rtx3070.png' }, { fullPage: true });
      console.log("screenshot acquired")
    }
    // let proceed = false;

    // while (proceed === false) {
    //   const buttonText = await page.$eval('.add-to-cart-button', el => el.innerText);
    //   if (buttonText === "Add to Cart") {
    //     proceed = true;
    //   }
    //   console.log(buttonText)
    // }
  } catch (e) {
    browser.close()
    throw e
  }

  // click if add to cart button is not disabled or does not show 'check stores'
  await browser.close();
})();