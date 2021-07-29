![EasyDoseQM](https://github.com/bmsitech/qmcorenode-api/blob/master/doc/images/easydose-pdf.png?raw=true)

# QMCoreNode API Specification
RESTful API specification of the EasyDoseQM server

This repository provides a stripped down API specification for common data query tasks.
It also provides a client interface and sample code for Node.js.

## Documentation

For specific documentation please see:

- [QMCoreNode API specification](https://bmsitech.github.io/qmcorenode-api/api)
- [Javascript Client Interface](https://bmsitech.github.io/qmcorenode-api/client)

## Running the sample clients

Before using the code please install [Node.js](https://nodejs.org) Version 12 on your system.

Clone the repository:
```
# git clone https://github.com/bmsitech/qmcorenode-api.git
```

Install dependencies:
```
# cd qmcorenode-api
# npm install
```

Run samples:
```
# node ./samples/query.js -h
```
or
```
# node ./samples/dosereport.js -h
```
