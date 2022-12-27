const line = require('@line/bot-sdk')
const axios = require('axios').default;
const express = require('express');
const dotenv = require('dotenv');
const translate = require('translate-google');
const bodyParser = require('body-parser');


const app = express();
const PORT = 4000;
const env = dotenv.config().parsed;
// console.log(env.ACCESS_TOKEN);

// token to access to bot
const lineConfig = {
    channelAccessToken: env.ACCESS_TOKEN,
    channelSecret: env.SECRET_TOKEN
}

// log to own account
const client = new line.Client(lineConfig);

// convert time in from the date in mail api
const convertTimeToCurrent = (context) => {
    let currentTime = new Date(context);
    let newTime = new Date(currentTime.getTime());
    let dateString = newTime.toString().slice(0, 24);

    return dateString
}

// translate the body
const translateBody = async (body) => {
    const sentence = await translate(body, {to: 'th'});
    console.log(sentence);

    return sentence;
}

// check subject to not object
const validateString = (subject) => {
    if (typeof subject === "object"){
        return "Unknow";
    }

    return subject;
}

// get only email from sender
const validateFrom = (email) => {
    if (email.includes('<') && email.includes('>')){
        const firstPosMail = +email.indexOf('<') + 1;
        const secondPosMail = +email.indexOf('>');
        const from_address = email.slice(firstPosMail, secondPosMail);

        return from_address;
    }

    return email;
}

// Routing to webhook to line
// ngrok http =>  /webhook
app.post('/webhook', line.middleware(lineConfig), async (req, res) => {
    try {
        const events = req.body.events;
        console.log('event => ', events);

        return events.length > 0 ? await events.map((item) => handleEvent(item)) : res.status(200).send('OK');
    } 
    
    catch (error) {
        console.log("webhook state");
        return res.status(500).end();
    }
});


// send the message back when got the event
const handleEvent = async (event) => {
    try {
        console.log(event.message.text);

        // fetch the api o that read the unseen email
        const { data } = await axios.get('http://127.0.0.1:5000');
        const mails = data.inside || "Emails are read";

        // check of unseen is null or not
        if (typeof mails === "object") {
            let allMessages = "";
            for (const mail of mails) {

                // validate the element in mail
                const subject = validateString(mail['subject'] || mails); 
                const from = validateFrom(mail['from'] || mails);
                const date = convertTimeToCurrent(mail["date"]) || mails;
                const bodydata = mail["body"] || mails;
                const bodyContext = await translateBody(bodydata);

                // chcek the lenght of unseen email
                if (mails.length === 1){
                    const contextMessage = `Subject: ${subject}\nFrom: ${from}\nDate: ${date}\nBody: ${bodyContext}\n******************************`;
                    allMessages += contextMessage;
                }

                else{
                    const contextMessage = `Subject: ${subject}\nFrom: ${from}\nDate: ${date}\nBody: ${bodyContext}\n******************************\n`;
                    allMessages += contextMessage;
                }
            }

            return client.replyMessage(event.replyToken, {type : 'text', text : allMessages});      
        }

        return client.replyMessage(event.replyToken, {type : 'text', text : mails});
    }

    catch (error) {
        console.log('Some error');
        return client.replyMessage(event.replyToken, {type : 'text', text : 'Some error'}); 
    }
};

app.listen(PORT, () => {
    console.log(`Running at port ${PORT}`);
});