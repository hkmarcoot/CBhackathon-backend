const assert = require('assert').strict;
const { getGoodPlaylistKey, getBadPlaylistKey, documentExists, cleanupPlaylistKey, createPlaylist, insertPlaylist, getPlaylist } = require('./testBase');
const playlistRepository = require('../app/repository/playlistRepository');
const connectionManager = require('../app/repository/connectionManager');
const RepositoryError = require('../app/exceptions/repositoryError');
const sleep  = require('await-sleep');

describe('Lab04 Tests', async function () {
    beforeEach(async function () {
            await cleanupPlaylistKey();
    });

    describe('Test create()', async function () {
        it('Create operation should succeed', async function () {
            var playlistToCreate = createPlaylist();
            await playlistRepository.create(playlistToCreate);
            await sleep(2000);
            var p = await getPlaylist(getGoodPlaylistKey());
            assert.equal(playlistToCreate.owner.firstName, p.owner.firstName, "First names should match");
        });

        it('Create operation should throw an exception', async function () {
            await insertPlaylist(createPlaylist());
            await sleep(2000);

            // Should fail because a document already exist for key
            assert.rejects(
                playlistRepository.create(createPlaylist()),
                RepositoryError,
                'Expecting a RepositoryError to be thrown'
                );
        });
    });

    describe('Test findById()', async function () {
        it('Get should succeed', async function () {
            var initialPlaylist = createPlaylist();
            await insertPlaylist(initialPlaylist);
            await sleep(2000)
            var fetchedPlaylist = await playlistRepository.findById(getGoodPlaylistKey());
            assert.equal(fetchedPlaylist.owner.firstName, initialPlaylist.owner.firstName);
        });

        it('Get should throw an exception', async function () {
            // Should fail because a document doesn't exist.
            assert.rejects(
                playlistRepository.findById(getGoodPlaylistKey()),
                RepositoryError,
                'Expecting a RepositoryError to be thrown'
                );
        });
    });

    describe('Test update()', async function () {
        it('Update should result in updated document', async function() {
            var updatedLastName = 'Reddd';
            console.debug("Cleaning up playlist");
            var initialPlaylist = createPlaylist();
            console.debug("Inserting test playlist");
            await insertPlaylist(initialPlaylist);
            await sleep(2000)
            var playlistToUpdate = createPlaylist();
            playlistToUpdate.owner.lastName = updatedLastName;
            console.debug("Updating playlist");
            await playlistRepository.update(getGoodPlaylistKey(), playlistToUpdate);
            var fetchedPlaylist = await playlistRepository.findById(getGoodPlaylistKey());
            assert.equal(fetchedPlaylist.owner.lastName, updatedLastName, "The names should match");

        });

        it('Update should throw a RepositoryError', async function() {
            var updatedLastName = 'Reddd';
            var playlistToUpdate = createPlaylist();
            playlistToUpdate.owner.lastName = updatedLastName;

            // Should fail because a document doesn't exist.
            assert.rejects(
                playlistRepository.update(getGoodPlaylistKey(), playlistToUpdate),
                RepositoryError,
                'Expecting a RepositoryError to be thrown'
                );
        });
    });


    describe('Test upsert()', async function () {
        it('Upsert should result in a replace operation', async function() {
            var updatedLastName = 'Reddd';
            await insertPlaylist(createPlaylist());
            assert(await documentExists(process.env.PLAYLIST_COLLECTION_NAME, getGoodPlaylistKey()));
            var playlistToUpdate = createPlaylist();
            playlistToUpdate.owner.lastName = updatedLastName;
            await playlistRepository.insertOrUpdate(getGoodPlaylistKey(), playlistToUpdate);
            var fetchedPlaylist = await playlistRepository.findById(getGoodPlaylistKey());
            assert.equal(fetchedPlaylist.owner.lastName, updatedLastName, "The names should match");
        });

        it('Upsert should result in an insert operation', async function() {
            assert(! await documentExists(process.env.PLAYLIST_COLLECTION_NAME, getGoodPlaylistKey()));
            var playlistToInsert = createPlaylist();
            await playlistRepository.insertOrUpdate(getGoodPlaylistKey(), playlistToInsert);
            var fetchedPlaylist = await playlistRepository.findById(getGoodPlaylistKey());
            assert.equal(fetchedPlaylist.owner.firstName, playlistToInsert.owner.firstName);
        });
    });

    describe('Test delete()', async function () {
        it('Should result in deleted document', async function() {
            assert(! await documentExists(process.env.PLAYLIST_COLLECTION_NAME, getGoodPlaylistKey()));
            await insertPlaylist(createPlaylist());
            assert(await documentExists(process.env.PLAYLIST_COLLECTION_NAME, getGoodPlaylistKey()));

            // Now remove the document and assert it no longer is there
            await playlistRepository.remove(getGoodPlaylistKey());
            assert(! await documentExists(process.env.PLAYLIST_COLLECTION_NAME, getGoodPlaylistKey()));

        });

        it('Delete should throw a RepositoryError', async function() {
            // Should fail because a document doesn't exist.
            /*
            assert.rejects(
                playlistRepository.remove(getGoodPlaylistKey()),
                RepositoryError,
                'Expecting a RepositoryError to be thrown'
                );
                */

        });
    });

    after(async function () {
        await connectionManager.closeConnection();
    });
});