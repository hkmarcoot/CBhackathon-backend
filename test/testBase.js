
require('dotenv').config();
const couchbase = require('couchbase');
const connectionManager = require('../app/repository/connectionManager');

const PLAYLIST_TYPE = 'playlist';
const PLAYLIST_ID = 'bblue44';
const USERNAME = 'bblue44';
const USER_TYPE = 'userprofile';

function getGoodPlaylistKey() {
    return PLAYLIST_ID;
}

function getBadPlaylistKey() {
    return "badKey";
}

function getGoodUserKey() {
    return USERNAME;
}

const documentExists = async (collectionName, key) => {
    cluster = await connectionManager.couchbaseConnect();
    bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
    scope = connectionManager.getScope(process.env.SCOPE_NAME);
    const collection = scope.collection(collectionName);
    var result = await collection.exists(key);
    return result.exists;
}

const cleanupPlaylistKey = async () => {
    try {
        cluster = await connectionManager.couchbaseConnect();
        bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
        scope = connectionManager.getScope(process.env.SCOPE_NAME);
        const collection = scope.collection(process.env.PLAYLIST_COLLECTION_NAME);
        //console.log('Marker before exists test')
        var existsResult = await collection.exists(getGoodPlaylistKey());
        //console.log('Marker after exists test')
        if (existsResult.exists) {
            //console.debug("cleanupPlaylistKey(): Preparing to remove entry")
            await collection.remove(getGoodPlaylistKey());
        }
    }
    catch (error) {
        console.debug("cleanupPlaylistKey(): Expected error caught")
    }
}

function createPlaylist() {
    const playlist = {
        id: PLAYLIST_ID,
        type: PLAYLIST_TYPE,
        name: "Test Playlist",
        owner: {
            firstName: "Betty",
            lastName: "Blue",
            username: "bblue44"
        },
        tracks: ["EBB4132EFDA5B0B8792B211E86DBA2845EBE05CB",
            "D3A2F983105171AE0B18224742FF57C5CF7CCC8D",
            "407BC4BDA2959CBBA9771A4943A30BA51503CA78"],
        created: new Date('January 1, 2020')
    };
    return playlist;
}

const insertPlaylist = async (playlist) => {
    key = playlist.id;
    try {
        cluster = await connectionManager.couchbaseConnect();
        bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
        scope = connectionManager.getScope(process.env.SCOPE_NAME);
        const collection = scope.collection(process.env.PLAYLIST_COLLECTION_NAME);
        await collection.insert(key, playlist);
        return playlist;
    } catch (ex) {
        throw new Error(ex.message);
    }
}

const getPlaylist = async (key) => {
    try {
        cluster = await connectionManager.couchbaseConnect();
        bucket = connectionManager.getBucket(process.env.BUCKET_NAME);
        scope = connectionManager.getScope(process.env.SCOPE_NAME);
        const collection = scope.collection(process.env.PLAYLIST_COLLECTION_NAME);
        const result = await collection.get(key);
        return result.content;
    } catch (ex) {
        console.error(ex);
        throw new Error(ex);
    }
}


exports.getGoodPlaylistKey = getGoodPlaylistKey;
exports.getBadPlaylistKey = getBadPlaylistKey;
exports.getGoodUserKey = getGoodUserKey;
exports.createPlaylist = createPlaylist;
exports.documentExists = documentExists;
exports.insertPlaylist = insertPlaylist;
exports.getPlaylist = getPlaylist;
exports.cleanupPlaylistKey = cleanupPlaylistKey;