/**
* PLOT is an app that lets you find and save your favourite crops.
* We use the OpenFarm API to find crop data. See also:
* https://github.com/openfarmcc/OpenFarm/blob/master/docs/api_docs.md 
* We use MongoDB to maintain a list of crops for each user.
*/ 

// get environment variables
require('dotenv').config() 

// SETUP MONGODB
const MONGODB_URI = process.env.MONGODB_URI 

// MongoDB Driver
const { MongoClient } = require('mongodb') 


// axios HTTP client https://www.npmjs.com/package/axios
const axios = require('axios');  

/* SETUP EXPRESS */
const express = require ('express')   // express framework 
const cors = require ('cors')         // Cross Origin Resource Sharing
const bodyParser = require('body-parser'); // middleware to parse JSON data that is sent from the frontend.
const { response } = require('express');
const app = express(); // enable express
app.use( cors() ); // make express attach CORS headers to responses
app.use(express.json({limit: '50mb', extended: true})); // add json capabilities to our express app 

/* Serve up static assets, i.e. the Frontend of the site. */
app.use( '/', express.static('public')) 

// app.use(express.json({limit: '50mb', extended: true}));
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));

  
/** listen for users' searches from the frontend */
// User enters into search, node listens to search and then relays to api

app.get('/search', async (req,res) => { 
    /** relay search filters to the pokemon API */
    // send  the search to the endpoint,  (node listens for the request and then sends it to a third part  (from front-end search bar, to node js, then to the pokemon api))
    axios.get(
        'https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20000', 
        {params: {filter: req.query.filter}}
    )
    .then( results => { 
      
        let pokemonWithUrl = results.data.results.filter(
            pokemon => pokemon.url.includes('pokeapi')
        )
        
        if (pokemonWithUrl.length) return res.send(pokemonWithUrl)
        res.send("No results")

        // for (pokemon of response.data) {
        //     renderPokemon(pokemon);
        // }
    
    })
    .catch( err=> res.send("Search Error") )
    // axios.get(pokemonWithUrl.URL).then( resp => {  let pokemonURL = response.data;  })
})


const renderPokemon = (pokemon) => {
    console.log("running");
    axios.get(pokemon.url)
    .then(function (response) {
      
      // console.log(pokemon.url);
      // an array of character objects will be stored in this variable. 
        let pokemonURL = response.data;
        console.log(pokemonURL);
        document.getElementById("pokeImage").src = pokemonURL.sprites.front_default.toString();

    })
}


// Connect to MongoDB
// See also https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/
MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
.then(client =>{ 
    const myCollection = client.db("team").collection("teams")

/** fetch a plot (list of crops) for a given trainer. */
app.get('/team', (req,res) => {   
    myCollection.findOne(
        { trainer: req.query.trainer  }, 
        (error, team)=>{
            /** If there is no result send a blank default plot. */
            if (error || team == null) {
                return res.send({
                    trainer:req.query.trainer, 
                    pokemons: []
                })
            } 
            /** send the full data */
            res.send( team )
        }
    ) 
})



/** Add/update a plot for a given trainer. 
 * See also: https://www.mongodb.com/docs/drivers/node/current/usage-examples/updateOne/
 * Read more about update operators: 
 * https://www.mongodb.com/docs/manual/reference/operator/update/#update-operators  */
app.post( '/team', bodyParser.json(), (req,res) => { 
    myCollection.updateOne(
        {trainer: req.body.trainer}, 
        {$set: { pokemons : req.body.pokemons } },  
        {upsert: true},  /** upsert = create if it doesnt exist. */
        (error) => { 
            if (error)  return res.send('Error') 
            res.send('Data saved')
        }
    )
})
 

}) 



/** Tell Express to start listening. */
const PORT = process.env.PORT || 3000 
app.listen(PORT, () => {
  console.log("We are live on port "+PORT )
})