const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const cliProgress = require("cli-progress");
const Lazada = require("./lazada");
const Shopee = require("./shopee");

/**
 * A closure file operations
 * @function File
 * @param {string} path - file path
 * returns {object}
 */
function File(path, platform) {
  let counter = 0;

  const createFile = () => {
    if (platform === "lazada") {
      fs.writeFileSync(
        path,
        "NO, LINK, TITLE, CATEGORY, BRAND, PRICE, DISCOUNT, PROMOTION, SELLER, POSITIVE SELLER RATING, SHIP ON TIME, CHAT RESPONSE RATE, AUTHENTICITY, WARRANTY TYPE, WARRANTY PERIOD, STANDARD DELIVERY TIME (Metro manilla), SHIPPING COST (Metro manilla), RATING, 5 STAR RATING COUNT, 4 STAR RATING COUNT, 3 STAR RATING COUNT, 2 STAR RATING COUNT, 1 STAR RATING COUNT, AVAILABILITY"
      );
    } else {
      fs.writeFileSync(
        path,
        "NO, LINK, TITLE, CATEGORY, BRAND, SHOP, BEST BEFORE, STOCK AVAILABLE, PRICE, DISCOUNT, PROMO, BUNDLE DEAL RECOMMENDATION, RATINGS COUNT, # OF RATINGS, SOLD, FREE SHIPPING WITH ORDER OF XX, SHIPPING FEE, SHOP RATINGS, PRODUCTS COUNT, RESPONSE RATE, RESPONSE TIME, FOLLOWERS, SHOP VOUCHER"
      );
    }
  };

  const appendToFile = (data) => {
    if (!data) {
      return fs.appendFileSync(path, `\n ${++counter},N.A,,,,,,,,,,,,,,,`);
    }
    let fileText = `\n ${++counter},`;
    const values = Object.values(data);
    values.forEach((value) => {
      fileText += `"${value}",`;
    });

    fs.appendFileSync(path, fileText, { encoding: "utf8" });
  };

  createFile();
  return { appendToFile };
}

/**
 * A helper function to get the html file of curresponding url
 * @function getHtml
 * @param {string} - url
 * @returns {string} - html as string.
 */
async function getHtml(url, platform) {
  //const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  let html = "";

  if (platform === "lazada") {
    try {
      await page.goto(url, { waitUntil: "load", timeout: 40000 });
      html = await page.content();
      // captcha test
      const $ = cheerio.load(html);
      const isCaptcha = $("*").is("h1[class=not-found-text]");
      if (isCaptcha) throw new Error("Captcha detected");
    } catch (e) {
      if (browser) await browser.close();
      console.log("\n Captcha detected!, will retry after 1 minute");
      await new Promise((resolve) => setTimeout(resolve, 60 * 1000));
      return getHtml(url, platform);
    }
  } else {
    try {
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
    } catch (e) {
      console.log("\n ", e.message);
    }
    html = await page.content();
  }
  await browser.close();
  return html;
}

/**
 * A helper function to validate urls
 * @function validateUrl
 * @param {string} url -  input url
 * @returns {boolean} - true/false
 */

function validateUrl(url) {
  const expression = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
  return url.match(expression);
}

/**
 * A helper function to get date in yyyymmdd format
 * @function getDate
 * @returns {string}
 */
function getDate() {
  var d = new Date(),
    month = "" + (d.getMonth() + 1),
    day = "" + d.getDate(),
    year = d.getFullYear();

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  return [year, month, day].join("");
}

/**
 * Helper function to handle logs on console
 * @function initiateLog
 * @returns {object}
 */
function initiateLog(total, platform) {
  const logBar = new cliProgress.SingleBar({
    format:
      `${platform} |` +
      "{bar}" +
      "| {percentage}% || {value}/{total} links || {title}",
    hideCursor: true
  });
  logBar.start(total, 0, { title: "" });
  return logBar;
}

async function getProduct(platform, url) {
  const html = await getHtml(url, platform);
  switch (platform) {
    case "lazada": {
      const lazada = Lazada(html, url);
      const product = lazada.getProduct();
      return product;
    }
    case "shopee": {
      const shopee = Shopee(html, url);
      const product = shopee.getProduct();
      return product;
    }
    default:
      return "invalid platform";
  }
}

module.exports = {
  getHtml,
  getDate,
  validateUrl,
  initiateLog,
  getProduct,
  File
};
