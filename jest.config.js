const config = {
    verbose: true,
    preset: "jest-puppeteer",
    globals: {
        "WL": "window.WL",
        "WL.Type.Object": "window.WL.Type.Object"
    }
}

module.exports = config;