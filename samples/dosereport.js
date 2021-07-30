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
    ["j", "json", "format result as JSON object"],
    ["h" , "help", "display this help"]
]).bindHelp().parseSystem();

const client = new edqm.Client(opt.options.host);
const accessionnumber = opt.options.accessionnumer;

if(!accessionnumber) {
    opt.showHelp();
    console.log("\nPlease provide an accession number (-a xxxxx).\n");
    return;
}

(async() => {
    await client.login({
        username: opt.options.username,
        password: opt.options.password,
    });

    const output = {
        accessionnumber: accessionnumber,
        report: []
    };

    for(const fieldname of [ "dap", "dlp", "dl_dap", "organdose" ]) {
        const analysis = {
            fields: [fieldname, "serieskey", "accessionnumber"],
            filter: {
                filters: [
                    {field: "accessionnumber", operator: "eq", value: accessionnumber}
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

        const { meta, result } = await client.analysis(analysis);

        if(!result || !result.length) {
            continue;
        }

        output.report.push({
            name: dosename[fieldname],
            dose: result[0].dose,
            unit: meta.units.dose.name
        });
    }

    await client.logout();

    if(opt.options.json) {
        console.log(JSON.stringify(output, null, 2));
    }
    else {
        console.log("Accessionnumber:", accessionnumber);
        console.log("-----------------------------------------------------------");

        output.report.forEach(item => console.log(`${item.name} ${item.dose} ${item.unit}`));
    }
})().catch((e) => {
    console.log("ERROR:", e);
});
