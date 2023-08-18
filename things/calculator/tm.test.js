const Ajv = require("ajv");
const chai = require("chai");
const fs = require("fs");
const path = require("path");
const https = require("https");

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;

describe("Calculator", () => {
    let validate; 
    const tmFilepath = path.join(__dirname, "tm-json-schema-validation.json");

    before((done) => {
        const file = fs.createWriteStream(tmFilepath);
        https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/tm-json-schema-validation.json", function(response) {
            response.pipe(file);

            // after download completed close filestream
            file.on("finish", () => {
                file.close();
                const tmSchema = require("./tm-json-schema-validation.json");
                validate = ajv.compile(tmSchema);
                done();
            });
        });
    })

    after((done) => {
        fs.stat(tmFilepath, function(err, stats) {
            if (err) {
                return console.error(err);
            }

            fs.unlink(tmFilepath, function(err) {
                if (err) {
                    return console.error(err);
                }

                done();
            })
        })
    })

    it("should have a valid TM", () => {
        const calculatorTM = require("./calculator.tm.json");
        const valid = validate(calculatorTM);
        expect(valid).to.be.true;
    });    
});