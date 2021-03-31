const fs = require('fs');
const purchasedPath = './purchase.json';
const purchase = require('./purchaseProduct');

// wait for period of time before proceeding
const wait = (number) => {
    return new Promise((resolve) => {
      setTimeout(resolve, number);
    });
};

// gets random wait time to avoid bot detection
const getRandomInt = async (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}


const main = async () => {

    // restart every hour in case of process hanging due to error
    setTimeout(function(){
        process.exit(0);
    }, 60 * 60 * 1000);
    
    let purchaseCompleted = false;

    // check if purchase has already been completed
    fs.access(purchasedPath, fs.F_OK, (err) => {
        if (err) {
            console.log("Purchase.json not found")
        } else {
            purchaseCompleted = true
        }
    })

    // if purchase not completed, proceed with purchase attempt
    try {
        await wait(5000);
        if (!purchaseCompleted) {
            let purchasedProduct = false;
            while (!purchasedProduct) {
                purchasedProduct = await purchase.attemptPurchase();
                if (!purchasedProduct) {
                    const retryWaitTime = await getRandomInt(30000, 60000);
                    console.log("Retrying in " + retryWaitTime)
                    await wait(retryWaitTime)
                }
            }

        // if purchase already completed, sleep for 2 days and exit
        } else if (purchaseCompleted) {
            console.log("Sleeping for 2 days")
            await wait(60000 * 60 * 48)
            process.exit();
        }

    // restart application on error
    } catch (e) {
        process.exit(0)
    }
}

main();