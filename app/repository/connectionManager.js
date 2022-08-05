require('dotenv').config();
const couchbase = require('couchbase');

let cluster;
let bucket;
let scope;

/**
 * In order to preserve the connection, this method will only attempt to
 * connect if the cluster has not already been assigned (i.e. is null).
 * Otherwise, it will merely return the existing connection.
 * 
 * @returns {Cluster} A Couchbase Cluster object connected to a Couchbase Server
 */
async function couchbaseConnect ()  {
    if (cluster == null) {
        console.debug("Connecting to Couchbase...")
        cluster = await couchbase.connect('couchbases://' + process.env.HOST, {
            username: process.env.USERNAME, password: process.env.PASSWORD,
            trustStorePath: process.env.CERTIFICATE_PATH
        });
        /* This is the SDK 4.0 connection 
        cluster = await couchbase.connect('couchbases://'+ process.env.HOST, {
                                                username: process.env.USERNAME,
                                                password: process.env.PASSWORD,
                                                security: {
                                                  trustStorePath: process.env.CERTIFICATE_PATH
                                                }
                                            });
        */
    }
    return cluster;
}

/**
 * Enforces a single instance of bucket is created. If not already initialized,
 * a call to cluster.getBucket() is made. Otherwise the current bucket value 
 * is returned
 * 
 * @param {string} bucketName The name of the bucket to obtain
 * @returns {Bucket} The Bucket object for the given name
 */
function getBucket(bucketName) {
    if (bucket == null) {
        if (cluster != null) {
            console.debug(`Fetching the bucket for ${bucketName}`);
            bucket = cluster.bucket(bucketName);
        } else {
            throw new Error("Cluster connection has not been created");
        }
    }
    return bucket;
}

/**
 * Enforces a single instance of scope is created. If not already initialized,
 * a call to bucket.getScope() is made. Otherwise the current scope value 
 * is returned
 * 
 * @param {string} scopeName The name of the scope
 * @returns {Scope} The Scope object for the provided scopeName
 */
function getScope(scopeName) {
    if (scope == null) {

        if (bucket != null) {
            console.debug(`Fetching the scope for ${scopeName}`);
            scope = bucket.scope(scopeName);
        } else {
            throw new Error("Bucket reference has not been created");
        }
    }
    return scope;
}

/**
 * Close the connection. This will return the cluster, bucket and scope
 * variable back to uninitialized state.
 */
async function closeConnection () {
    if (cluster != null) {
        console.debug('Closing connections()');
        await cluster.close();
        cluster = null;
        bucket = null;
        scope = null;
    }
}

exports.couchbaseConnect = couchbaseConnect;
exports.getBucket = getBucket;
exports.getScope = getScope;
exports.closeConnection = closeConnection;
