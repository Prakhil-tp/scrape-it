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
    product["Brand"] = $("a[class=_2H-513]").first().text();

    //4. Shop name
    product["Shop"] = $("div[class=_3Lybjn]").text();

    //5. Best before
    let BestBeforeLabel = $("div[class=_2aZyWI]")
      .find("div")
      .eq(3)
      .find("label")
      .text();
    if (BestBeforeLabel === "Best Before") {
      product["Best_Before"] = $("div[class=_2aZyWI]")
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
        product["Best_Before"] = $("div[class=_2aZyWI]")
          .find("div")
          .eq(2)
          .find("div")
          .text();
      } else {
        product["Best_Before"] = "";
      }
    }

    //6. Stock available
    $("div[class=_2aZyWI]")
      .children()
      .each((i, elem) => {
        const key = $(elem).find("label").text().trim();
        if (key === "Stock") {
          product["Stock_available"] = $(elem).find("div").text();
        }
      });

    //7. Price
    product["Price"] = $("div[class=_3n5NQx]").first().text();

    //8. Discount
    product["Discount"] = $("div[class=MITExd]").text();

    //9. Promo
    product["Promo"] = $("span.voucher-promo-value").text();

    //10..Bundle deal recommendation
    product["Bundle_deal_recommendation"] = $("div._3MJQdO.-fk5U-")
      .first()
      .text();

    //11. Rating count
    product["Ratings_count"] = $("div.flex.M3KjhJ").first().text();

    //12. Number of ratings
    product["#_of_ratings"] = $("div[class=_3Oj5_n]").text();

    //13. Sold
    product["Sold"] = $("div[class=_22sp0A]").text();

    //14. Free shipping with order of xx
    product["Free_shipping_with_order_of_xx"] = $("div._2bOZ3_").last().text();

    //15. Shipping fee
    product["Shipping_fee"] = $("div.flex.items-center.BtHdNz").first().text();

    //16. Shop ratings
    product["Shop_Ratings"] = $("div[class=_3mK1I2]")
      .find("span")
      .first()
      .text();

    //16.1 Products count
    product["Products_count"] = $("div[class=_3mK1I2]")
      .find("span")
      .eq(1)
      .text();

    //16.2 Response rate
    product["Response_rate"] = $("div[class=_3mK1I2]")
      .find("span")
      .eq(2)
      .text();

    //16.3 Response Time
    product["Response_Time"] = $("div[class=_3mK1I2]")
      .find("span")
      .eq(3)
      .text();

    //16.4 Followers
    product["Followers"] = $("div[class=_3mK1I2]").find("span").eq(5).text();

    //16.5 Shop voucher
    product["Shop_voucher"] = $("span.voucher-promo-value").text();

    return product;
  };

  return { getProduct };
};

module.exports = Shopee;
