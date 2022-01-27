const res = require("express/lib/response");
let { Pool, Client } = require("pg");
let uuid = require("uuid");

require("dotenv").config();
//! using pooling method
let pool = new Pool({
  connectionString: process.env.POSTGRESS_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
//! using client
let client = new Client({
  connectionString: process.env.POSTGRESS_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});
//! to make a table
let makeTable = async () => {
  await client.connect();
  let table = await client.query(
    "CREATE TABLE Images(id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,encodedImage TEXT,imageOwner TEXT,imageName TEXT,imageId TEXT);"
  );
  if (table) {
    client.end();
    console.log("table created", table);
  }
};
//!uploading a photo
let addPhoto = async (encodedImage, imageOwner, imageName, req, res) => {
  let imageId = uuid.v4();
  try {
    pool.connect(async (error, poolClient, done) => {
      if (error) {
        res.json({ error: error.message });
      }
      await poolClient.query(
        `INSERT INTO Images(encodedImage,imageOwner,imageName,imageId) VALUES ('${encodedImage}','${imageOwner}','${imageName}','${imageId}');`,
        (err, response) => {
          if (err) {
            res.json({ error: err.message });
          } else {
            done();
            res.json({
              message: "uploaded successfully",
              imageName: imageName,
              imageId: imageId,
              encodedImage: encodedImage,
            });
          }
        }
      );
    });
  } catch (error) {
    client.end();
    res.status(200).json({ error: error });
  } finally {
    client.end();
  }
};
//! function for fetching all the images in the database
let fetchAll = async (req, res) => {
  try {
    pool.connect(async (error, poolClient, done) => {
      if (error) {
        res.json({ error: error.message });
      }
      await poolClient.query("SELECT * FROM Images;", (err, response) => {
        if (err) {
          res.json({ error: err.message });
        } else {
          done();

          res.json({
            message: "fetched successfully",
            data: response.rows,
          });
        }
      });
    });
  } catch (error) {
    client.end();
    res.status(200).json({ error: error });
  } finally {
    client.end();
  }
};

//! fuction for fetching specific image
let fetchOne = async (imageOwner, imageId, req, res) => {
  try {
    pool.connect(async (error, poolClient, done) => {
      if (error) {
        res.json({ error: error.message });
      }
      await poolClient.query(
        `SELECT encodedImage,imageName FROM Images WHERE imageId='${imageId}' AND imageOwner='${imageOwner}' ;`,
        (err, response) => {
          if (err) {
            done();
            res.json({ error: err.message });
          } else {
            done();

            if (response.rows.length === 0) {
              res.status(404).json({
                message:
                  "there is no data based on the details you've provided please make sure the details you've provided are correct",
                data: response.rows,
              });
            } else {
              res.status(200).json({
                message: "fetched successfully",
                data: response.rows,
              });
            }
          }
        }
      );
    });
  } catch (error) {
    client.end();
    res.status(200).json({ error: error });
  } finally {
    client.end();
  }
};
//! function for deleting image / file
let deleteImage = async (imageOwner, imageId, req, res) => {
  try {
    pool.connect(async (error, poolClient, done) => {
      if (error) {
        res.json({ error: error.message });
      }
      await poolClient.query(
        `DELETE FROM Images WHERE imageid='${imageId}' AND imageowner='${imageOwner}' RETURNING * ;`,
        (err, response) => {
          if (err) {
            done();
            res.json({ error: err.message });
          } else {
            done();

            res.status(200).json({
              message: "deleted successfully",
              imageid: imageId,
              imageOwner: imageOwner,
            });
          }
        }
      );
    });
  } catch (error) {
    client.end();
    res.status(200).json({ error: error });
  } finally {
    client.end();
  }
};

//! controller for adding a file
let addFile = async (req, res) => {
  let { encodedImage, imageName, imageOwner } = req.body;
  addPhoto(encodedImage, imageOwner, imageName, req, res);
};
//! controller for getting all the files
let getFiles = async (req, res) => {
  fetchAll(req, res);
};
//! controller for fetching a singe file
let getOneFile = async (req, res) => {
  let imageOwner = req.params.imageOwner;
  let imageId = req.query.imageId;
  fetchOne(imageOwner, imageId, req, res);
};

//! controller for deleting a file /image
let deleteOneImage = async (req, res) => {
  let imageOwner = req.params.imageOwner;
  let imageId = req.query.imageId;
  deleteImage(imageOwner, imageId, req, res);
};
module.exports = {
  addFile,
  getFiles,
  getOneFile,
  deleteOneImage,
};
