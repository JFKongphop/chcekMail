const axios = require('axios');

// fetch from flask api
const fetchData = async () => {
    const { data } = await axios.get('http://127.0.0.1:5000');
    console.log(data);
}

fetchData();