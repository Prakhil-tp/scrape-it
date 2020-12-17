const services = require("./services");

(async () => {
  const platform = "lazada";
  const filename = `./output/output-${platform}-${services.getDate()}.csv`;
  const file = services.File(filename, platform);

  const product = await services.getProduct(platform, "https://happy.com");
  console.log(product);
  file.appendToFile(product);
})();
