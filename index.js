const services = require("./services");
const Lazada = require("./lazada");
const csv = require("csvtojson");

(async () => {
  const input = await csv().fromFile("./input.csv");
  const filename = `./output/output-lazada-${services.getDate()}.csv`;
  services.createFile(filename);

  const urls = input.reduce((acc, row) => {
    const values = Object.values(row);
    return acc.concat(values);
  }, []);

  const log = services.initiateLog(urls.length);

  for (let url of urls) {
    const isValid = services.validateUrl(url);
    if (isValid) {
      const delay = 60 * 1000; // 2 minutes
      await new Promise((resolve) => setTimeout(resolve, delay));

      const html = await services.getHtml(url);
      const lazada = Lazada(html, url);
      const product = lazada.getProduct();
      services.appendToFile(filename, product);

      //log
      log.increment({ title: product.title });
    } else {
      services.appendToFile(filename, null);
      log.increment({ title: "N.A" });
    }
  }

  bar1.stop();
  console.log("scrape finished !");
})();
