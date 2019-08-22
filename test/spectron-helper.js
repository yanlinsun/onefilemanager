const path = require('path');
const Application = require('spectron').Application
const electronPath = require('electron') // Require Electron from the binaries included in node_modules.

function initialiseSpectron() {
//   let electronPath = path.join(__dirname, "../node_modules", "electron");
   const appPath = path.join(__dirname, "..");
//   if (process.platform === "win32") {
//       electronPath += ".cmd";
//   }
// 
   return new Application({
       path: electronPath,
       args: [appPath],
       env: {
           ELECTRON_ENABLE_LOGGING: true,
           ELECTRON_ENABLE_STACK_DUMPING: true,
           NODE_ENV: "development"
       },
       startTimeout: 20000,
       chromeDriverLogPath: '../chromedriverlog.txt'
  });
}

module.exports = { initialiseSpectron };
