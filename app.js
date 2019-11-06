'use strict';

const colors = require('colors');

const DB = require('./database');
const crawler = require('./crawler');
const scrapper = require('./scrap');
const validUrl = require('valid-url');

const { log, error } = console;
const { MONGOHOST, MONGOPORT, MONGODB, MONGOUSER, MONGOPASSWORD, PUPPETEER_SKIP_CHROMIUM_DOWNLOAD, CUSTOM_CHROMIUM } = process.env;

(async function () {

    try {

        // Get seeds
        const db = new DB(MONGOHOST, MONGOPORT, MONGODB, MONGOUSER, MONGOPASSWORD, true);
        const seeds = await db.models.scrapping.seeds.find({ active: true }).exec();

        console.log('SEEDS: ', seeds);

        // Set options browser

        const width = 1920;
        const height = 1080;

        const optionsBrowser = {
            headless: false,
            ignoreHTTPSErrors: true,
            timeout: 30000,
            args: [
                `--window-size=${width},${height}`,
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox'
            ],
        };

        const dataToScrap = await crawler.run(seeds, db, optionsBrowser);

        for (let $i = 0; $i < dataToScrap.length; $i++) {

            const { structures, obtainedLinks, validStructures } = dataToScrap[$i];

            const results = {
                saved: [],
                errors: [],
                skipped: []
            };
        
            for (let $j = 0; $j < obtainedLinks.length; $j++) {

                let link = obtainedLinks[$j].href;
                console.log(`LOG app@_ ${$j} - ${link}`.cyan);

                try {

                    let isValid = validUrl.isWebUri(link) === undefined ? false : true;
                    let linkVisited = await db.models.scrapping.scrappedwebs.find({ url: link }, { _id: 1, url: 1 }).exec();
                    let hasValidStructure = false;

                    if (isValid && linkVisited.length === 0) {

                        for (let $i = 0; $i < validStructures.length; $i++) {

                            let validStructure = validStructures[$i];

                            if (link.includes(validStructure.path)) {

                                // log(`${link} includes -> ${validStructure.path} | The structure is ${validStructure.index} - ${validStructure.id}`);

                                // Scrapping process start here
                                hasValidStructure = true;
                                let structure = structures[validStructure.index];
                                let scrappedWebObjectToSave = await scrapper.run(link, structure, optionsBrowser);
                                let sw = new db.models.scrapping.scrappedwebs(scrappedWebObjectToSave);
                                await sw.save()
                                    .then((swSaved) => {

                                        log('LOG app@_ ✔ saved'.green);
                                        results.saved.push(link);

                                    }).catch((err) => {

                                        error('ERR app@_ NOT saved'.red, err);
                                        results.errors.push(link);

                                    });

                            }

                        }

                        if (!hasValidStructure) {

                            log('LOG app@_ Does not match with any structure'.red);
                            results.skipped.push(link);

                        }

                    } else {

                        log(`LOG app@_ The link ${link} is not valid or has been visited before.`);
                        results.skipped.push(link);

                    }

                } catch (err) {

                    log(`ERROR DOING SCRAPPING TO ${link}`.red, err);
                    results.errors.push(link);

                }

            } // END for (links)
            
        }
 
    } catch (err) {
        error("ERR: ", err);
        process.exit(1)
    }

})();




