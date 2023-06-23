const { default: axios } = require("axios");

// https://graph.facebook.com/v17.0/100438179766506/messages

async function sendMessage(data) {
  var config = {
    method: "post",
    url: `https://graph.facebook.com/${process.env.VERSION}/${process.env.PHONE_NUMBER_ID}/messages`,
    headers: {
      Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    data: data,
  };

  return axios(config);
}

module.exports = sendMessage;
