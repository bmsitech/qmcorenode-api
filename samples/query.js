#!/usr/bin/env node

const dayjs = require("dayjs");
const getopt = require("node-getopt");

const edqm = require("../src/edqm");

const opt = new getopt([
    ["s", "host=ARG", "EasydoseQM server URL", "https://secretdemo.easydose.eu"],
    ["u", "username=ARG", "username", "demo"],
    ["p", "password=ARG", "password", "demo21"],
    ["d", "date=ARG", "date to query", dayjs().format('YYYYMMDD')],
    ["h" , "help", "display this help"]
]).bindHelp().parseSystem();

const client = new edqm.Client(opt.options.host);

(async() => {
    const response = await client.login({
        username: opt.options.username,
        password: opt.options.password,
    });

    console.log("logged in");
    console.log(JSON.stringify(response, null, 2));

    const result = await client.query({
        fields: [
            "patientsex",
            "patientname",
            "patientid",
            "patientbirthdate",
            "age",
            "startdate",
            "starttime",
            "studydescription",
            "patientweight",
            "patientsize",
            "moddescription"],
        sort: [
            { field: "starttime", dir: "desc" }
        ],
        filter: {
            filters: [
                {
                    field: "startdate",
                    operator: "eq",
                    value: opt.options.date
                }
            ]
        }
    });

    console.log(JSON.stringify(result, null, 2));

    await client.logout();
    console.log("logged out");
})().catch((e) => {
    console.log("ERROR:", e);
});
