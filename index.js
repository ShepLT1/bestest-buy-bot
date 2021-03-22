const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth())
const user = require('./config');
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(user.discord);

// test: https://www.bestbuy.com/site/pny-geforce-gt1030-2gb-pci-e-3-0-graphics-card-black/5901353.p?skuId=5901353
// 3070: https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442

const updateDiscord = async (page, message, file) => {
  try {
    await page.screenshot({ path: file }, { fullPage: true });
    console.log(message)
    hook.send(message);
    hook.sendFile("./" + file);
  } catch (e) {
    throw e
  }
}

(async () => {
  let purchased = false;
  while (purchased === false) {
    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      headless: false,
      product: 'firefox'
    });
    const page = await browser.newPage();
    await page.emulate({
      name: "Desktop 1024x1200",
      viewport: {
        width: 1024,
        height: 1200,
      },
    });

    try {
      await page.goto('https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442');
      await page.waitForSelector('.blue-assist-tab', { timeout: 20000 })
      const buttonText = await page.$eval('.add-to-cart-button', el => el.innerText);

      if (buttonText === "Add to Cart") {
        await page.evaluate(() =>
          document.querySelectorAll('.add-to-cart-button')[0].scrollIntoView(false))
        await page.evaluate(() =>
          document.querySelectorAll(".add-to-cart-button")[0].click()
        );
        await page.waitForTimeout(1000);
        let clickAgain = false
        let addedToCart = await page.evaluate(() => document.querySelector('.dot') !== null);
        while (!clickAgain && !addedToCart) {
          const cart_btn_available = await page.evaluate(() => document.querySelector('.add-to-cart-button[disabled]') === null);
          if (cart_btn_available) {
            console.log("ok to click button")
            // await page.evaluate(() => document.querySelectorAll(".add-to-cart-button")[0].click());
            clickAgain = true;
          } else {
            console.log("waiting")
            console.log("cart_btn_available", cart_btn_available)
            await page.waitForTimeout(2000)
            addedToCart = await page.evaluate(() => document.querySelector('.dot') !== null);
            console.log("addedToCart", addedToCart)
          }
        }
        await updateDiscord(page, 'Added rtx 3070 to cart!', 'added-to-cart.png');
        await page.waitForSelector('.dot', { timeout: 20000 })
        await page.goto('https://www.bestbuy.com/cart');
        await page.waitForSelector('.checkout-buttons__checkout', { timeout: 20000 });
        await page.evaluate(() =>
          document.querySelectorAll('.change-zipcode-link')[0].click()
        );
        await page.waitForSelector('.update-zip__zip-input', { timeout: 20000 })
        await page.type('.update-zip__zip-input', user.shipping.zip, { delay: 100 })
        await page.evaluate(() =>
          document.querySelectorAll('.update-zip__input-group button')[0].click()
        );
        await page.waitForTimeout(3000)
        await page.evaluate(() =>
          document.querySelectorAll('.checkout-buttons__checkout button:not(disabled)')[0].click()
        );
        await updateDiscord(page, 'Proceeding with checkout!', 'checkout.png');
        await page.waitForSelector('.cia-guest-content', { timeout: 20000 });
        await page.evaluate(() =>
          document.querySelectorAll('.cia-guest-content__continue')[0].click()
        );
        await updateDiscord(page, 'Continuing as guest!', 'guest.png');
        await page.waitForSelector('.streamlined__heading', { timeout: 20000 })
        const headingText = await page.$eval('.streamlined__heading span', el => el.innerText);

        if (headingText === "Store Pickup Information") {
          console.log("store pickup")
          await updateDiscord(page, 'Only store pickup available!', 'store-pickup.png');
        } else {
          await page.waitForSelector('.address-form__first-name', { timeout: 20000 })
          await page.type('.address-form__first-name input', user.shipping.first, { delay: 100 })
          await page.type('.address-form__last-name input', user.shipping.last, { delay: 100 })
          await page.evaluate(() =>
            document.querySelectorAll(".autocomplete__toggle")[0].click()
          );
          await page.type('[id="consolidatedAddresses.ui_address_2.street"]', user.shipping.street, { delay: 100 })
          await page.evaluate(() =>
            document.querySelectorAll(".address-form__showAddress2Link")[0].click()
          );
          await page.waitForSelector('[id="consolidatedAddresses.ui_address_2.street2"]', { timeout: 20000 })
          await page.type('[id="consolidatedAddresses.ui_address_2.street2"]', user.shipping.street2, { delay: 100 })
          await page.type('[id="consolidatedAddresses.ui_address_2.city"]', user.shipping.city, { delay: 100 })
          await page.select('select[name="state"]', user.shipping.state)
          await page.type('[id="consolidatedAddresses.ui_address_2.zipcode"]', user.shipping.zip, { delay: 100 })
          await page.type('[id="user.emailAddress"]', user.shipping.email, { delay: 100 })
          await page.type('[id="user.phone"]', user.shipping.phone, { delay: 100 })
          await page.evaluate(() =>
            document.querySelectorAll(".button--continue button")[0].click()
          );
          await updateDiscord(page, 'Shipping and contact info populated. Heading to payment info!', 'shipping.png');
          await page.waitForSelector('[id="optimized-cc-card-number"]', { timeout: 20000 })
          await page.type('[id="optimized-cc-card-number"]', user.payment.number, { delay: 100 });
          await page.select('select[name="expiration-month"]', user.payment.expireMonth);
          await page.select('select[name="expiration-year"]', user.payment.expireYear);
          await page.type('[id="credit-card-cvv"]', user.payment.cvv, { delay: 100 });
          await updateDiscord(page, 'Placing order!', 'order-preview.png')
          await page.evaluate(() =>
            document.querySelectorAll('.button--place-order button')[0].scrollIntoView(false)
          )
          // await page.evaluate(() =>
          //   document.querySelectorAll(".button--place-order button.btn-primary")[0].click()
          // );
          await page.waitForSelector('.thank-you-enhancement__emphasis', { timeout: 60000 })
          await updateDiscord(page, 'HELL YEAH WE GOT IT!', 'order.png')
          purchased = true;
          await browser.close();
        }
      } else {
        console.log("Not in Stock");
        await page.waitForTimeout(60000)
        await browser.close();
      }
    } catch (e) {
      await updateDiscord(page, '***** ERROR IN PURCHASE. ABORTING *****', 'error.png')
      await browser.close()
      throw e
    }
  }
})();