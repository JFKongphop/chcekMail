const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
const axios = require('axios');
const translate = require('translate-google');


const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));
app.use(cors());


// don't need database just fetch and send to this api then will connect webhook line chatbot
app.get('/', async (req, res) => {
    const { data } = await axios.get('http://127.0.0.1:5000');

    const mails = data.inside || "Emails are read";
    const bodydata = mails[0]["Body"] || mails

    const showSen = async (body) => {
        const sentence = await translate(body, {to: 'th'});
        console.log(sentence);

        return sentence
    }
    
    const responseUser = await showSen(bodydata);

    return res.status(200).send(responseUser)
})



app.listen(PORT, () => {
    console.log(`Running at http://localhost:${PORT}`);
})