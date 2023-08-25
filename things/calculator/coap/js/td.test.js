const Ajv = require("ajv");
const chai = require("chai");
const https = require("https");
const coap = require("coap");

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
let port = 5683

describe("Calculator CoAP JS", () => {
    let validate; 

    before((done) => {
        https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/td-json-schema-validation.json", function(response) {
            const body = [];
            response.on("data", (chunk) => {
                body.push(chunk);
            });

            response.on("end", () => {
                const tdSchema = JSON.parse(Buffer.concat(body).toString());
                validate = ajv.compile(tdSchema);
                done();
            });
        });
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