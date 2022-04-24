// const { default: axios } = require("axios");

const app = Vue.createApp({
    data() {
        return {
            myNameIs: null,
            searchFilter: null,
            results: null,      /** array: search results (crops) */
            notice: null,       /** string: for any warnings/errors */
            team: {
                trainer: null,
                pokemons: []
            },          /** array: crops owned by team */
            moves: []
        }
    },
    methods: {
        /**  process the hello form to get the user's name  
         *  Ask NodeJS / MongoDB to find the team's plot
         * i.e. which crops the team already owns */
        hello() {
            axios.get('/team', { params: { trainer: this.myNameIs } })
                .then(response => this.team = response.data)
                .catch(error => this.showNotice("Error."))
        },
        /**  process the search form by sending the query to NodeJS */
        search() {
            this.notice = null; // reset notices/messages 
            this.results = [];
            let matches = this.pokemon.filter(pokemon => pokemon.name.includes(this.searchFilter))
            // console.log(matches);
            // this.results = matches;

            for (match of matches.slice(0, 25)) {
                // console.log(match);

                axios.get(match.url)
                    .then(resp => {

                        // console.log(resp.data);
                        this.results.push(resp.data)

                        // this.moves = resp.data.move;
                        // console.log(this.moves);
                    })
            }



            // selected


            // axios.get('/search', {params: {filter: this.searchFilter}} )
            //     .then(response => {
            //         if (Array.isArray(response.data)) return this.results = response.data
            //         this.showNotice(response.data)
            //      })
            //     .catch(error =>  this.showNotice("No Results.") );

        },
        /** Skip a result (e.g. in case of 403 errors on images ) */
        skip(pokemon) {
            this.results = this.results.filter(x => x.name !== pokemon.name);
        },
        // searchMoves(){
        //     this.notice = null; // reset notices/messages 
        //     // this.results = [];
        //     // let matches = this.pokemon.filter(pokemon => pokemon.name.includes(this.searchFilter))
        //     // console.log(matches);
        //     // let matches = this.pokemon.filter(pokemon => pokemon.name.includes(pokemon.name));
        //     console.log(this.pokemon);

        //     axios.get(pokemon.url)
        //     .then( resp =>  {

        //         // console.log(resp.data);
        //         // this.results.push(resp.data)
        //         console.log("working");
        //         // this.moves = resp.data.move;
        //         // console.log(this.moves);
        //     })
        // },


        /** Check if a given search result is owned
         * (i.e. it already exists in the team's plot). */
        isOwned(pokemon) {
            if (this.team.pokemons.filter(x => x.name == pokemon.name).length > 0) return true;
            return false;
        },
        /** add a given pokemon to the team's team.  */
        add(pokemon) {

            if (this.team.pokemons.length < 6) {
                if (this.isOwned(pokemon)) return
                this.team.pokemons.push(pokemon);
                this.save()
            } else {
                this.notice = "team full, you can have a max of 6 team members"
            }

            let animation = document.getElementById("animationGrid");
            let animationNoSpin = document.getElementsByClassName('animationNoSpin');

            console.log(animationNoSpin);
            
            animation.style.animation = 'none';
            void animation.offsetWidth;
            animation.style.animation = null;

            for(var i=0; i<animationNoSpin.length; i++) {
                animationNoSpin[i].style.animation = 'none';
                void animationNoSpin[i].offsetWidth;
                animationNoSpin[i].style.animation = 'orbit var(--speed) linear reverse infinite';
            }
     
        },
        changeMove(pokemonMove, pokemonIndex, moveNumber) {
            // pokemonMove = the selected move from drop down, pokemonIndex = the pokemon, moveNumber = which text box

            // let move1 = this.team.pokemon.move1;


            // get the index of the object
            let pokemonIndexNumber = this.team.pokemons.indexOf(pokemonIndex);

            // assign move variable
            let move1 = this.team.pokemons[pokemonIndexNumber].move1;
            let move2 = this.team.pokemons[pokemonIndexNumber].move2;
            let move3 = this.team.pokemons[pokemonIndexNumber].move3;
            let move4 = this.team.pokemons[pokemonIndexNumber].move4;

            


            // changed the move based on the text box
            switch (moveNumber) {
                case 1:
                    // if the selected move is already selected
                    if (move2 == pokemonMove || move3 == pokemonMove || move4 == pokemonMove) {
                        this.showNotice("Error, you can't select the same move twice")
                    } else {
                        // change/add the move1 object in the pokemon object
                        this.team.pokemons[pokemonIndexNumber].move1 = pokemonMove;

                        //only save if move switch is successful
                        this.save()
                        // document.getElementById('selectMove').value = none;
                    }
                    break;
                case 2:
                    if (move1 == pokemonMove || move3 == pokemonMove || move4 == pokemonMove) {
                        this.showNotice("Error, you can't select the same move twice")
                    } else {
                        this.team.pokemons[pokemonIndexNumber].move2 = pokemonMove;
                        this.save()
                    }
                    break;
                case 3:
                    if (move2 == pokemonMove || move1 == pokemonMove || move4 == pokemonMove) {
                        this.showNotice("Error, you can't select the same move twice")
                    } else {
                        this.team.pokemons[pokemonIndexNumber].move3 = pokemonMove;
                        this.save()
                    }
                    break;
                case 4:
                    if (move2 == pokemonMove || move3 == pokemonMove || move1 == pokemonMove) {
                        this.showNotice("Error, you can't select the same move twice")
                    } else {
                        this.team.pokemons[pokemonIndexNumber].move4 = pokemonMove;
                        this.save()
                    }
                    break;
            }


            // console.log(pokemonMove);
            // console.log(this.team.pokemons[0].move1);



        },
        /** remove a given pokemon from the team's team.  */
        remove(pokemon) {
            this.team.pokemons = this.team.pokemons.filter(x => x.name !== pokemon.name);
            this.save()
        },
        save() {
            axios.post('/team', this.team)
                .then(() => this.showNotice("Data Saved."))
                .catch(() => this.showNotice("Unable to Save Data."));
        },
        showNotice(text) {
            this.notice = text;
            setTimeout(() => this.notice = false, 2000);
        },
        /** Hide the search to reveal the team's team (current list of owned pokemons) */
        clearSearch() {
            this.searchFilter = null;
            this.results = null;
            this.notice = null;
        }
    },
    mounted() {
        /* Using axios to fetch data. 
        You could also use Fetch API if you prefer*/
        axios.get('https://pokeapi.co/api/v2/pokemon/?offset=0&limit=20000')
            .then(response => {
                console.log(response);
                this.pokemon = response.data.results
            })
            .catch(error => console.log(error));
    }
}).mount('#app')