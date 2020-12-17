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
    product["positive_seller_rating"] = $(sellerInfo[0])
      .children()
      .last()
      .text();
    product["ship_on_time"] = $(sellerInfo[1]).children().last().text();
    product["chat_response_rate"] = $(sellerInfo[2]).children().last().text();

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
    product["warranty_type"] = "";
    product["warranty_period"] = "";
    $("div[class=pdp-general-features] > ul")
      .children()
      .each((i, elem) => {
        const key = $(elem).find("span").text().trim();
        if (key === "Warranty Type") {
          product["warranty_type"] = $(elem).find("div.key-value").text();
        } else if (key === "Warranty Period") {
          product["warranty_period"] = $(elem).find("div.key-value").text();
        }
      });

    // Standard delivery
    product["standard_delivery_time"] = $("div[class=delivery]")
      .find("div[class=delivery-option-item__time]")
      .text();
    product["shipping_cost"] = $("div[class=delivery]")
      .find("div[class=delivery-option-item__shipping-fee]")
      .text();

    // rating
    product["rating"] = $("div.mod-rating").find("span.score-average").text();

    // rating count
    const ratingList = $("div.mod-rating").find("div.detail > ul").children();
    product["five_star_count"] = $(ratingList[0]).find("span.percent").text();

    product["four_star_count"] = $(ratingList[1]).find("span.percent").text();

    product["three_star_count"] = $(ratingList[2]).find("span.percent").text();

    product["two_star_count"] = $(ratingList[3]).find("span.percent").text();

    product["one_star_count"] = $(ratingList[4]).find("span.percent").text();

    // product availability
    const isOutOfStock = $("*").is("span[class=quantity-content-warning]");
    product["availability"] = !!product.title && !isOutOfStock;

    return product;
  };

  return { getProduct };
};

module.exports = Lazada;
