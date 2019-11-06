'use strict';

const { error, log } = console;
const puppeteer = require('puppeteer');
const urlParse = require('url-parse');

const waitForTime = 45000;

const run = async (seeds, db, optionsBrowser) => {

    log('LOG crawler@run seeds.length: ', seeds.length);

    const browser = await puppeteer.launch(optionsBrowser);
    const page = await browser.newPage();

    const dataToScrap = [];

    for (const seed of seeds) {

        try {

            console.log('LOG crawler@run crawling for seed: ', seed._doc.web);

            let hostname = urlParse(seed.url).hostname; // Return www.example.com
            hostname = hostname.substring(4, hostname.length); // Return example.com
            const structures = await db.models.scrapping.structures.find({ web: hostname }).exec();
            await page.goto(seed.url);
            await page.waitFor(waitForTime);
            await page.waitForSelector(seed.selectorLinks[0]);
            console.log('LOG crawler@run seed.selectorLinks[0]: ', seed.selectorLinks[0]);

            const obtainedLinks = await page.$$eval(seed.selectorLinks[0], (el) => {

                console.log('LOG crawler@run el: ',el);
                return el.map((e) => {

                    return {
                        text: e.innerHtml,
                        href: e.href
                    }

                });

            });
            console.log(`LOG crawler@run ${obtainedLinks.length} links found for ${hostname}`.yellow);

            const validStructures = []; //Posible structures for that webpage

            for (let $i = 0; $i < structures.length; $i++) {

                for (let $j = 0; $j < structures[$i].paths.length; $j++) {

                    validStructures.push({
                        index: $i,
                        id: structures[$i]._id,
                        path: structures[$i].paths[$j]
                    });

                }

            }

            dataToScrap.push({ structures, obtainedLinks, validStructures });

            
        } catch (err) {

            error('ERR crawler@run crawling for seed: ', seed._doc.web);
            error('ERR: ', err);
            
        }

    }

    return dataToScrap;

};

module.exports.run = run;
