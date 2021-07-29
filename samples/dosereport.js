#!/usr/bin/env node

const getopt = require("node-getopt");
const edqm = require("../src/edqm");

const dosename = {
    dap: "DAP (XRay): ",
    dl_dap: "DAP (Fluoro): ",
    dlp: "DLP (CT): ",
    organdose: "AGD (Mammography): "
};

const opt = new getopt([
    ["s", "host=ARG", "EasydoseQM server URL", "https://secretdemo.easydose.eu"],
    ["u", "username=ARG", "username", "demo"],
    ["p", "password=ARG", "password", "demo21"],
    ["a", "accessionnumer=ARG", "accessionnumber (required)"],
    ["h" , "help", "display this help"]
]).bindHelp().parseSystem();

const client = new edqm.Client(opt.options.host);
const accessionnumber = opt.options.accessionnumer;

if(!accessionnumber) {
    return opt.showHelp();
}

(async() => {
    await client.login({
        username: opt.options.username,
        password: opt.options.password,
    });

    console.log("Accessionnumber:", accessionnumber);
    console.log("-----------------------------------------------------------");

    for(const fieldname of [ "dap", "dlp", "dl_dap", "organdose" ]) {
        let analysis = {
            fields: [fieldname, "serieskey", "accessionnumber"],
            filter: {
                filters: [
                    {field: "accessionnumber", operator: "eq", value: accessionnumber},
                    {field: fieldname, operator: "gt", value: 0},
                ]
            },
            x: "serieskey",
            y: {
                [fieldname]: ["sum"]
            },
            as: {
                [fieldname]: {
                    sum: "dose"
                }
            },
            force: true
        };

        let response = await client.analysis(analysis);

        const rows = response.result;
        if(!rows || !rows.length) {
            continue;
        }

        const row = rows[0];
        const unit = response.meta.units.dose.name;

        console.log(`${dosename[fieldname]} ${row.dose} ${unit}`);
    }

    await client.logout();
})().catch((e) => {
    console.log("ERROR:", e);
});
