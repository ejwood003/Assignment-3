/*/ =========================
    ETHAN WOOD
    IS 403 Section 2
    Individual Assingment 3 
    =========================

    =============
    DESCRIPTION
    =============
        This page lists all Pokémon from the database in a clean, 
        Bootstrap-styled table.
        It also includes a search bar that lets users look up 
        and view details for a specific Pokémon.
/*/

// Load environment variables from the .env file
require('dotenv').config();

// Import the Express framework
const express = require("express");

// Import the 'path' module for working with file and directory paths
let path = require("path");

// Import body-parser for handling form submissions (though Express now has this built in)
let bodyParser = require("body-parser");

// Create an instance of the Express application
let app = express();

// Set the view engine to EJS so we can render .ejs templates
app.set("view engine", "ejs");

// Set the server port, using .env variable if available or default to 3000
const port = process.env.PORT || 3000;

// Create a Knex instance for connecting to the PostgreSQL database
const knex = require("knex")({
    client: "pg", 
    connection: {
        host : process.env.RDS_HOSTNAME || "localhost",      
        user : process.env.RDS_USERNAME || "postgres",       
        password : process.env.RDS_PASSWORD || "admin",  
        database : process.env.RDS_DB_NAME || "assignment3",
        port : process.env.RDS_PORT || 5432              
    }
});

// Middleware to parse URL-encoded form data (for POST or GET form submissions)
app.use(express.urlencoded({ extended: true }));

// Serve static files (like images, CSS, JS) from the current directory
app.use(express.static(__dirname));


/* ==============================
   ROUTE: Display Pokémon List
   ==============================
*/
app.get("/", (req, res) => {
  knex.select().from("pokemon")       // SELECT * FROM pokemon
    .orderBy("description")           // Sort results alphabetically by description
    .then(pokemon => {
      console.log(`Successfully retrieved ${pokemon.length} Pokémon from database`);
      // Render the index view and pass the Pokémon data
      res.render("index", { pokemon: pokemon });
    })
    .catch((err) => {
      // If there's an error, log it and show an error message on the page
      console.error("Database query error:", err.message);
      res.render("index", {
        pokemon: [],  // Pass an empty list if query failed
        error_message: `Database error: ${err.message}. Please check if the 'pokemon' table exists.`
      });
    });
});

/* ==============================
   ROUTE: Search for a Single Pokémon
   ==============================
*/
app.get("/searchPokemon", (req, res) => {
  const name = req.query.name;  // Get the Pokémon name from the form input

  // If no name was entered, show an error message immediately
  if (!name) {
    return res.render("searchPokemon", { pokemon: null, error_message: "Please provide a Pokémon name." });
  }

  // Query the database for a Pokémon whose description matches the name
  knex("pokemon")
    .whereRaw("LOWER(description) = LOWER(?)", [name])
    .first() // Return only the first match
    .then(pokemon => {
      if (pokemon) {
        // If found, render the searchPokemon page with its details
        res.render("searchPokemon", { pokemon, error_message: null });
      } else {
        // If not found, show error message
        res.render("searchPokemon", { pokemon: null, error_message: `No Pokémon found with the name "${name}".` });
      }
    })
    .catch(err => {
      // Handle database connection or syntax errors
      res.render("searchPokemon", { pokemon: null, error_message: `Database error: ${err.message}` });
    });
});

/* ==============================
   START THE SERVER
   ==============================
*/
app.listen(port, () => {
    console.log("The server is listening");
});