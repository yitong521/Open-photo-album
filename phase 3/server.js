const sqlite = require("sqlite3").verbose();
let db = my_database("./media.db");
let db_backup = my_database("./media_backup.db");

var express = require("express");
var cors = require('cors'); 
var app = express();


app.use(cors()); 
app.use(express.json());

// Do not remove this endpoint as it is used for codegrade evaluation.F
app.get("/hello", function (req, res) {
  response_body = { Hello: "World" };

  // This example returns valid JSON in the response, but does not yet set the
  // associated HTTP response header.  This you should do yourself in your
  // own routes!
  res.json(response_body);
});

// to retrieve the full data set (all rows currently stored in your local photo database)
app.get("/media", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  db.all(
    "SELECT name, year, genre, poster, description FROM media", 
    function (err, rows) {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({ error: "No records found" });
      }
      return res.status(200).json(rows);
  }
  );
});

// to add data for a new photo item (Create)
app.post("/media/add", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let item = req.body;

  if (!item['name'] || !item['year'] || !item['genre'] || !item['poster'] || !item['description']) {
    return res.status(400).json({ error: "Incomplete data. Please provide all required fields." });
  }

  db.run(`INSERT INTO media (name, year, genre, poster, description)
                VALUES (?, ?, ?, ?, ?)`,
    [item['name'], item['year'], item['genre'], item['poster'], item['description']],
    function (err) {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(201).json({ message: "You have add a new line" });
    }
  );
});

// to list the data of a specific item (Retrieve)
app.get("/media/:id", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let id = req.params.id;

  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid ID parameter" });
  }
  db.all(
    "SELECT name, year, genre, poster, description FROM media WHERE id=" + id,
    function (err, rows) {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: err.message });
      }
      if (rows.length === 0) {
        return res.status(404).json({ error: "No record found for the given ID" });
      }
      return res.status(200).json(rows);
    }
  );
});

//to change data of a specific item (Update)
app.put("/media/:id", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let itemId = req.params.id;
  let item = req.body;

  if (!item['name'] || !item['year'] || !item['genre'] || !item['poster'] || !item['description']) {
    return res.status(400).json({ error: "Incomplete data. Please provide all required fields." });
  }

  db.run(`UPDATE media
                    SET name=?, year=?, genre=?, poster=?,
                    description=? WHERE id=?`,
                    [item['name'], item['year'], item['genre'], item['poster'], item['description'], itemId],
    function (err) {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(200).json({ message: "You have change data of a specific item" });
    }
  );
});

// to remove data of a specific item (Delete)
app.delete("/media/:id", function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  let id = req.params.id;
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({ error: "Invalid ID parameter" });
  }
  db.run("DELETE FROM media WHERE id=" + id,
    function (err) {
      if (err) {
        console.error("Error executing SQL query:", err);
        return res.status(500).json({ error: err.message });
      }
      return res.status(204).json({ message: "You have remove data of a specific item" });
    }
  );
});

// rest the database
app.delete('/media/reset', function(req, res) {
  res.setHeader('Content-Type', 'application/json');

  db.run("DELETE FROM media", function(err) {
    if (err) {
      return res.status(500).json({error: "Failed to delete data from the database"});
    }
    db_backup.all(`SELECT * FROM media_backup`, function(err, rows) { 
      if (err) {
        return res.status(500).json({error: "Failed to retrieve data from db_backup"});
      }
      rows.forEach(function(row) {
        db.run(
          `INSERT INTO media (name, year, genre, poster, description) VALUES (?, ?, ?, ?, ?)`,
          [row.name, row.year, row.genre, row.poster, row.description],
          function(err) {
            if (err) {
              return res.status(500).json({ error: "Failed to insert data into the database" });
            }
          }
        );
      });
      res.status(200).json({ message: "Database reset successfully" });
    });
  });
});



app.post("/post-example", function (req, res) {
  // This is just to check if there is any data posted in the body of the HTTP request:
  console.log(req.body);
  return res.json(req.body);
});

app.listen(3000);
console.log(
  "Your Web server should be up and running, waiting for requests to come in. Try http://localhost:3000/hello"
);

function my_database(filename) {
  // Conncect to db by opening filename, create filename if it does not exist:
  var db = new sqlite.Database(filename, (err) => {
    if (err) {
      console.error(err.message);
    }
    console.log("Connected to the media database.");
  });
  // Create our media table if it does not exist already:
  db.serialize(() => {
    db.run(`
        	CREATE TABLE IF NOT EXISTS media
        	 (
                    id INTEGER PRIMARY KEY,
                    name CHAR(100) NOT NULL,
                    year CHAR(100) NOT NULL,
                    genre CHAR(256) NOT NULL,
                    poster char(2048) NOT NULL,
                    description CHAR(1024) NOT NULL
		 )
		`);
    db.all(`select count(*) as count from media`, function (err, result) {
      if (result[0].count == 0) {
        db.run(
          `INSERT INTO media (name, year, genre, poster, description) VALUES (?, ?, ?, ?, ?)`,
          [
            "Arcane",
            "2021",
            "animation, action, adventure, tv-show",
            "https://www.nerdpool.it/wp-content/uploads/2021/11/poster-arcane.jpg",
            "Set in Utopian Piltover and the oppressed underground of Zaun, the story follows the origins of two iconic League Of Legends champions and the power that will tear them apart.",
          ]
        );
        db.run(
          `INSERT INTO media (name, year, genre, poster, description) VALUES (?, ?, ?, ?, ?)`,
          [
            "Celeste",
            "2018",
            "platformer, video-game",
            "https://upload.wikimedia.org/wikipedia/commons/0/0f/Celeste_box_art_full.png",
            "Celeste is a critically acclaimed two-dimensional platform game developed by Maddy Makes Games. The player controls Madeline, a young woman who sets out to climb Celeste Mountain. The game features tight controls, challenging levels, and a touching story about overcoming personal demons.",
          ]
        );
        console.log("Inserted dummy photo entry into empty database");
      } else {
        console.log(
          "Database already contains",
          result[0].count,
          " item(s) at startup."
        );
      }
    });
  });
  return db;
}
