const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors')
const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cors());

let dbCon = mysql.createConnection({
    host : "localhost",
    user : "root",
    database : "readEmail"
})
dbCon.connect()

// index route of api
app.get('/', (req, res, next) => {
    return res.status(200).send({
        message : 'Welcome to my mail notifications.'
    });
});

// all of the detail in email
app.get('/isInside', (req, res) => {
    dbCon.query('SELECT * FROM insideEmail', (error, results, fields)=>{
        if (error) throw error;

        let  message = "";
        if (results === undefined || results.length === 0){
            message = "The email is read.";
        }

        else {
            message = "Successfully retrieved all emails.";
        }

        return res.send({
            error : false, 
            data : results, 
            message : message
        });
    })
});

app.get('/eachDetail/:id', (req, res) => {
    // get id of book to show each book
    let id = req.params.id;

    if (!id) {
        return res.status(400).send({error : true, message : "Please provide email id."})
    }

    // find id to show book
    else {
        dbCon.query("SELECT * FROM insideEmail WHERE id = ?", id, (error, results, fields)=>{
            if (error) throw error;

            let message = ""
            let eachEmail;

            if (results === undefined || results.length === 0){
                message = "Email not found";
            }
            
            else{
                message = "Successfully retrieved eamil data";
                eachEmail = results[0];

                // not check the id : the top of code is checked 
                // http://localhost:3000/eachDetail/1 use this link to test of the response and delete
                dbCon.query("DELETE FROM insideEmail WHERE id = ?", [id], (error)=>{
                    if (error) throw error;
                })
            }

            return res.send({
                error : false,
                data : eachEmail, 
                message : message
            });
        });
    }
})

app.listen(PORT, () => {
    console.log(`Running at port ${PORT}`);
})