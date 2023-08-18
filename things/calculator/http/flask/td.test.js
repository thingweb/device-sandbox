const Ajv = require("ajv");
const chai = require("chai");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");

const exec = require('child_process').exec;

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
let port = 5000
let thingProcess;

describe("Calculator HTTP Flask", () => {
    let validate; 
    const tdFilepath = path.join(__dirname, "td-json-schema-validation.json");

    before((done) => {
        thingProcess = exec(
            `poetry run python main.py -p ${port}`,
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
        // wait for server to initiate
        setTimeout(() => { 
            http.get(`http://127.0.0.1:${port}/http-flask-calculator`, function(response) {
            response.on("data", (chunk) => {
                    const valid = validate(JSON.parse(chunk.toString()));
                    expect(valid).to.be.true;
                    done();
                })
            }) 
        }, 250);
        
    });
})