const puppeteer = require('puppeteer-extra');
const pluginStealth = require("puppeteer-extra-plugin-stealth");
puppeteer.use(pluginStealth())
require('dotenv').config()
const fs = require('fs');
const { Webhook } = require('discord-webhook-node');
const hook = new Webhook(process.env.DISCORD);

const bestbuyURL = 'https://www.bestbuy.com/site/nvidia-geforce-rtx-3070-8gb-gddr6-pci-express-4-0-graphics-card-dark-platinum-and-black/6429442.p?skuId=6429442'
const priceLimit = 650;

const updateDiscord = async (page, message, file) => {
  try {
    await page.screenshot({ path: "./screenshots/" + file }, { fullPage: true });
    console.log(message)
    hook.send(message);
    hook.sendFile("./screenshots/" + file);
  } catch (e) {
    console.log(e)
    process.exit(0)
  }
}

module.exports = {

  attemptPurchase: async function() {

    // open firefox browser and new tab

    const browser = await puppeteer.launch({
      ignoreHTTPSErrors: true,
      // headless: false,
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

      // go to best buy URL and check if item is in stock

      await page.goto(bestbuyURL);
      await page.waitForSelector('.blue-assist-tab', { timeout: 20000 })
      const buttonText = await page.$eval('.add-to-cart-button', el => el.innerText);
      let price = await page.$eval('.priceView-layout-large .priceView-customer-price span', el => el.innerText);
      price = price.slice(1);

      // if in stock, send in stock & price notification via discord

      if (buttonText === "Add to Cart") {
        await updateDiscord(page, 'ITEM AVAILABLE for ' + price, 'available.png');

        // if price of in stock item is less than user's price limit, add item to cart

        if (price < priceLimit) {
          await page.evaluate(() =>
          document.querySelectorAll('.add-to-cart-button')[0].scrollIntoView(false))
        await page.evaluate(() =>
          document.querySelectorAll(".add-to-cart-button")[0].click()
        );
        await page.waitForTimeout(1000);

        // handle anti-bot queueing feature if present

        let clickAgain = false
        let addedToCart = await page.evaluate(() => document.querySelector('.dot') !== null);
        while (!clickAgain && !addedToCart) {
          const cart_btn_available = await page.evaluate(() => document.querySelector('.add-to-cart-button[disabled]') === null);
          if (cart_btn_available) {
            console.log("ok to click button")
            await page.evaluate(() => document.querySelectorAll(".add-to-cart-button")[0].click());
            clickAgain = true;
          } else {
            console.log("waiting")
            console.log("cart_btn_available", cart_btn_available)
            await page.waitForTimeout(2000)
            addedToCart = await page.evaluate(() => document.querySelector('.dot') !== null);
            console.log("addedToCart", addedToCart)
          }
        }

        // proceed to cart once product has been added to cart & update discord

        await updateDiscord(page, 'Added rtx 3070 to cart!', 'added-to-cart.png');
        await page.waitForTimeout(5000);
        await page.waitForSelector('.dot', { timeout: 20000 })
        await page.goto('https://www.bestbuy.com/cart');
        await page.waitForSelector('.checkout-buttons__checkout', { timeout: 20000 });
        await page.evaluate(() =>

        // update shipping zip code

          document.querySelectorAll('.change-zipcode-link')[0].click()
        );
        await page.waitForSelector('.update-zip__zip-input', { timeout: 20000 })
        await page.type('.update-zip__zip-input', process.env.ZIP, { delay: 100 })
        await page.evaluate(() =>
          document.querySelectorAll('.update-zip__input-group button')[0].click()
        );
        await page.waitForTimeout(3000)

        // proceed to checkout and update discord

        await page.evaluate(() =>
          document.querySelectorAll('.checkout-buttons__checkout button:not(disabled)')[0].click()
        );
        await updateDiscord(page, 'Proceeding with checkout!', 'checkout.png');
        await page.waitForSelector('.cia-guest-content', { timeout: 20000 });

        // continue with guest checkout and update discord

        await page.evaluate(() =>
          document.querySelectorAll('.cia-guest-content__continue')[0].click()
        );
        await updateDiscord(page, 'Continuing as guest!', 'guest.png');
        await page.waitForSelector('.streamlined__heading', { timeout: 20000 })
        const headingText = await page.$eval('.streamlined__heading span', el => el.innerText);

        // if shipping option available, fill out shipping info; if only in store pickup available, update discord and exit

        if (headingText === "Store Pickup Information") {
          console.log("store pickup")
          await updateDiscord(page, 'Only store pickup available!', 'store-pickup.png');
        } else {
          await page.waitForSelector('.address-form__first-name', { timeout: 20000 })
          await page.type('.address-form__first-name input', process.env.FIRST, { delay: 100 })
          await page.type('.address-form__last-name input', process.env.LAST, { delay: 100 })
          await page.evaluate(() =>
            document.querySelectorAll(".autocomplete__toggle")[0].click()
          );
          await page.type('[id="consolidatedAddresses.ui_address_2.street"]', process.env.STREET, { delay: 100 })
          await page.evaluate(() =>
            document.querySelectorAll(".address-form__showAddress2Link")[0].click()
          );
          await page.waitForSelector('[id="consolidatedAddresses.ui_address_2.street2"]', { timeout: 20000 })
          await page.type('[id="consolidatedAddresses.ui_address_2.street2"]', process.env.STREET2, { delay: 100 })
          await page.type('[id="consolidatedAddresses.ui_address_2.city"]', process.env.CITY, { delay: 100 })
          await page.select('select[name="state"]', process.env.STATE)
          await page.type('[id="consolidatedAddresses.ui_address_2.zipcode"]', process.env.ZIP, { delay: 100 })
          await page.type('[id="user.emailAddress"]', process.env.EMAIL, { delay: 100 })
          await page.type('[id="user.phone"]', process.env.PHONE, { delay: 100 })

          // continue to payment options page and update discord

          await page.evaluate(() =>
            document.querySelectorAll(".button--continue button")[0].click()
          );
          await updateDiscord(page, 'Shipping and contact info populated. Heading to payment info!', 'shipping.png');

          // fill out payment info

          await page.waitForSelector('[id="optimized-cc-card-number"]', { timeout: 20000 })
          await page.type('[id="optimized-cc-card-number"]', process.env.NUMBER, { delay: 100 });
          await page.select('select[name="expiration-month"]', process.env.EXPIREMONTH);
          await page.select('select[name="expiration-year"]', process.env.EXPIREYEAR);
          await page.type('[id="credit-card-cvv"]', process.env.CVV, { delay: 100 });

          // place order and update discord

          await updateDiscord(page, 'Placing order!', 'order-preview.png')
          await page.evaluate(() =>
            document.querySelectorAll('.button--place-order button')[0].scrollIntoView(false)
          )
          await page.evaluate(() =>
            document.querySelectorAll(".button--place-order button.btn-primary")[0].click()
          );
          await page.waitForSelector('.thank-you-enhancement__emphasis', { timeout: 60000 })

          // update discord of successful purchase, write file to prevent duplicate purchase, and exit

          await updateDiscord(page, 'PURCHASE SUCCESSFUL!', 'order.png')
          fs.writeFileSync('purchase.json', '{}');
          await browser.close()
          console.log("browser closed")
          return true
          }

          // do not purchase if price is above limit

        } else if (price >= priceLimit) {
          await browser.close()
          console.log("browser closed")
          return false
        }

        // log that product is not in stock

      } else {
        const time = new Date();
        console.log("Not in Stock " + time);
        await browser.close()
        console.log("browser closed")
        return false
      }

      // restart application on error

    } catch (e) {
      console.log("Error, restarting")
      await browser.close()
      console.log("browser closed")
      process.exit(0)
    }
  }
}
