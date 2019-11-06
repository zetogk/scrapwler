'use strict';

const hash = require('object-hash');
const puppeteer = require('puppeteer');
const stripComment = require('strip-comment'); // Strip comments, JS and CSS


const { error, log } = console;

const run = async (link, structure, optionsBrowser) => {

    try {

        const waitForTime = 15000;
        const width = 1920;
        const height = 1080;
        
        /* const optionsBrowser = {
            headless: true,
            ignoreHTTPSErrors: true,
            timeout: 30000,
            args: [
                `--window-size=${width},${height}`,
                '--disable-gpu',
                '--headless',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ]
            //executablePath: '/usr/bin/chromium-browser' To use a custom installed by yourself insted of by Puppeteer
        } */

        const browser = await puppeteer.launch(optionsBrowser);
        const page = await browser.newPage();

        const hashId = hash.sha1(link);
        await page.setViewport({ width, height })
        await page.goto(link, { waitUntil: 'networkidle2' });
        await page.waitFor(waitForTime);

        const collectedData = [];

        for (let $1 = 0; $1 < structure.selectors.length; $1++) {

            const selector = structure.selectors[$1];

            let result = '';

            if (selector.multiple) {

                result = await page.$$eval(selector.selector, (el) => {

                    return el.map((e) => {
    
                        return e.innerText;
    
                    });
    
                });

            } else {

                result = stripComment(await page.$eval(selector.selector, (el) => el.innerHTML));
            }

            collectedData.push({
                name: selector.name,
                content: result
            });
            
        }

        await browser.close();

        return {
            url: link,
            hash: hashId,
            structure: structure._id,
            data: collectedData
        }

    } catch (err) {

        error('ERR scrap@run scrapping: ', err);
        error('ERR: ', err);

    }

};

module.exports.run = run;
