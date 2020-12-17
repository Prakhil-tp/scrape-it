const fs = require("fs");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const cliProgress = require("cli-progress");
const knex = require("./db");
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

  const createDbTable = async () => {
    const isTableExist = await knex.schema.hasTable(platform);
    if (!isTableExist) {
      switch (platform) {
        case "lazada":
          await knex.schema.createTable("lazada", (table) => {
            table.increments("_id").primary();
            table.string("date", 50);
            table.string("link", 300);
            table.string("title", 500);
            table.string("category", 100);
            table.string("brand", 100);
            table.string("price", 50);
            table.string("discount", 500);
            table.string("promotions", 500);
            table.string("seller", 200);
            table.string("positive_seller_rating", 50);
            table.string("ship_on_time", 50);
            table.string("chat_response_rate", 50);
            table.string("authenticity", 100);
            table.string("warranty_type", 300);
            table.string("warranty_period", 100);
            table.string("standard_delivery_time", 100);
            table.string("shipping_cost", 100);
            table.string("rating");
            table.string("five_star_count");
            table.string("four_star_count");
            table.string("three_star_count");
            table.string("two_star_count");
            table.string("one_star_count");
            table.boolean("availability");
          });
          break;
        case "shopee":
          await knex.schema.createTable("shopee", (table) => {
            table.increments("_id").primary();
            table.string("date", 50);
            table.string("link", 300);
            table.string("title", 500);
            table.string("category", 300);
            table.string("brand", 150);
            table.string("shop", 100);
            table.string("best_before", 50);
            table.string("stock_available");
            table.string("price", 100);
            table.string("discount", 100);
            table.string("promo");
            table.string("bundle_deal_recommendation");
            table.string("rating", 50);
            table.string("num_of_ratings", 100);
            table.string("sold", 100);
            table.string("free_shipping_with_order_of_xx", 100);
            table.string("shipping_cost", 100);
            table.string("shop_ratings", 100);
            table.string("products_count", 100);
            table.string("response_rate", 50);
            table.string("response_time", 100);
            table.string("followers", 100);
            table.string("shop_voucher");
          });
          break;
      }
    }
  };

  const insertToDB = async (data) => {
    try {
      const date = getDate();
      const row = await knex
        .select("*")
        .from(platform)
        .where("link", data.link);
      if (row && row.length) {
        knex(platform)
          .where({ _id: row[0]._id })
          .update({ ...data });
      } else {
        await knex(platform).insert({ date, ...data });
      }
    } catch (e) {
      fs.writeFileSync("error.log", e.message);
      fs.appendFileSync("error.log", JSON.stringify(e));
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

    insertToDB(data);
    fs.appendFileSync(path, fileText, { encoding: "utf8" });
  };

  createFile();
  createDbTable();
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
      console.log("\n Captcha detected!, will retry after 2 minute");
      await new Promise((resolve) => setTimeout(resolve, 120 * 1000));
      return getHtml(url, platform);
    }
  } else {
    try {
      await page.goto(url, { waitUntil: "networkidle0" });
    } catch (e) {
      //console.log("\n ", e.message);
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
