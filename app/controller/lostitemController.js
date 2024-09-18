const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const lostitemRepository = require("../repository/lostitemRepository");
const RepositoryError = require("../exceptions/repositoryError");

var cors = require("cors");

var corsOptions = {
  origin: false,
};

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get("/lostitem", async function (req, res) {
  //res.send("getting list of lostitems");
  try {
    const allLostitems = await lostitemRepository.findAllLostitems();
    //req.params.playlistId

    res.append("Access-Control-Allow-Origin", "*");
    res.append("Access-Control-Allow-Methods", "*");
    res.append("Access-Control-Allow-Headers", "*");
    res.statusCode = 200; // ok
    res.send(allLostitems);
  } catch (error) {
    if (error instanceof RepositoryError) {
      res.statusCode = error.status;
      res.send(error.message);
    } else {
      console.error(error);
      res.statusCode = 400;
      res.send("Something went wrong with the request");
    }
  }
});

app.get("/lostitem/:lostitemId", async function (req, res) {
  const lostitemId = req.params.lostitemId;

  console.debug(`getting lostitem for key: ${lostitemId}`);

  // Probably should try/catch and return a proper error code at this level
  try {
    const lostitem = await lostitemRepository.findById(lostitemId);
    res.send(lostitem);
  } catch (error) {
    if (error instanceof RepositoryError) {
      res.statusCode = error.status;
      res.send(error.message);
    } else {
      res.statusCode = 400;
      res.send("Something went wrong with the request");
    }
  }
});

app.post("/lostitem", async function (req, res) {
  const newLostitem = req.body;
  console.debug(`creating lostitem for ID: ${newLostitem.id}`);
  baseUrl = req.url;
  console.debug(`Base URL= ${baseUrl}`);
  try {
    key = await lostitemRepository.create(newLostitem);
    res.location(baseUrl + "/" + key);
    res.statusCode = 201; // Created
    res.send();
  } catch (error) {
    if (error instanceof RepositoryError) {
      res.statusCode = error.status;
      res.send(error.message);
    } else {
      res.statusCode = 400;
      res.send("Something went wrong with the request");
    }
  }
});

app.delete("/lostitem/:lostitemKey", async function (req, res) {
  const key = req.params.lostitemKey;

  console.debug(`deleting lostitem for key: ${key}`);

  try {
    await lostitemRepository.remove(key);
    res.statusCode = 204; // No Content
    res.send();
  } catch (error) {
    if (error instanceof RepositoryError) {
      res.statusCode = error.status;
      res.send(error.message);
    } else {
      res.statusCode = 400;
      res.send("Something went wrong with the request");
    }
  }
});

app.put("/lostitem/:lostitemKey", async function (req, res) {
  const key = req.params.lostitemKey;
  const lostitem = req.body;
  console.debug(`updating lostitem for key: ${key}`);

  try {
    const updatedLostitem = await lostitemRepository.update(key, lostitem);
    res.statusCode = 200; // Ok
    res.send(updatedLostitem);
  } catch (error) {
    if (error instanceof RepositoryError) {
      res.statusCode = error.status;
      res.send(error.message);
    } else {
      console.error(error);
      res.statusCode = 400;
      res.send("Something went wrong with the request");
    }
  }
});

//Marco comment: find lost items by username is not working now
//because the method is not ready in lostitemRepository
app.get("/lostitems/:username", async function (req, res) {
  try {
    const matchingLostitems = await lostitemRepository.findLostitemsByUsername(
      req.params.username
    );
    res.statusCode = 200; // ok
    res.send(matchingLostitems);
  } catch (error) {
    if (error instanceof RepositoryError) {
      res.statusCode = error.status;
      res.send(error.message);
    } else {
      console.error(error);
      res.statusCode = 400;
      res.send("Something went wrong with the request");
    }
  }
});

// app.get("/playlist/tracks/:playlistId", async function (req, res) {
//   try {
//     const matchingTracks = await playlistRepository.findTracksForPlaylist(
//       req.params.playlistId
//     );
//     res.statusCode = 200; // ok
//     res.send(matchingTracks);
//   } catch (error) {
//     if (error instanceof RepositoryError) {
//       res.statusCode = error.status;
//       res.send(error.message);
//     } else {
//       console.error(error);
//       res.statusCode = 400;
//       res.send("Something went wrong with the request");
//     }
//   }
// });

module.exports = app;
