const os = require('os');
const path = require('path');
const fs = require('fs');

console.log(os.platform());
console.log(os.totalmem());

console.log(path.basename(__filename));

fs.writeFileSync('text.txt', "Neki moj fajl iz js-a")
