/* eslint-disable no-console, import/no-dynamic-require */
/* globals passwd */

var system = require('system');
var page = require('webpage').create();

var reportUrl = 'https://acc.yonyoucloud.com/fireport/ReportServer?reportlet=%2Fyonyoufi%2Foas6lr3w%2FMDupont%2FMDupont_p.cpt&__showtoolbar__=false&aid=yonyoufi&tid=oas6lr3w&userid=521fa89e-886e-4d44-9014-eb53097872d1&referAppId=yonyoufi&tenantId=oas6lr3w&op=h5&accbook=1574FCFD-89C8-4DFD-9E22-B281222D8C72';

// reportUrl = 'https://euc.yonyoucloud.com/cas/login?sysid=yonyoufi&service=https%3A%2F%2Facc.yonyoucloud.com%2Ffireport%2FReportServer%3Freportlet%3D%252Fyonyoufi%252Foas6lr3w%252FMDupont%252FMDupont_p.cpt%26__showtoolbar__%3Dfalse%26aid%3Dyonyoufi%26tid%3Doas6lr3w%26userid%3D521fa89e-886e-4d44-9014-eb53097872d1%26referAppId%3Dyonyoufi%26tenantId%3Doas6lr3w%26op%3Dh5%26accbook%3D1574FCFD-89C8-4DFD-9E22-B281222D8C72';
// reportUrl = 'https://baidu.com';
// reportUrl = 'https://acc.yonyoucloud.com';
reportUrl = 'https://acc.yonyoucloud.com/m/shouye';

console.log('INSIDE SCRIPT!');
console.log(' - phantom.scriptName: ' + JSON.stringify(phantom.scriptName));
console.log(' - phantom.libraryPath: ' + JSON.stringify(phantom.libraryPath));
console.log(' - phantom.args: ' + JSON.stringify(phantom.args));
console.log(' - system.args: ' + JSON.stringify(system.args));

// page setting

// eslint-disable-next-line max-len
// page.settings.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/60.0.3112.78 Chrome/60.0.3112.78 Safari/537.36';
// eslint-disable-next-line max-len
page.settings.userAgent = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.90 Mobile Safari/537.36';
// page.settings.javascriptEnabled = false;
// page.viewportSize = { width: 1920, height: 1080 };
// page.viewportSize = { width: 372, height: 300 }; // iframe
page.viewportSize = { width: 412, height: 732 }; // Nexus 5X

// error handling

phantom.onError = function (msg, trace) {
  var msgStack = [msg];
  if (trace && trace.length) {
    trace.forEach(function (t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }
  console.log('\n' + msgStack.join('\n') + '\n');
  phantom.exit(1);
};

page.onError = function (msg, trace) {
  var msgStack = ['ERROR: ' + msg];

  if (trace && trace.length) {
    msgStack.push('TRACE:');
    trace.forEach(function traceForEach(t) {
      msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function + '")' : ''));
    });
  }

  console.error(msgStack.join('\n'));
};

page.onConsoleMessage = function (msg, lineNum, sourceId) {
  console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

// page loading

// page.onResourceReceived = function (response) {
//   console.log('[onResourceReceived] response', response);
//   console.log('[onResourceReceived] Response (#'
//     + response.id + ', stage "' + response.stage + '"): '
//     + JSON.stringify(response));
// };

page.onNavigationRequested = function (url, type, willNavigate, main) {
  console.log('[onNavigationRequested] Trying to navigate to: ' + url);
  console.log('[onNavigationRequested] Caused by: ' + type);
  console.log('[onNavigationRequested] Will actually navigate: ' + willNavigate);
  console.log('[onNavigationRequested] Sent from the page\'s main frame: ' + main);
};

page.onResourceTimeout = function (request) {
  console.log('[onResourceTimeout] Response (#' + request.id + '): ' + JSON.stringify(request));
};

page.onUrlChanged = function (targetUrl) {
  console.log('[onUrlChanged] New URL:', targetUrl);
};

// page.onResourceRequested = function (requestData, networkRequest) {
//   console.log('[onResourceRequested] Request (#' + requestData.id + '): '
//     + JSON.stringify(requestData));
//   console.log('[onResourceRequested] networkRequest:', networkRequest);
// };

// app

if (!phantom.injectJs('passwd.js')) {
  console.log('failed to load passwd.js');
  phantom.exit();
}

console.log('username and password:', passwd.username, passwd.password);

function renderPage(url) {
  console.log('page.open()', url);
  page.open(url, function (status) {
    console.log('[open] status', status);
    if (status !== 'success') {
      console.log('[open] status is not success:', status);
      phantom.exit();
    }
    page.evaluate(function (config) {
      console.log('username and password:', config.username, config.password);
      document.querySelector("input[name='username']").value = config.username;
      document.querySelector("input[type='password']").value = config.password;
      // document.querySelector('#fm1').submit();
      window.doLogin();
    }, passwd);

    console.log('wait 5s to take snapshot');
    setTimeout(function () {
      console.log('page.render()');
      page.render('snapshot.png');

      console.log('phantom.exit()');
      phantom.exit();
    }, 10000);
  });
}

renderPage(reportUrl);

/**
 * References
 * - https://gist.github.com/ecin/2473860
 * - https://stackoverflow.com/questions/9246438/how-to-submit-a-form-using-phantomjs
 */
