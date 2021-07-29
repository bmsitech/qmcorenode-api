![EasyDoseQM](https://github.com/bmsitech/qmcorenode-api/blob/master/doc/images/easydose-pdf.png?raw=true)

# QMCoreNode API
RESTful API specification of the EasyDoseQM server

This repository provides a stripped down API specification for common data query tasks.
It also provides a client interface and sample code for Node.js.

## Documentation

For specific documentation please see:

- [QMCoreNode API specification (OpenAPI)](https://bmsitech.github.io/qmcorenode-api/api)
- [Javascript Client Interface](https://bmsitech.github.io/qmcorenode-api/client)

## Running the sample clients

Before using the code please install [Node.js](https://nodejs.org) Version 12 on your system.

Clone the repository:
```ShellSession
git clone https://github.com/bmsitech/qmcorenode-api.git
```

Install dependencies:
```ShellSession
cd qmcorenode-api
npm install
```

Run samples:
```ShellSession
node ./samples/query.js -h
```
or
```ShellSession
node ./samples/dosereport.js -h
```

> Note for customers: The "demo" account on the server may be disabled (Error 401). Please
> contact us if you want to enable an account for testing.
