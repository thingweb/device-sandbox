const Ajv = require("ajv");
const chai = require("chai");
const http = require("http");
const https = require("https");

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
let port = 5000

describe("Calculator HTTP Flask", () => {
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
        // wait for server to initiate
        setTimeout(() => { 
            http.get(`http://127.0.0.1:${port}/http-flask-calculator`, function(response) {
                const body = [];
                response.on("data", (chunk) => {
                    body.push(chunk);
                });
                
                response.on("end", () => {
                    const result = JSON.parse(Buffer.concat(body).toString());
                    const valid = validate(result);
                    expect(valid).to.be.true;
                    done();
                })
            })
        }, 1000);
    });
})