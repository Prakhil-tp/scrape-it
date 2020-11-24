const cheerio = require("cheerio");

const Lazada = (html, url) => {
  const $ = cheerio.load(html);

  /**
   * A fuction which returns Product details
   * @function getProduct
   * @returns {object} - returns a JSON object
   */
  const getProduct = () => {
    const product = {};

    // link
    product["link"] = url;

    const breadcrumb = $("ul[class=breadcrumb]").children();
    // title
    product["title"] = $(breadcrumb[breadcrumb.length - 1])
      .find("span.breadcrumb_item_text > span")
      .text();

    // category
    product["category"] = $(breadcrumb[breadcrumb.length - 2])
      .find("a > span")
      .text();

    // brand
    product["brand"] = $("div[class=pdp-product-brand]")
      .find("a")
      .first()
      .text();

    // price
    product["price"] = $("div[class=pdp-product-price]")
      .find("span")
      .first()
      .text();

    // discount
    product["discount"] = $("div[class=pdp-product-price] > div")
      .find("span")
      .last()
      .text();

    // promotion
    const promotions = [];
    $("div[class=tag-list]")
      .children()
      .each((i, element) => {
        const text = $(element).text().trim();
        promotions.push(text);
      });

    product["promotions"] = promotions.join(" | ");

    // soldBy
    product["seller"] = $("div.seller-name__detail > a").first().text();

    // seller info
    const sellerInfo = $("div[class=pdp-seller-info-pc]").children();
    product["positiveSellerRating"] = $(sellerInfo[0]).children().last().text();
    product["shipOnTime"] = $(sellerInfo[1]).children().last().text();
    product["chatResponseRate"] = $(sellerInfo[2]).children().last().text();

    // authenticity
    const isAuthentic = $("div[class=warranty__options]")
      .children()
      .first()
      .find("div.delivery-option-item__title")
      .text()
      .trim();

    product["authenticity"] =
      isAuthentic === "100% Authentic" ? isAuthentic : "";

    // Warranty
    product["warrantyType"] = "";
    product["warrantyPeriod"] = "";
    $("div[class=pdp-general-features] > ul")
      .children()
      .each((i, elem) => {
        const key = $(elem).find("span").text().trim();
        if (key === "Warranty Type") {
          product["warrantyType"] = $(elem).find("div.key-value").text();
        } else if (key === "Warranty Period") {
          product["warrantyPeriod"] = $(elem).find("div.key-value").text();
        }
      });

    // Standard delivery
    product["standardDeliveryTime"] = $("div[class=delivery]")
      .find("div[class=delivery-option-item__time]")
      .text();
    product["shippingCost"] = $("div[class=delivery]")
      .find("div[class=delivery-option-item__shipping-fee]")
      .text();

    // rating
    product["rating"] = $("div.mod-rating").find("span.score-average").text();

    // rating count
    const ratingList = $("div.mod-rating").find("div.detail > ul").children();
    product["fiveStarRatingCount"] = $(ratingList[0])
      .find("span.percent")
      .text();

    product["fourStarRatingCount"] = $(ratingList[1])
      .find("span.percent")
      .text();

    product["threeStarRatingCount"] = $(ratingList[2])
      .find("span.percent")
      .text();

    product["twoStarRatingCount"] = $(ratingList[3])
      .find("span.percent")
      .text();

    product["oneStarRatingCount"] = $(ratingList[4])
      .find("span.percent")
      .text();

    // product availability
    $("div[class=pdp-cart-concern]")
      .children()
      .each((i, elem) => {
        const text = $(elem).find("span.pdp-button-text > span").text().trim();
        if (text === "Buy Now") product["availability"] = true;
        else if (text === "Add to Wishlist") product["availability"] = false;
      });

    return product;
  };

  return { getProduct };
};

module.exports = Lazada;
