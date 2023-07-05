
const Ajv2019 = require("ajv/dist/2019");
const chai = require("chai");
const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");


const coapSchema = JSON.parse(fs.readFileSync(path.join(".", "schemas", "coap.schema.json"), { "encoding": "utf-8" }));
const httpSchema = JSON.parse(fs.readFileSync(path.join(".", "schemas", "http.schema.json"), { "encoding": "utf-8" }));
const modbusSchema = JSON.parse(fs.readFileSync(path.join(".", "schemas", "modbus.schema.json"), { "encoding": "utf-8" }));
const mqttSchema = JSON.parse(fs.readFileSync(path.join(".", "schemas", "mqtt.schema.json"), { "encoding": "utf-8" }));
const tdJsonSchemaValidation = JSON.parse(fs.readFileSync(path.join(".", "schemas", "td-json-schema-validation.json"), { "encoding": "utf-8" }));

const ajv = new Ajv2019({ "strict": false, "allErrors": true, "validateFormats": false });
const draft7MetaSchema = require("ajv/dist/refs/json-schema-draft-07.json");
ajv.addMetaSchema(draft7MetaSchema);
ajv.addMetaSchema(tdJsonSchemaValidation);

const expect = chai.expect;

describe("JSON Schema Check", () => {
    describe("HTTP TDs", () => {
        let validate; 

        before(() => {
            validate = ajv.compile(httpSchema);
        })

        it("HTTP Express TD should validate", (done) => {
            const td = JSON.parse(fs.readFileSync(path.join(".", "http", "express", "calculator", "calculator.tm.json"), { "encoding": "utf-8" }));
            const valid = validate(td);
            expect(valid).to.be.true;
            done();
        });
    })

    describe("CoAP TDs", () => {
        let validate;

        before(() => {
            validate = ajv.compile(coapSchema);
        })

        it("CoAP TD should validate", (done) => {
            const td = JSON.parse(fs.readFileSync(path.join(".", "coap", "calculator", "calculator.tm.json"), { "encoding": "utf-8" }));
            const valid = validate(td);
            console.log(validate.errors);
            expect(valid).to.be.true;
            done();
        });
    })
    
    describe("MQTT TDs", () => {
        let validate;

        before(() => {
            validate = ajv.compile(mqttSchema);
        })

        it("MQTT TD should validate", (done) => {
            const td = JSON.parse(fs.readFileSync(path.join(".", "mqtt", "calculator", "calculator.tm.json"), { "encoding": "utf-8" }));
            const valid = validate(td);
            expect(valid).to.be.true;
            done();
        });
    })

    describe.skip("Modbus TDs", () => {
        let validate;

        before(() => {
            validate = ajv.compile(modbusSchema);
        })

        it("Modbus TD should validate", (done) => {
            const td = JSON.parse(fs.readFileSync(path.join(".", "modbus", "calculator", "calculator.tm.json"), { "encoding": "utf-8" }));
            const valid = validate(td);
            expect(valid).to.be.true;
            done();
        });
    })
});