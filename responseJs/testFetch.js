const axios = require('axios');

// fetch from flask api
const fetchData = async () => {
    const { data } = await axios.get('http://127.0.0.1:5000');
    console.log(data);
    console.log(typeof data.inside);

    // const mails = data.inside || "Emails are read";
    // const bodydata = mails[0]["body"] || mails;

}

fetchData();