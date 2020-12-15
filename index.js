const services = require("./services");
const csv = require("csvtojson");

(async () => {
  const platform = process.argv[2];
  if (!["lazada", "shopee"].includes(platform)) {
    console.log("platform not supported !");
    process.exit(0);
  }

  const filename = `./output/output-${platform}-${services.getDate()}.csv`;
  const file = services.File(filename, platform);
  const input = await csv().fromFile(`./${platform}_input.csv`);

  const urls = input.reduce((acc, row) => {
    const values = Object.values(row);
    return acc.concat(values);
  }, []);

  const log = services.initiateLog(urls.length, platform);

  for (let url of urls) {
    const isValid = services.validateUrl(url);
    if (isValid) {
      if (platform === "lazada") {
        const delay = 60 * 1000; // 1 minutes
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
      const product = await services.getProduct(platform, url);
      file.appendToFile(product);
      log.increment({ title: product.title });
    } else {
      file.appendToFile(null);
      log.increment({ title: "N.A" });
    }
  }
  log.stop();
  console.log("scrape finished !");
})();
