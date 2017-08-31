/* eslint-disable max-len */

var page = require('webpage').create();

// page.viewportSize = { width: 412, height: 732 }; // Nexus 5X
// page.settings.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Mobile Safari/537.36';
page.open('https://baidu.com/', function () {
  page.render('baidu.png');
  phantom.exit();
});
