/**
 * @namespace edqm
 */
var edqm = function() {
    // virtual function (will be replaced by node.js / jquery version)
    this._send = function() {
    };

    /**
     * @summary EasyDoseQM client object.
     *
     * Creates a new object handling all the communication with
     * the EasyDoseQM server.
     * 
     * Member functions usually take a 'callback' parameter for asynchronous
     * processing. If this parameter is omitted a promise object will be returned.
     *
     * @class
     * @param {string} serverUrl URL of the server to connect to
     */
    this.Client = function(serverUrl) {
        this.server = serverUrl;
        this.cookie = null;

        var self = this;

        var setPaging = function(query, options) {
            if(options.take) query.take = options.take;
            if(options.skip) query.skip = options.skip;
        };

        var sendWrapper = function(args, callback) {
            args.server = self.server;

            if(self.cookie) {
                args.cookie = self.cookie;
            }

            if(callback) {
                return edqm._send(args, function(error, result) {
                    self.cookie = args.cookie;
                    callback(error, result);
                });
            }

            return new Promise(function(resolve, reject) {
                edqm._send(args, function(error, result) {
                    self.cookie = args.cookie;

                    if(error) {
                        return reject(args.url + " - " + error);
                    }

                    resolve(result);
                });
            });
        };


        /**
         * Client request callback.
         * @callback callback
         * @param {string} error - Error message if request failed
         * @param {string} result - Result of the request
         */

        /**
         * @summary Authenticate on the server.
         *
         * Send credentials to the server and authenticate the user.
         * The session token is returned in the response cookie. This
         * cookie is used in all subsequent requests to the server.
         *
         * @param {Object} options - Credentials fo the server connection
         * @param {string} options.username - Name of the user
         * @param {string} options.password - Password
         * @param {callback} [callback] - The callback that handles the response (optional).
         * @returns {Promise} A Promise object is returned if the callback parameter is omitted.
         */
        this.login = function(options, callback) {
            return sendWrapper({
                url: "/QMCoreNode/users/login",
                method: "POST",
                data: {
                    username: options.username,
                    password: options.password
                }
            }, callback);
        };

        /**
         * @summary Log out from the server.
         *
         * Removes any session information from the server.
         *
         * @param {Client~callback} [callback] - The callback that handles the response (optional).
         * @returns {Promise} A Promise object is returned if the callback parameter is omitted.
         */
        this.logout = function(callback) {
            return sendWrapper({
                url: "/QMCoreNode/users/logout",
                method: "GET"
            }, callback);
        };

        /**
         * @summary Query data from the server.
         *
         * Sends the query information to the server for processing. The result will be
         * cached on the server for some amount of time (default 300 seconds).
         *
         * @param {Object} options - Query options
         * @param {string[]} options.fields - Query meta tags (will be in result set)
         * @param {Object} options.filter - Filter definition
         * @param {Object[]} options.filter.filters - Array containing filters
         * @param {string} options.filter.filters[].field - Field to filter
         * @param {string} options.filter.filters[].operator - Operator
         * @param {string} options.filter.filters[].value - Filter value
         * @param {Object[]} options.sort - Array containing filters
         * @param {string} options.sort[].field - Sort field
         * @param {string} options.sort[].dir - Sort direction
         * @param {number} options.take - Limit number of result rows (optional).
         * @param {number} options.skip - Skip rows from the beginning of the result (optional).
         * @param {boolean} force - Skip the server cache
         * @param {Client~callback} [callback] - The callback that handles the response (optional).
         * @returns {Promise} A Promise object is returned if the callback parameter is omitted.
         */
        this.query = function(options, callback) {
            var query = {
                fields: options.fields,
                filter: options.filter,
                sort: options.sort,
                force: options.force
            };

            setPaging(query, options);

            return sendWrapper({
                url: "/QMCoreNode/query/produce",
                method: "POST",
                data: query
            }, callback);
        };

        /**
         * @summary Analyse data on the server.
         *
         * Sends the analysis information to the server for processing.
         * An analysis is equivalent to a SQL query using aggregate functions.
         * The "group by" clause is the "x" parameter. And the "y" parameter
         * holds all aggregated fields.
         * The result will be cached on the server for some amount of time 
         * (default 300 seconds).
         *
         * @param {Object} options - Analysis options
         * @param {string[]} options.fields - Query properties
         * @param {Object} options.filter - Filter definition
         * @param {Object[]} options.filter.filters - Array containing filters
         * @param {string} options.filter.filters[].field - Field to filter
         * @param {string} options.filter.filters[].operator - Operator
         * @param {string} options.filter.filters[].value - Filter value
         * @param {Object[]} options.sort - Array containing filters
         * @param {string} options.sort[].field - Sort field
         * @param {string} options.sort[].dir - Sort direction
         * @param {number} options.take - Limit number of result rows (optional).
         * @param {number} options.skip - Skip rows from the beginning of the result (optional).
	     * @param {string} x - Category of the analysis (X-Axis / Group - Field)
	     * @param {Object} y - Analysis data definition
	     * @param {string} y.field - Aggregate of the field
	     * @param {Object} as - Result fieldname mapping
         * @param {boolean} force - Skip the server cache
         * @param {Client~callback} [callback] - The callback that handles the response (optional).
         * @returns {Promise} A Promise object is returned if the callback parameter is omitted.
         */
        this.analysis = function(options, callback) {
            var query = {
                fields: options.fields,
                filter: options.filter,
                sort: options.sort,
                force: options.force,
                x: options.x,
                y: options.y,
                as: options.as
            };

            setPaging(query, options);

            return sendWrapper({
                url: "/QMCoreNode/analysis/produce",
                method: "POST",
                data: query
            }, callback);
        };

        /**
         * @summary Run a SQL query on the server.
         *
         * Sends a simple SQL query to the server for processing.
         * SQL queries are only allowed for privileged users.
         *
         * @param {Object} options - Query options
         * @param {string[]} options.fields - Query properties (will be in result set)
         * @param {string} options.from - Query table
         * @param {Object} options.filter - Filter definition
         * @param {Object[]} options.filter.filters - Array containing filters
         * @param {string} options.filter.filters[].field - Field to filter
         * @param {string} options.filter.filters[].operator - Operator
         * @param {string} options.filter.filters[].value - Filter value
         * @param {Object[]} options.sort - Array containing filters
         * @param {string} options.sort[].field - Sort field
         * @param {string} options.sort[].dir - Sort direction
         * @param {number} options.take - Limit number of result rows (optional).
         * @param {number} options.skip - Skip rows from the beginning of the result (optional).
         * @param {Client~callback} [callback] - The callback that handles the response (optional).
         * @returns {Promise} A Promise object is returned if the callback parameter is omitted.
         */
        this.sqlQuery = function(options, callback) {
            var query = {
                fields: options.fields,
                from: options.from,
                filter: options.filter,
                sort: options.sort
            };

            setPaging(query, options);

            return sendWrapper({
                url: "/QMCoreNode/sql/fetch",
                method: "POST",
                data: query
            }, callback);

        };

        this.call = function(options, callback) {
            return sendWrapper({
                url: "/QMCoreNode" + options.url,
                method: options.method,
                data: options.data
            }, callback);
        };
    };

    return this;
}();

if(typeof module !== 'undefined') {
    const http = require('http');
    const https = require('https');
    const URL = require('url');

    edqm._send = (options, callback) => {
        let url = options.server + options.url;
        if(options.method === 'GET' && options.data) {
            url += "?" + JSON.stringify(options.data);
        }

        let urlOptions = URL.parse(url);
        urlOptions.method = options.method;

        urlOptions.headers = {
            'Content-Type': 'application/json'
        };

        if(options.cookie) {
            urlOptions.headers.Cookie = options.cookie;
        }

        let proto = urlOptions.protocol === "https:" ? https : http;

        let req = proto.request(urlOptions, (response) => {
            const setcookie = response.headers["set-cookie"];
            if(setcookie) {
                setcookie.forEach(function(cookiestr) {
                    options.cookie = cookiestr;
                });
            }

            let str = '';

            response.on('data', (chunk) => {
                str += chunk;
            });

            response.on('end', () => {
                if(response.statusCode !== 200) {
                    return callback(response.statusCode);
                }

                try {
                    if(str !== "OK") {
                        callback(null, JSON.parse(str));
                    }
                }
                catch(e) {
                    callback(e);
                }
            });

            response.on('error', (e) => {
                callback(e, null);
            });
        });

        if(options.method === 'POST') {
            req.write(JSON.stringify(options.data));
        }

        req.end();
    };

    module.exports = edqm;
}
else if(typeof $ !== 'undefined') {
    edqm._send = function(args, callback) {
        if (!args.method) {
            args.method = 'GET';
        }

        if (args.async === undefined) {
            args.async = true;
        }

        var url = args.server + args.url;
        if (args.method === 'GET' && args.data) {
            url += "?" + decodeURIComponent($.param(args.data));
        }

        $.ajax({
            type: args.method,
            data: (args.method === 'POST') ? JSON.stringify(args.data) : "",
            contentType: 'application/json',
            url: url,
            xhrFields: {
                withCredentials: true
            },
            cache: false,
            crossDomain: true,
            success: function(data) {
                if(callback) {
                    callback(null, data);
                }
            },
            error: function(error) {
                if(callback) {
                    callback(url + " - " + error, null);
                }
            }
        });
    };
}
else {
    console.error("edqm send stub missing !");
}
