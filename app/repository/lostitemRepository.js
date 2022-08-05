const couchbase = require("couchbase");
const RepositoryError = require("../exceptions/repositoryError");
const connectionManager = require("./connectionManager");

/**
 * From Lab04: K/V operations
 * Finds a playlist based on the key but returns result as a
 * JSON string
 *
 * @param {string} key The key for the document to return
 * @returns {JSON} The document for the specified key
 * @throws {RepositoryError} if something failed during the Couchbase call
 */
async function findById(key) {
  // TODO: Implement this method to use the key to obtain a document and return it.
  //        Be sure to handle exceptions and throw RepositoryException
  // Initialize the cluster, bucket and scope
  cluster = await connectionManager.couchbaseConnect();
  bucket = await connectionManager.getBucket(process.env.BUCKET_NAME);
  scope = await connectionManager.getScope(process.env.SCOPE_NAME);

  // And select the collection
  const collection = scope.collection(process.env.LOSTITEM_COLLECTION_NAME);
  try {
    const result = await collection.get(key);

    return result.content;
  } catch (err) {
    console.error(err);
    if (err instanceof couchbase.DocumentNotFoundError) {
      throw new RepositoryError(`Failed to load lostitem for key: ${key}`);
    }
    throw err;
  }
}

/**
 * From Lab04: K/V operations
 * Creates a new playlist from the playlist object provided
 *
 * @param {JSON} playlist
 * @returns {string} The key for the created document
 * @throws {RepositoryError} If something fails during the Couchbase call
 */
async function create(lostitem) {
  // TODO: Implement this method to insert a new document. Use the getKey() method to generate the necessary key.
  //        Be sure to handle exceptions and throw RepositoryException
  // Initialize the cluster, bucket and scope
  cluster = await connectionManager.couchbaseConnect();
  bucket = await connectionManager.getBucket(process.env.BUCKET_NAME);
  scope = await connectionManager.getScope(process.env.SCOPE_NAME);
  // And select the collection
  const collection = scope.collection(process.env.LOSTITEM_COLLECTION_NAME);
  const key = lostitem.id;
  try {
    await collection.insert(key, lostitem);
    return key;
  } catch (err) {
    console.error(err);
    if (err instanceof couchbase.DocumentExistsError) {
      throw new RepositoryError(
        `Document already exists for lostitemId: ${lostitem.id}`
      );
    }
    throw err;
  }
}

/**
 * From Lab04: K/V operations
 * Removes an entry for the specified key.
 *
 * @param {string} key
 * @throws {RepositoryError} If something fails during the Couchbase call
 */
async function remove(key) {
  // TODO: Implement this method to remove a document based on the provided key.
  //        Be sure to handle exceptions and throw RepositoryException
  // Initialize the cluster, bucket and scope
  cluster = await connectionManager.couchbaseConnect();
  bucket = await connectionManager.getBucket(process.env.BUCKET_NAME);
  scope = await connectionManager.getScope(process.env.SCOPE_NAME);
  // And select the collection
  const collection = scope.collection(process.env.LOSTITEM_COLLECTION_NAME);
  try {
    await collection.remove(key);
  } catch (err) {
    console.error(err);
    if (err instanceof couchbase.DocumentNotFoundError) {
      throw new RepositoryError(`Document not found for key: ${key}`);
    }
    throw err;
  }
}

/**
 * From Lab04: K/V operations
 * Updates the entry specified by the key using the supplied JSON document
 *
 * @param {string} key
 * @param {JSON} playlist
 * @returns {JSON} Updated playlist
 */
async function update(key, lostitem) {
  //   if (key != genKey(playlist)) {
  //     throw new RepositoryError("Key and type/id of document don't match");
  //   }

  // TODO: Implement this method to update an existing document.
  //        Be sure to handle exceptions and throw RepositoryException
  if (key != lostitem.id) {
    throw new RepositoryError("Key and type/id of document do not match");
  }
  // Initialize the cluster, bucket and scope
  cluster = await connectionManager.couchbaseConnect();
  bucket = await connectionManager.getBucket(process.env.BUCKET_NAME);
  scope = await connectionManager.getScope(process.env.SCOPE_NAME);
  // And select the collection
  const collection = scope.collection(process.env.LOSTITEM_COLLECTION_NAME);
  try {
    await collection.replace(key, lostitem);
    return lostitem;
  } catch (err) {
    console.error(err);
    if (err instanceof couchbase.DocumentNotFoundError) {
      throw new RepositoryError(`Document not found for key: ${key}`);
    }
    throw err;
  }
}

/**
 * From Lab04: K/V operations
 * Depending on the current presence of the specified key in the database, either insert or
 * update the entry.
 *
 * @param {string} key
 * @param {JSON} playlist
 * @returns {JSON} Returns the updated or inserted value
 * @throws {RepositoryError} Thrown for errors occurring in this method, either from
 * missing pre-dependencies or from errors while calling Couchbase.
 */
async function insertOrUpdate(key, lostitem) {
  if (key != lostitem.id) {
    throw new RepositoryError("Key and type/id of document don't match");
  }
  // TODO: Implement this method to insert or update a document.
  //        Be sure to handle exceptions and throw RepositoryException

  // Initialize the cluster, bucket and scope
  cluster = await connectionManager.couchbaseConnect();
  bucket = await connectionManager.getBucket(process.env.BUCKET_NAME);
  scope = await connectionManager.getScope(process.env.SCOPE_NAME);
  // And select the collection
  const collection = scope.collection(process.env.LOSTITEM_COLLECTION_NAME);
  try {
    await collection.upsert(key, lostitem);
    return lostitem;
  } catch (err) {
    console.error(err);
    if (err instanceof couchbase.CouchbaseError) {
      throw new RepositoryError(
        "Something happened with the Couchbase Operation"
      );
    }
    throw err;
  }
}

//findAllLostitems

//where type='lostitem' AND lostitem.itemFounder IS NOT MISSING

async function findAllLostitems() {
  var queryString = "select lostitem.* from lostandfound.foundify.lostitem";
  // const options =
  // {
  //   parameters: {
  //     username: username,
  //   },
  // };
  try {
    // Initialize the cluster, bucket and scope
    cluster = await connectionManager.couchbaseConnect();
    bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
    scope = connectionManager.getScope(process.env.SCOPE_NAME);
    //const results = await scope.query(queryString, options);
    const results = await scope.query(queryString);
    return results.rows;
  } catch (err) {
    console.error(err);
    if (err instanceof couchbase.CouchbaseError) {
      throw new RepositoryError("Something happened with the Couchbase Query");
    }
    throw err;
  }
}

/**
 * From Lab06: Query
 * Find all playlists owned by the specified username (found in
 * owner.username).
 *
 * @param {string} username
 * @returns A list of matching playlists
 * @throws {RepositoryError} Thrown if any error occurs during the query
 */
// async function findPlaylistsByUsername(username) {
//   var queryString =
//     "select playlist.* from `playlist` where owner.username = $username";
//   const options = {
//     parameters: {
//       username: username,
//     },
//   };
//   try {
//     // Initialize the cluster, bucket and scope
//     cluster = await connectionManager.couchbaseConnect();
//     bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
//     scope = connectionManager.getScope(process.env.SCOPE_NAME);
//     const results = await scope.query(queryString, options);
//     return results.rows;
//   } catch (err) {
//     console.error(err);
//     if (err instanceof couchbase.CouchbaseError) {
//       throw new RepositoryError("Something happened with the Couchbase Query");
//     }
//     throw err;
//   }
// }

/**
 * From Lab06: Query
 * Given the playlistId, return a list of tracks from the playlist specified
 *
 * @param {string} playlistId
 * @returns List of matching track documents
 * @throws {RepositoryError} Thrown if any error occurs during the query
 */
// async function findTracksForPlaylist(playlistId) {
//   const queryString = `SELECT track.*
//   FROM playlist
//   INNER JOIN track ON KEYS ARRAY trackId FOR trackId IN playlist.tracks END
//   WHERE playlist.id = $playlistId`;
//   const options = {
//       parameters: {
//           playlistId: playlistId
//       }
//   }
//   try {
//       // Initialize the cluster, bucket and scope
//       cluster = await connectionManager.couchbaseConnect();
//       bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
//       scope = connectionManager.getScope(process.env.SCOPE_NAME);
//       const results = await scope.query(queryString, options);
//       return results.rows;

//   } catch (err) {
//       console.error(err);
//       if (err instanceof couchbase.CouchbaseError) {
//           throw new RepositoryError("Something happened with the Couchbase Query");
//       }
//       throw err;

//   }
// }

/**
 * Export the defined public methods
 */
// Key/Value methods
exports.findById = findById;
exports.create = create;
exports.remove = remove;
exports.update = update;
exports.insertOrUpdate = insertOrUpdate;

exports.findAllLostitems = findAllLostitems;
