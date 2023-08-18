const Ajv = require("ajv");
const chai = require("chai");
const fs = require("fs");
const path = require("path");
const https = require("https");
const coap = require("coap");

const exec = require('child_process').exec;

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
let port = 5683
let thingProcess;

describe("Calculator CoAP JS", () => {
    let validate; 
    const tdFilepath = path.join(__dirname, "td-json-schema-validation.json");

    before((done) => {
        thingProcess = exec(
            `node main.js -p ${port}`,
            { cwd: __dirname }
        );

        const file = fs.createWriteStream(tdFilepath);
        https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/td-json-schema-validation.json", function(response) {
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                const tdSchema = require("./td-json-schema-validation.json");
                validate = ajv.compile(tdSchema);
                done();
            });
        });
    })

    after((done) => {
        thingProcess.kill();
        fs.stat(tdFilepath, function(err, stats) {
            if (err) {
                return console.error(err);
            }

            fs.unlink(tdFilepath, function(err) {
                if (err) {
                    return console.error(err);
                }

                done();
            })
        })
    })

    it("should have a valid TD", (done) => {
        const req = coap.request(`coap://localhost:${port}/coap-calculator`)

        req.on("response", (res) => {
            const valid = validate(JSON.parse(res.payload.toString()));
            expect(valid).to.be.true;
            done();
        });

        req.end();
    });
})