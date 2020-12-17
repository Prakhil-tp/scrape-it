const cheerio = require("cheerio");

const Shopee = (html, url) => {
  const $ = cheerio.load(html);

  /**
   * A fuction which returns Product details
   * @function getProduct
   * @returns {object} - returns a JSON object
   *
   */

  const getProduct = () => {
    const product = {};

    // link
    product["link"] = url;

    //2. Product name
    product["title"] = $("div[class=qaNIZv]").find("span").first().text();

    //1. Product category
    product["category"] = $("a[class=JFOy4z]").last().text();

    //3. Brand name
    product["brand"] = $("a[class=_2H-513]").first().text();

    //4. Shop name
    product["shop"] = $("div[class=_3Lybjn]").text();

    //5. Best before
    let BestBeforeLabel = $("div[class=_2aZyWI]")
      .find("div")
      .eq(3)
      .find("label")
      .text();
    if (BestBeforeLabel === "Best Before") {
      product["best_before"] = $("div[class=_2aZyWI]")
        .find("div")
        .eq(3)
        .find("div")
        .text();
    } else {
      // product["Best_Before"] = ''
      BestBeforeLabel = $("div[class=_2aZyWI]")
        .find("div")
        .eq(2)
        .find("label")
        .text();
      if (BestBeforeLabel === "Best Before") {
        product["best_before"] = $("div[class=_2aZyWI]")
          .find("div")
          .eq(2)
          .find("div")
          .text();
      } else {
        product["best_before"] = "";
      }
    }

    //6. Stock available
    $("div[class=_2aZyWI]")
      .children()
      .each((i, elem) => {
        const key = $(elem).find("label").text().trim();
        if (key === "Stock") {
          product["stock_available"] = $(elem).find("div").text();
        }
      });

    //7. Price
    product["price"] = $("div[class=_3n5NQx]").first().text();

    //8. Discount
    product["discount"] = $("div[class=MITExd]").text();

    //10..Bundle deal recommendation
    product["bundle_deal_recommendation"] = $("div._3MJQdO.-fk5U-")
      .first()
      .text();

    //11. Rating count
    product["rating"] = $("div.flex.M3KjhJ").first().text();

    //12. Number of ratings
    product["num_of_ratings"] = $("div[class=_3Oj5_n]").text();

    //13. Sold
    product["sold"] = $("div[class=_22sp0A]").text();

    //14. Free shipping with order of xx
    product["free_shipping_with_order_of_xx"] = $("div._2bOZ3_").last().text();

    //15. Shipping fee
    product["shipping_cost"] = $("div.flex.items-center.BtHdNz").first().text();

    //16. Shop ratings
    product["shop_ratings"] = $("div[class=_3mK1I2]")
      .find("span")
      .first()
      .text();

    //16.1 Products count
    product["products_count"] = $("div[class=_3mK1I2]")
      .find("span")
      .eq(1)
      .text();

    //16.2 Response rate
    product["response_rate"] = $("div[class=_3mK1I2]")
      .find("span")
      .eq(2)
      .text();

    //16.3 Response Time
    product["response_time"] = $("div[class=_3mK1I2]")
      .find("span")
      .eq(3)
      .text();

    //16.4 Followers
    product["followers"] = $("div[class=_3mK1I2]").find("span").eq(5).text();

    //16.5 Shop voucher
    product["shop_voucher"] = $("span.voucher-promo-value").text();
    let percentageOff = $("div.mini-vouchers__vouchers").text();
    if (percentageOff.length > 0) {
      product["shop_voucher"] = $("div.mini-vouchers__vouchers").text();
    }
    product["promo"] = product.shop_voucher;
    return product;
  };

  return { getProduct };
};

module.exports = Shopee;
