const fs = require("fs");
//const UserAgent = require("user-agents");
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

/**
 * A helper function to create csv file
 * @function createFile
 * @param {string} path - file path with filename
 * @returns {undefined}
 */
function createFile(path) {
  fs.writeFileSync(
    path,
    "LINK, TITLE, CATEGORY, BRAND, PRICE, DISCOUNT, PROMOTION, SELLER, POSITIVE SELLER RATING, SHIP ON TIME, CHAT RESPONSE RATE, AUTHENTICITY, WARRANTY TYPE, WARRANTY PERIOD, STANDARD DELIVERY TIME (Metro manilla), SHIPPING COST (Metro manilla), RATING, 5 STAR RATING COUNT, 4 STAR RATING COUNT, 3 STAR RATING COUNT, 2 STAR RATING COUNT, 1 STAR RATING COUNT, AVAILABILITY"
  );
}

/**
 * A helper function to append lines to the csv file.
 * @function appendToFile
 * @param {string} filepath - relative filepath
 * @param {object} data - data to be written.
 * @returns {undefined}
 */
function appendToFile(filePath, data) {
  if (!data) {
    return fs.appendFileSync(filePath, "\n N.A,,,,,,,,,,,,,,,");
  }
  let fileText = "\n";
  const values = Object.values(data);
  values.forEach((value) => {
    fileText += `"${value}",`;
  });

  fs.appendFileSync(filePath, fileText, { encoding: "utf8" });
}

/**
 * A helper function to get the html file of curresponding url
 * @function getHtml
 * @param {string} - url
 * @returns {string} - html as string.
 */
async function getHtml(url) {
  //const browser = await puppeteer.launch({ headless: false });
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  //const userAgent = new UserAgent();
  //await page.setUserAgent(userAgent.toString());
  //page.setDefaultNavigationTimeout(0);
  await page.goto(url, { timeout: 0 });

  const html = await page.content();
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

module.exports = { appendToFile, getHtml, createFile, getDate, validateUrl };
