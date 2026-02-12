// Import the Puppeteer library
const puppeteer = require('puppeteer');

// Define the URL of the webpage you want to scrape
//const url = 'https://www.example.com'; // Replace with the URL you want to scrape

// Define an async function to perform the web scraping
async function scrapeWebsite(url) {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);

        // Modify the selectors to match the structure of the website you're scraping
        const productName = await page.$eval('#title', element => element.textContent.trim());
        //const price = await page.$eval('.a-price > span > span > span', element => element.textContent.trim());
        //const currency = await page.$eval('.a-price-symbol', element => element.textContent.trim());
        const price = await page.$eval('.a-price > span', element => element.textContent.trim());
        //console.log(price)
        //console.log(currency)
        const imageUrl = await page.$eval('.imgTagWrapper > img', element => element.src);

        await browser.close();

        return {
            productName,
            price,
            imageUrl,
            productUrl: url
        };
    } catch (error) {
        throw error;
    }
}

// Call the async function to start the web scraping
//scrapeWebsite();

module.exports = scrapeWebsite;