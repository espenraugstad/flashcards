const express = require('express');
const storage = require('./modules/storagehandler');
const multer = require('multer'); //MULTER
const bodyParser = require('body-parser');
const server = express();

server.use(bodyParser.json());
server.use(express.static('public'));

const upload = multer({ dest: 'uploads/' }); //MULTER

const credentials = require('./NEI').credentials || process.env.DATABASE_URL;
const db = new storage(credentials);

/* ************************************** */

/* 

/collection/:collectionID

localhost:8080/collection/15

eventListener på collection Div
    get collection ID
    send videre til siden

*/

server.post('/api/deleteCard', async (req, res)=>{
    await db.deleteCard(req.body.id, req.body.cardToDelete.front, req.body.cardToDelete.back);
    res.status(200).end();
});

server.get('/api/getCollection/:collectionID', async (req, res)=>{
    let id = req.params.collectionID;
    let response = await db.getCollection(id);
    res.status(200).json(response.rows[0]).end();
});

server.post('/api/createCard/', async (req, res)=>{
    
    let id = req.body.collectionID;
    let front = req.body.front;
    let back = req.body.back;

    await db.createCard(id, front, back);
    
    res.status(200).end();

});

server.get('/api/getUserCollections/:username',async (req, res)=>{
    let username = req.params.username;

    let response = await db.getCollections(username);
    res.status(200).json(response.rows).end();

});

server.post('/api/createCollection/', async (req, res, next)=>{

    let user = req.body.userName;
    let collection = req.body.collectionName;

    let result = await db.createCollection(user, collection);
    
    res.status(200).json({collectionID: result.rows[0].id}).end();

});

server.post('/api/login/', upload.none(), async (req, res, next)=>{

    let userName = req.body.username;
    let password = req.body.password;

    //1. Finn brukernavn i database og hent ut passord
    let result = await db.getUser(userName);
    

    //2. Sjekk at passord stemmer med passord brukeren skrev inn
    if(result.rows[0].password === password){
        //Login success
        res.status(200).json({username: userName, msg: "OK"}).end();
    } else {
        //Login fail!
        console.log("Login failed.");
    }

});

server.post('/api/createUser/', upload.none(), async (req, res, next)=> {

    let userName = req.body.username;
    let password = req.body.password;


    let result = await db.checkUser(userName);

    if(result.rowCount === 0){
        //Add user to database
        let result2 = await db.createUser(userName, password);

    } else {
        console.log('User exists');
    }

    res.status(200).end();

});


/* ************************************** */
server.set('port', (process.env.PORT || 8080));
server.listen(server.get('port'), function() {
    console.log('server running', server.get('port'));
});