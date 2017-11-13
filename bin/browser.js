const puppeteer = require('puppeteer');

const command = process.argv[2];
const request = JSON.parse(process.argv[3]);

const callChrome = async () => {
    let browser;
    let page;

    try {
        if ('browserWSEndpoint' in request) {
            browser = await puppeteer.connect({
                browserWSEndpoint: request.browserWSEndpoint,
                ignoreHTTPSErrors: request.options.ignoreHttpsErrors
            });
        } else {
            // browser = await puppeteer.launch({
            //     ignoreHTTPSErrors: request.options.ignoreHttpsErrors,
            //     args: request.options.args || []
            // });
        }

        page = await browser.newPage();

        if (request.options && request.options.dismissDialogs) {
            page.on('dialog', async dialog => {
                await dialog.dismiss();
            });
        }

        if (request.options && request.options.userAgent) {
            await page.setUserAgent(request.options.userAgent);
        }

        if (request.options && request.options.viewport) {
            await page.setViewport(request.options.viewport);
        }

        const requestOptions = {};

        if (request.options && request.options.networkIdleTimeout) {
            requestOptions.waitUntil = 'networkidle';
            requestOptions.networkIdleTimeout = request.options.networkIdleTimeout;
        }

        await page.goto(request.url, requestOptions);

        console.log(await page[request.action](request.options));

        if ('browserWSEndpoint' in request) {
            await page.close();
        } else {
            await browser.close();
        } 
        process.exit(0);
    } catch (exception) {
        if (browser) {
            await browser.close();
        }

        console.error(exception);

        process.exit(1);
    }
};

const openChrome = async () => {
    let browser;

    try {
        browser = await puppeteer.launch({
            ignoreHTTPSErrors: request.options.ignoreHttpsErrors,
            args: request.options.args || []
        });
        console.log(browser.wsEndpoint());
        // Keep the process alive
    } catch (exception) {
        if (browser) {
            await browser.close();
        }

        console.error(exception);

        process.exit(1);
    }
};

command === 'open' ? openChrome() : callChrome();
