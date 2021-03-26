const pm2 = require('pm2');
const fs = require('fs');
const purchasedPath = './purchase.json';

const main = async () => {

    let purchaseCompleted = false

    const wait = (number) => {
        return new Promise((resolve) => {
          setTimeout(resolve, number);
        });
    };

    fs.access(purchasedPath, fs.F_OK, (err) => {
        if (err) {
            console.log("Purchase.json not found")
        } else {
            purchaseCompleted = true
        }
    })

    try {
        await wait(5000);
        if (!purchaseCompleted) {
            const purchaseProduct = await require('./purchaseProduct');
            console.log(purchaseProduct)
        } else if (purchaseCompleted) {
            console.log("Sleeping for 2 days")
            await wait(60000 * 60 * 48)
            process.exit();
        }
        return true;
    } catch (e) {
        throw e
    }
}

pm2.connect(async (e) => {
    if (e) {
      console.log(e);
      process.exit(2);
    }

    let finished = false;
  
    while (!finished) {
        try {
            finished = await main();
          } catch (e) {
            throw e
          }
    }
        
    pm2.delete('index', () => {
      console.log('Process closed');
    });
  });