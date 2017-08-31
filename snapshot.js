/* eslint-disable no-console, import/no-dynamic-require */
/* globals passwd */

var system = require('system');
var page = require('webpage').create();

var reportUrl = 'https://acc.yonyoucloud.com/fireport/ReportServer?reportlet=%2Fyonyoufi%2Foas6lr3w%2FMDupont%2FMDupont_p.cpt&__showtoolbar__=false&aid=yonyoufi&tid=oas6lr3w&userid=521fa89e-886e-4d44-9014-eb53097872d1&referAppId=yonyoufi&tenantId=oas6lr3w&op=h5&accbook=1574FCFD-89C8-4DFD-9E22-B281222D8C72';

// reportUrl = 'https://euc.yonyoucloud.com/cas/login?sysid=yonyoufi&service=https%3A%2F%2Facc.yonyoucloud.com%2Ffireport%2FReportServer%3Freportlet%3D%252Fyonyoufi%252Foas6lr3w%252FMDupont%252FMDupont_p.cpt%26__showtoolbar__%3Dfalse%26aid%3Dyonyoufi%26tid%3Doas6lr3w%26userid%3D521fa89e-886e-4d44-9014-eb53097872d1%26referAppId%3Dyonyoufi%26tenantId%3Doas6lr3w%26op%3Dh5%26accbook%3D1574FCFD-89C8-4DFD-9E22-B281222D8C72';
// reportUrl = 'https://baidu.com';
// reportUrl = 'https://acc.yonyoucloud.com';
// reportUrl = 'https://acc.yonyoucloud.com/m/shouye';

function log() {
  if (console) {
    console.log.apply(console, arguments);
  }
}

log('INSIDE SCRIPT!');
log(' - phantom.scriptName: ' + JSON.stringify(phantom.scriptName));
log(' - phantom.libraryPath: ' + JSON.stringify(phantom.libraryPath));
log(' - phantom.args: ' + JSON.stringify(phantom.args));
log(' - system.args: ' + JSON.stringify(system.args));

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
  log('\n' + msgStack.join('\n') + '\n');
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
  log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
};

// page loading

// page.onResourceReceived = function (response) {
//   log('[onResourceReceived] response', response);
//   log('[onResourceReceived] Response (#'
//     + response.id + ', stage "' + response.stage + '"): '
//     + JSON.stringify(response));
// };

page.onNavigationRequested = function (url, type, willNavigate, main) {
  log('[onNavigationRequested] Trying to navigate to: ' + url);
  log('[onNavigationRequested] Caused by: ' + type);
  log('[onNavigationRequested] Will actually navigate: ' + willNavigate);
  log('[onNavigationRequested] Sent from the page\'s main frame: ' + main);
};

page.onResourceTimeout = function (request) {
  log('[onResourceTimeout] Response (#' + request.id + '): ' + JSON.stringify(request));
};

page.onUrlChanged = function (targetUrl) {
  log('[onUrlChanged] New URL:', targetUrl);
};

// page.onResourceRequested = function (requestData, networkRequest) {
//   log('[onResourceRequested] Request (#' + requestData.id + '): '
//     + JSON.stringify(requestData));
//   log('[onResourceRequested] networkRequest:', networkRequest);
// };

// app

if (!phantom.injectJs('passwd.js')) {
  log('failed to load passwd.js');
  phantom.exit();
}

log('load username and password from config file:', passwd.username, passwd.password);

function login() {
  page.evaluate(function (config) {
    function log() { // eslint-disable-line no-shadow
      if (console) console.log.apply(console, arguments);
    }
    log('get username and password from phantom scope:', config.username, config.password);
    if (document.querySelector('#fm1') === null) {
      log('login form not exist');
    } else {
      log('found login form element');
      log('try to input username and password');
      document.querySelector("input[name='username']").value = config.username;
      document.querySelector("input[type='password']").value = config.password;
      // document.querySelector('#fm1').submit();
      log('do login');
      window.doLogin();
    }
  }, passwd);
}

function renderPage(url) {
  log('page.open()', url);
  page.open(url, function (status) {
    log('[open] status', status);
    if (status !== 'success') {
      log('[open] status is not success:', status);
      phantom.exit();
    }

    log('wait 10s to login');
    setTimeout(function () {
      login();

      log('wait 20s to take snapshot');
      setTimeout(function () {
        log('get useragent');
        page.evaluate(function () {
          console.log(navigator.userAgent);
        });
        log('page.render()');
        page.render('snapshot.png');

        log('phantom.exit()');
        phantom.exit();
      }, 10000);
    }, 20000);
  });
}

renderPage(reportUrl);

/**
 * References
 * - https://gist.github.com/ecin/2473860
 * - https://stackoverflow.com/questions/9246438/how-to-submit-a-form-using-phantomjs
 */
