const Ajv = require("ajv");
const chai = require("chai");
const http = require("http");
const https = require("https");

const ajv = new Ajv({ "strict": false, "allErrors": true, "validateFormats": false });

const expect = chai.expect;
let port = 3000

describe("Calculator HTTP JS", () => {
    let validate; 

    before((done) => {
        https.get("https://raw.githubusercontent.com/w3c/wot-thing-description/main/validation/td-json-schema-validation.json", function(response) {

            const body = [];
            response.on("data", (chunk) => {
                body.push(chunk); 
            });

            response.on("end", () => {
                try {
                    const tdSchema = JSON.parse(Buffer.concat(body).toString());
                    validate = ajv.compile(tdSchema);
                    done();
                } catch (error) {
                    console.log(error);
                }
            });
        });
    })

    it("should have a valid TD", (done) => {
        http.get(`http://localhost:${port}/http-express-calculator`, function(response) {

            const body = [];
            response.on("data", (chunk) => {
                body.push(chunk);
            });
            
            response.on("end", () => {
                try {
                    const result = JSON.parse(Buffer.concat(body).toString());
                    const valid = validate(result);
                    expect(valid).to.be.true;
                    done();
                } catch (error) {
                    console.log(error);
                }
            });
        })
    });
})