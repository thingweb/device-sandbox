# Device Sandbox

Collection of IoT device simulators that can be used for testing and exploration purposes of different protocols and other Web of Things mechanisms.
The devices are implemented via various programming languages and frameworks.
The protocols you can currently test are:

- HTTP
- CoAP
- MQTT
- Modbus

## Current Devices

### Calculator

Calculator is a simple device, which has a read only `result` variable and depending on the action selected by the user, it adds or subtracts user input from the `result`. There is also a read only `lastChange` variable, which indicates the last time `result` variable has changed. Additionally, the device publishes an event, when `result` is changed. 

#### Supported Protocols and Programming Languages

- HTTP
  - JavaScript Express framework
  - Python Flask framework
- CoAP
  - JavaScript
- MQTT
  - JavaScript
  - Note: To be able represent MQTT's write property feature, there is a MQTT specific write only `calculatorName` variable. 
- Modbus
  - JavaScript (WIP)

## How to Run

You can start the devices inside a container, for that running `docker-compose up` at the root directory builds and runs the containers. For custom configuration, take look at the `Dockerfile` of each device or [docker-compose.yml](./docker-compose.yml).

For Node.js based devices, we use npm workspaces and running `npm install` at the root directory installs all the packages needed for every device. After packages are installed, running `node main.js` would run the thing. For port configuration, running either `node main.js -p 1000` or `node main.js --port 1000` would start the thing on port 1000.
