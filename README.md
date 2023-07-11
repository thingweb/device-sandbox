# Device Sandbox

Collection of Things (node-wot or not) that can be used for testing and exploration purposes.

Device sandbox uses npm workspaces and running `npm install` at the root directory would suffice to install all the packages needed for every device. After packages are installed, running `node main.js` would run the thing. For port configuration, running either `node main.js -p 1000` or `node main.js --port 1000` would start the thing on port 1000.

It is also possible start the devices inside a container, for that running `docker-compose up` at the root directory would build the and run the containers. For custom configuration, take look at the `Dockerfile` of each device or `docker-compose.yml`.

## Current Devices
- ### Calculator

    Calculator is a simple device, which has a read only `result` variable and depending on the action selected by the user, it adds or subtracts user input from the `result`. There is also a read only `lastChange` variable, which indicates the last time `result` variable has changed. Additionally, the device publishes an event, when `result` is changed. To be able represent MQTT's write property feature, there is a MQTT specific write only `calculatorName` variable. 

    #### Supported Protocols and Programming Languages
    - CoAP
      - JavaScript
    - HTTP
      - JavaScript Express framework
    - MQTT
      - JavaScript
    - Modbus
      - JavaScript (WIP)
