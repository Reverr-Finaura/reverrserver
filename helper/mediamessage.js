const { default: axios } = require("axios");


  async function getmedia(data){
    var config ={
        method: "get",
        url: `https://graph.facebook.com/v17.0/${data}/`,
        headers: {
            Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
          },
    }
    return axios(config);
  }

  module.exports = getmedia;