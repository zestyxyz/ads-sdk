// Hack to point jest-puppeteer to locally installed Chrome since it won't install as a dependancy
if (process.platform === 'win32') {
    module.exports = {
        launch: {
            "executablePath": "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
        },
        server: {
            command: 'yarn run serve',
            launchTimeout: 180000
        }
    }
}
