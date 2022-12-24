const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const cors = require('cors')
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cors());

let dbCon = mysql.createConnection({
    host : "localhost",
    user : "root",
    database : "readEmail"
});

dbCon.connect();


// index route of api
app.get('/', (req, res, next) => {
    return res.status(200).send({
        message : 'Welcome to my mail notifications.'
        
    });
});

// all of the detail in email
app.get('/isInside', (req, res) => {
    // set all email after delete
    let allEmails;
    let message = "";

    // create database
    dbCon.query('SELECT * FROM insideEmail', (error, results, fields)=>{
        if (error) throw error;

        if (results === undefined || results.length === 0){
            message = "The email is read.";
        }

        else {
            message = "Successfully retrieved all emails.";
            allEmails = results;
            console.log(`in select ${allEmails}`);
        }

        // delete the table of mainTable
        dbCon.query('DROP TABLE insideEmail', (err) => {
            if (err) throw err;
        });


        // create the table mainTable
        let sqlCre = `CREATE TABLE insideEmail (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            date VARCHAR(100),
            from_address VARCHAR(100), 
            to_address VARCHAR(100), 
            subject VARCHAR(500), 
            body VARCHAR(10000))
        `;
    
        dbCon.query(sqlCre, (err) => {
            if (err) throw err;
        })


        return res.send({
            error : false, 
            data : allEmails, 
            message : message
        });
    })
});

// don't need database just fetch and send to this api then will connect webhook line chatbot
// http://localhost:3000/finalList
app.get('/finalList', async (req, res) => {
    const { data } = await axios.get('http://127.0.0.1:5000');

    return res.status(200).send({
        data : data
    })
})


// optional
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


app.get('/allEmail', (req, res) => {
    dbCon.connect((err) => {
        if (err) throw err;
        console.log("Connected!");

        let sql = `CREATE TABLE insideEmail (
            id INT AUTO_INCREMENT PRIMARY KEY, 
            from_address VARCHAR(100), 
            to_address VARCHAR(100), 
            subject VARCHAR(500), 
            body VARCHAR(10000))
        `;
        dbCon.query(sql, (err, result) => {
            if (err) throw err;
            console.log('Table create');
        });
    });
})

app.listen(PORT, () => {
    console.log(`Running at port ${PORT}`);
})