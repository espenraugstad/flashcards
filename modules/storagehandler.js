const pg = require('pg');

class StorageHandler {

    constructor(credentials){
        this.credentials = {
            connectionString: credentials,
            ssl: {
                rejectUnauthorized: false
            }
        };
    }

    async deleteCard(id, front, back){

        let finalResults;
        //1. Get all cards from currenct collection

        //2. Remove card from array

        //3. Set the new card array in database
        
        
        const client = new pg.Client(this.credentials);
        let currentCardsResult;
        let currentCards = [];
        let newCards = [];

        try {
            await client.connect();
            
            const query = {
                text: 'SELECT * FROM public."Collections" WHERE id=$1',
                values: [id] 
            };

            try{
                currentCardsResult = await client.query(query);
                currentCards = JSON.parse(currentCardsResult.rows[0].cards);

                //2 Remove card from array
                let cardToDelete = {
                    front: front,
                    back: back
                };
                

                for(let card of currentCards){
                    if(card.front === cardToDelete.front && card.back === cardToDelete.back){
                        newCards = currentCards.filter(accept => accept != card);
                        break;
                    }
                }
                //Update current collection with newCards
                const query2 = {
                    text: 'UPDATE public."Collections" SET cards = $1 WHERE id = $2',
                    values: [JSON.stringify(newCards), id] 
                };
                try {
                    finalResults = await client.query(query2);
                } catch (err){
                    console.log(`Spørring 2 feilet: ${err}`);
                }
                

                client.end(); 
            } catch (err){
                console.log(`Spørring 1 feilet: ${err}`);
            }
            

        } catch (err) {
            console.log(`Tilkobling feilet: ${err}`);
        }

        return finalResults;

    }

    async getCollection(id){
        const client = new pg.Client(this.credentials);
        let result;

        try {
            await client.connect();

            const query = {
                text: 'SELECT * FROM public."Collections" WHERE id=$1',
                values: [id] 
            };

            try {
                result = await client.query(query);
                client.end();
            } catch (err) {
                console.log(`Resultatet blei galt. ${err}`);
            }

        } catch (err){
            console.log(`Neimmen er du her, ${err}`);
        }

        return result;
    }

    async createCard(id, front, back){
        const client = new pg.Client(this.credentials);
        let result;
        let card = {
            front: front,
            back: back
        };

        let cardString = "";

        let oldCards;

        try {
            await client.connect();

            const query = {
                text: 'SELECT cards FROM public."Collections" WHERE id=$1',
                values: [id] 
            };

            try {
                let oldCardsResult = await client.query(query);
                
                if(oldCardsResult.rows[0].cards === ' '){
                    oldCards = [];
                } else {
                    oldCards = JSON.parse(oldCardsResult.rows[0].cards);
                }
                
                oldCards.push(card);
                cardString = JSON.stringify(oldCards);

            } catch (err) {
                console.log(`Resultatet blei galt. ${err}`);
                return;
            }

        } catch (err){
            console.log(`Neimmen er du her, ${err}`);
            return;
        }

        /* ********************************************* */
 
        try {

            const query = {
                text: 'UPDATE public."Collections" SET cards = $1 WHERE id = $2',
                values: [cardString, id] 
            };

            try {
                result = await client.query(query);
                client.end();
            } catch (err) {
                console.log(`Resultatet blei galt. ${err}`);
            }

        } catch (err){
            console.log(`Neimmen er du her, ${err}`);
        } 

        return result;
    }

    async getCollections(username){
        const client = new pg.Client(this.credentials);
        let result;

        try {
            await client.connect();

            const query = {
                text: 'SELECT * FROM "public"."Collections" WHERE "username" = $1',
                values: [username] 
            };

            try {
                result = await client.query(query);
                client.end();
            } catch (err) {
                console.log(`Resultatet blei galt. ${err}`);
            }

        } catch (err){
            console.log(`Neimmen er du her, ${err}`);
        }

        return result;
    }

    async createCollection(user, collection){
        const client = new pg.Client(this.credentials);
        let result;

        try {
            await client.connect();

            const query = {
                text: 'INSERT INTO "public"."Collections" ("username", "collection", "cards") VALUES($1, $2, $3) RETURNING "id"',
                values: [user, collection, ' '] 
            };

            try {
                result = await client.query(query);
                client.end();
            } catch (err) {
                console.log(`Resultatet blei galt. ${err}`);
            }

        } catch (err){
            console.log(`Neimmen er du her, ${err}`);
        }

        return result;
    }

    async getUser(userName){
        const client = new pg.Client(this.credentials);
        let result;

        try {

            await client.connect();

            const query = {
                text: 'SELECT * FROM "public"."Users" WHERE username=$1' ,
                values: [userName] 
            };

            try {
                result = await client.query(query);
                client.end();
            } catch (err) {
                console.log(err);
            }

        } catch (err){
            console.log(err);
        }

        return result;
    }

    async createUser(userName, password){
        const client = new pg.Client(this.credentials);
        let result;

        try {
            await client.connect();

            const query = {
                text: 'INSERT INTO "public"."Users" ("username","password") VALUES($1, $2)',
                values: [userName, password]
            };

            try {

                result = await client.query(query);
                client.end();

            } catch (err){
                console.log(err);
            }

        } catch (err) {
            console.log(err);
        }

        return result;

    }

    async checkUser(userName){
        const client = new pg.Client(this.credentials);
        let result;
        try {

            await client.connect();

            const query = {
                text: 'SELECT * FROM "public"."Users" WHERE username=$1' ,
                values: [userName]
            };

            try {
                result = await client.query(query);
                client.end();
            } catch (err) {
                console.log(err);
            }
        } catch (err) {
            console.log(err);
        }

        return result;
    }
}

module.exports = StorageHandler;