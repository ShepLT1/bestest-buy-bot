# bestest-buy-bot
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  

## Description
Best Buy purchase bot developed to compete with scalper bots. Sends purchase updates via discord web hook. Utilizes node.js, puppeteer, and pm2.  
<br>

## Table of Contents

- [Demo](#demo)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [Contributing](#contributing)
- [Questions](#questions)  
<br>

## Demo

![bestest-buy-bot](./screenshots/bestest-buy-bot-demo.gif)  
<br>

## Installation
Clone this repository via Git. Once cloned, run 
<pre><code>npm install</code></pre>
to download node modules.  
<br>
You may also need to install the specific firefox version of puppeteer and firefox nightly. To do this, run  
<pre><code>PUPPETEER_PRODUCT=firefox npm i puppeteer</code></pre>
<br>

## Configuration
You can edit the best buy product page url (currently set to Nvidia RTX 3070 Founders Edition) and price limit on line 9 and 10 of purchaseProduct.js.

You will need to set up a .env file in the root directory to utilize the bot. To do this, navigate to the bestest-buy-bot folder and add a file named '.env'. The file contents should be as follows (substituting your information within the quotation marks):  
<br>
<pre><code>FIRST="FIRST_NAME"
LAST="LAST_NAME"
STREET="STREET_ADDRESS"
STREET2="APARTMENT_NUMBER"
CITY="CITY"
STATE="STATE"
ZIP="ZIPCODE"
EMAIL="EMAIL"
PHONE="PHONE"
NUMBER="CREDIT_CARD_NUMBER"
EXPIREMONTH="CREDIT_CARD_EXPIRATION_MONTH"
EXPIREYEAR="CREDIT_CARD_EXPIRATION_YEAR"
CVV="CREDIT_CARD_SECURITY_CODE"
DISCORD="DISCORD_WEBHOOK_URL"</code></pre>
**make sure to leave the quotation marks in place  
**leave STREET_2 blank if apartment number not applicable  
<br>

## Usage
Auto-purchasing is disabled to avoid accidental purchasing. To enable auto-purchase, uncomment lines 172-177 in purchaseProduct.js.  
<br>
To start bot, navigate to bestest-buy-bot folder in command line interface and type
<pre><code>pm2 start index.js</code></pre>
To stop bot, type <pre><code>pm2 stop index.js</code></pre>
To monitor bot after initiating bot startup, type <pre><code>pm2 monit</code></pre>
To view bot logs, type <pre><code>pm2 logs</code></pre>
NOTE: pm2 logs and pm2 monit will log an error within puppeteer:  
<pre><code>TypeError: Cannot read property '1' of null</code></pre>
This is normal and does not impact bot performance.  
<br>

## License 
Click on the badge (top of page) for this project's MIT licensing information.  
<br>

## Contributing

Pull requests and stars are always welcome. For bugs and feature requests, [please submit an issue](https://github.com/ShepLT1/bestest-buy-bot/issues/new)  