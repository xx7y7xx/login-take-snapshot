var page = require('webpage').create();
page.open('https://baidu.com/', function() {
  page.render('baidu.png');
  phantom.exit();
});
