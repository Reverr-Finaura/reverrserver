const app = require("express")();
const path = require("path");
const shortid = require("shortid");
const Razorpay = require("razorpay");
require("dotenv").config();
const cors = require("cors");
const bodyParser = require("body-parser");
const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const { Payment, Refund, MessagesSend, MessagesReceived } = require("./config");
const { json } = require("body-parser");
const axios = require("axios");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const PORT = process.env.SERVER_PORT || 3000;
var secret =
  "pZDneOGeFBwtF3B5MtUcfNkgbQUYcRAZOvARifwxDb5eBTWG2hn7Wte10KxKAuji3OvCCwfzweVdsqvih2ASw1uaYXL8KPiVqAWTYqVa2kdch1uUWrMjbSAnBNIDpNl2";
const {
  Authorization,
  Redirect,
  SignupAuthorization,
  SignupRedirect,
} = require("./authHelper");
const sendMessage = require("./helper/message");
const messageHelper = require("./helper/helper");
const getmedia = require("./helper/mediamessage");
const { bucket, db, Timestamp, FieldValue } = require("./config");
const extractTextFromPDF = require("./pdf");
const responsecreate = require("./parse");
const resume = require("./aicontent");
const summary = require("./summary");
const jobdes = require("./jobdes");
const skill = require("./skill");

const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const sp = require("./sp");

// console.log(sp);
// var temp=[];
// sp.map((item,idx)=>{
// 	item.Type.map((subitem, subidx)=>{
// 		if(temp.includes(subitem)){
// 			console.log("exists", subitem, idx, subidx)
// 		}else{
// 			temp.push(subitem)
// 		}
// 	})
// })
// console.log(temp)

const cat1 = [
  "Legal",
  "One Stop Solution for Business Incorporation Lincensing Registration and certification",
  "Certification",
  "Company Incorporation",
  "GST Registration",
  "Start up Registration",
  "business set up",
  "all compliances",
];
const cat2 = [
  "Accounting",
  "Transaction advisory",
  "Auding Services",
  "Audit",
  "M&A tax",
  "Bookkeeping",
  "Taxation (GST & Income)",
  "Auditing",
  "Income Tax Return (ITR) Filing",
  "TDS filing",
  "GST Filing",
  "CA services like taxation",
  "GST",
  "income tax",
  "Auditing",
];
const cat3 = [
  "Technology",
  "We build MVP solutions in terms of Web & Mobile Apps",
  "Custom Web and App Development",
];
const cat4 = [
  "Pitch deck",
  "Financial model",
  "Business Plan",
  "Secretarial & Valuations",
  "Valuations",
  " Pitch deck",
];
const cat5 = [
  "Brand Names",
  "Logo Designing",
  "Marketing",
  "VFX & Animation Digital Branding Resource Augmentation",
  "marketing",
];

var sp1 = [];
var sp2 = [];
var sp3 = [];
var sp4 = [];
var sp5 = [];

sp.map((item, idx) => {
  var elgbl1 = false;
  var elgbl2 = false;
  var elgbl3 = false;
  var elgbl4 = false;
  var elgbl5 = false;
  for (var i = 0; i < item.Type.length; i++) {
    if (cat1.includes(item.Type[i])) {
      elgbl1 = true;
    }
    if (cat2.includes(item.Type[i])) {
      elgbl2 = true;
    }
    if (cat3.includes(item.Type[i])) {
      elgbl3 = true;
    }
    if (cat4.includes(item.Type[i])) {
      elgbl4 = true;
    }
    if (cat5.includes(item.Type[i])) {
      elgbl5 = true;
    }
  }
  if (elgbl1) {
    sp1.push(item);
  }
  if (elgbl2) {
    sp2.push(item);
  }
  if (elgbl3) {
    sp3.push(item);
  }
  if (elgbl4) {
    sp4.push(item);
  }
  if (elgbl5) {
    sp5.push(item);
  }
});
// console.log(sp1,sp2,sp3,sp4,sp5)

const uuid = uuidv4();
let sid = process.env.ACCOUNT_SID;
let auth_token = process.env.AUTH_TOKKEN;
// let twilio = require("twilio")(sid, auth_token);
//server domain
//https://reverrserver.herokuapp.com/
var corsOptions = {
  origin: "*",
  optionsSuccessStatus: 200,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};
app.use(cors(corsOptions));
// app.options('*', cors())
app.use(bodyParser.json());

const razorpay = new Razorpay({
  key_id: "rzp_live_BPxSfmKEXNm7T5",
  key_secret: "FeuhD71ytsUEG22qGugjEv0A",
});

const cashfree = {
  clientId: "21235619dae90a7c71fa82b24c653212",
  clientSecret: "b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
};

const APP_ID = "904538e9e76546c49aabef629237f0fd";
const APP_CERTIFICATE = "b083ff1a9aad4db1822cd1d8c944d016";

function getRandomString(length) {
  var randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

const nocache = (req, res, next) => {
  var secret =
    "pZDneOGeFBwtF3B5MtUcfNkgbQUYcRAZOvARifwxDb5eBTWG2hn7Wte10KxKAuji3OvCCwfzweVdsqvih2ASw1uaYXL8KPiVqAWTYqVa2kdch1uUWrMjbSAnBNIDpNl2";

  // const {authorization} = req.headers;
  // if(!authorization || authorization !== secret){
  //    return  res.status(401).json({error:"UnAuthorized!"})
  //    }
  res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
  res.header("Expires", "-1");
  res.header("Pragma", "no-cache");

  next();
};

const generateAccessToken = (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  var channel = req.body.channelName ? req.body.channelName : "demo";
  var uid = 0;
  var role = req.body.host ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
  var expireTime = 3600;
  var currTime = Math.floor(Date.now() / 1000);
  var privilegeExpireTime = currTime + expireTime;

  console.log(req.body);

  const token = RtcTokenBuilder.buildTokenWithUid(
    APP_ID,
    APP_CERTIFICATE,
    channel,
    uid,
    role,
    privilegeExpireTime
  );

  return res.send({ token });
};

const Authorize = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || authorization !== secret) {
    return res.status(401).json({ error: "UnAuthorized!" });
  }
  next();
};

app.post("/accesstoken", nocache, generateAccessToken);

app.get("/logo.svg", (req, res) => {
  res.sendFile(path.join(__dirname, "logo.svg"));
});

app.post("/razorpay", Authorize, async (req, res) => {
  const payment_capture = 1;
  const amount = 5;
  const currency = "INR";

  const options = {
    amount: amount * 100,
    currency,
    receipt: shortid.generate(),
    payment_capture,
  };

  try {
    const response = await razorpay.orders.create(options);
    console.log(response);
    res.json({
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.log(error);
  }
});

app.post("/refund", Authorize, async (req, res) => {
  try {
    const response = await razorpay.payments.refund("pay_J6tLxaMMxPWREU");
    console.log(response);
    res.send(response);
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

app.get("/test", async (req, res) => {
  try {
    console.log("test");
  } catch (err) {
    console.log("Error", err);
  }
});

app.post("/verification", async (req, res) => {
  // do a validation
  const secret = "G7brM8xQ6$RtNYs";

  const crypto = require("crypto");

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    // process it
    const date = new Date();
    const payment = {
      date:
        date.getDate() +
        "|" +
        (1 + date.getMonth()) +
        "|" +
        date.getFullYear() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        " " +
        getRandomString(8),
      payment: req.body,
    };
    await Payment.add(payment);
    return res.json({ status: "ok" });
  } else {
    // pass it
    return res.status(401).json({ error: "UnAuthorized!" });
  }
});

app.post("/verification/refund", async (req, res) => {
  // do a validation
  const secret = "G7brM8xQ6$RtNYs";

  // console.log(req.body)

  const crypto = require("crypto");

  const shasum = crypto.createHmac("sha256", secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest("hex");

  console.log(digest, req.headers["x-razorpay-signature"]);

  if (digest === req.headers["x-razorpay-signature"]) {
    console.log("request is legit");
    // process it
    const date = new Date();
    const refund = {
      date:
        date.getDate() +
        "|" +
        (1 + date.getMonth()) +
        "|" +
        date.getFullYear() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        " " +
        getRandomString(8),
      refund: req.body,
    };
    await Refund.add(refund);
    return res.json({ status: "ok" });
    // require('fs').writeFileSync('refund3.json', JSON.stringify(req.body, null, 4))
  } else {
    return res.status(401).json({ error: "UnAuthorized!" });
  }
});

app.post("/cftoken", (req, res) => {
  const order = {
    orderId: req.body.orderId,
    orderCurrency: req.body.currency,
    orderAmount: req.body.amount,
  };

  // var hash="$2b$10$wu8ujbqHIaelkAQ.MfmRE.eVx.7iVOBfbyIbsD1zRSWvgzsFf4goe";
  // bcrypt.genSalt(saltRounds, function(err, salt) {
  // 	bcrypt.hash(secret, salt, function(err, hashs) {
  // 		hash=hashs;
  // 		// console.log("hash",hash);
  // 	});
  // });

  bcrypt.compare(secret, req.body.secret, function (err, result) {
    if (result) {
      try {
        axios({
          method: "post",
          url: "https://api.cashfree.com/api/v2/cftoken/order",
          headers: {
            "Content-Type": "application/json",
            "x-client-id": cashfree.clientId,
            "x-client-secret": cashfree.clientSecret,
          },
          data: JSON.stringify(order),
        })
          .then(function (response) {
            res.status(200);
            res.json({ cftoken: response.data.cftoken });
          })
          .catch((err) => {
            res.status(400);
            res.json({ error: "ERROR" });
            console.log("then error", err);
          });
      } catch (err) {
        console.log("axois error", err);
        res.send("Err");
      }
    } else {
      res.status(401);
      res.json({ msg: "UnAuthenticated!" });
    }
  });
});

app.post("/webcftoken/rs", async (req, res) => {
  const { id, amount, currency, customer_id, customer_phone } = req.body;
  let dt = {
    customer_details: {
      customer_id: customer_id,
      customer_phone: customer_phone,
    },
    order_id: id,
    order_amount: amount,
    order_currency: currency,
  };
  try {
    let resp = await axios.post("https://api.cashfree.com/pg/orders", dt, {
      headers: {
        "x-client-id": "5576698180b9b64d59e8bc1d8f966755",
        "x-client-secret":
          "cfsk_ma_prod_00941e05bf52f2b92c318e0480c7b251_24d03023",
        "x-api-version": "2022-01-01",
      },
    });
    res.json({ token: resp?.data?.order_token });
  } catch (err) {
    console.log("err", err);
  }
});

app.post("/webcftoken", async (req, res) => {
  const { id, amount, currency, customer_id, customer_phone } = req.body;
  let dt = {
    customer_details: {
      customer_id: customer_id,
      customer_phone: customer_phone,
    },
    order_id: id,
    order_amount: amount,
    order_currency: currency,
  };
  try {
    let resp = await axios.post("https://api.cashfree.com/pg/orders", dt, {
      headers: {
        "x-client-id": "21235619dae90a7c71fa82b24c653212",
        "x-client-secret": "b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
        "x-api-version": "2022-01-01",
      },
    });
    res.json({ token: resp?.data?.order_token });
  } catch (err) {
    console.log("err", err);
  }
  // const options = {
  //   method: "POST",
  //   url: "https://api.cashfree.com/pg/orders",
  //   headers: {
  // 	"accept": "application/json",
  // 	"x-client-id": "21235619dae90a7c71fa82b24c653212",
  // 	"x-client-secret": "b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
  // 	"x-api-version": "2022-01-01",
  // 	"content-type": "application/json",
  // 	"Access-Control-Allow-Origin": "*",
  //   },
  //   data: {
  // 	customer_details: {
  // 	  customer_id: customer_id,
  // 	  customer_phone: customer_phone,
  // 	},
  // 	order_id: id,
  // 	order_amount: amount,
  // 	order_currency: currency,
  //   },
  // };
  // console.log("reached")
  // axios
  //   .request(options)
  //   .then(function (response) {
  // 	console.log(response.data.order_token)
  // 	// res.setHeader("Access-Control-Allow-Origin", "*");
  // 	// res.header('Access-Control-Allow-Methods', '*');
  // 	// res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  // 	// res.header('Access-Control-Allow-Credentials', true);
  // 	res.json({ token: response.data.order_token });
  //   })
  //   .catch(function (error) {
  // 	console.error(error);
  //   });
});

app.post("/webSplitPayment", (req, res) => {
  const { orderId, vendorId, amount, secrett } = req.body;
  if (secrett === "2V7W@ODU6HTRS1GY$54JQ*EP0F8N%9!BI&AXKML3#ZCQ!$3U") {
    const options = {
      method: "POST",
      url: `https://api.cashfree.com/api/v2/easy-split/orders/${orderId}/split`,
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": "21235619dae90a7c71fa82b24c653212",
        "X-Client-Secret": "b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
      },
      data: {
        split: [
          {
            vendorId: vendorId,
            amount: amount,
            // "vendorId":"ansh123456bansal",
            // "amount":(1)*0.9,
            percentage: null,
          },
        ],
        splitType: "ORDER_AMOUNT",
      },
    };
    axios
      .request(options)
      .then(function (response) {
        res.json({ message: response.data });
      })
      .catch(function (error) {
        console.error(error);
      });
  } else {
    res.status(401);
    res.json({ message: "UnAuthenticated!" });
  }
});

app.post("/sendSms", (req, res) => {
  const { to, message } = req.body;
  twilio.messages
    .create({
      from: "+12706067949",
      to: `+91${to}`,
      body: message,
    })
    .then((r) => {
      console.log(r);
      res.send({ status: true, message: "Message Send to your Number" });
    })
    .catch((err) => console.log(err));
});
app.post("/sendSmsCode", (req, res) => {
  const { to, message, code } = req.body;
  twilio.messages
    .create({
      from: "+12706067949",
      to: `+${code}${to}`,
      body: message,
    })
    .then((r) => {
      console.log(r);
      res.send({ status: true, message: "Message Send to your Number" });
    })
    .catch((err) =>
      res.status(400).send({ status: false, message: err.message })
    );
});

app.get("/api/linkedin/authorize", (req, res) => {
  return res.redirect(Authorization());
});
app.get("/api/linkedin/signup/authorize", (req, res) => {
  return res.redirect(SignupAuthorization());
});
app.post("/getUserDataFromLinkedin", async (req, res) => {
  const { code } = req.body;
  await Redirect(code, res);
});
app.post("/getUserDataFromLinkedin/signup", async (req, res) => {
  const { code } = req.body;
  await SignupRedirect(code, res);
});

// app.post('/webhook',async(req,res)=>{
//   const { payload } = req.body;

//   await MessagesReceived.add({
//     data: payload.jsonPayload.entry[0].changes[0].value,
//   });

//   const messageReceived = payload.jsonPayload.entry[0].changes[0].value.messages;
//   const messageText = messageReceived[0].text.body;
//   const messageFrom = messageReceived[0].from;

//   if(messageText == "Hi" || messageText == "hii" || messageText == "hello" || messageText == "HI" || messageText == "Hii"){
//     const messageInput = messageHelper.getCustomTextInput(
//       messageFrom,
//       "Hello, How can I help you?"
//     );
//     try {
//       const { data } = await sendMessage(messageInput);
//       await MessagesSend.add({
//         messageId: data.messages[0].id,
//         message: JSON.parse(messageInput),
//       });
//       res.json({
//         status: "success",
//         response: data,
//       });
//     } catch (error) {
//       // console.log(error);
// 	  res.status(400).json({
// 		  status:"error",
// 		  message:error.message
// 	  })
//     }
//   }else{
//     const messageInput = messageHelper.getCustomTextInput(
//       messageFrom,
//       "Thank you for your message. We will get back to you soon."
//     );
//     try {
//       const { data } = await sendMessage(messageInput);
//       await MessagesSend.add({
//         messageId: data.messages[0].id,
//         message: JSON.parse(messageInput),
//       });
//       res.json({
//         status: "success",
//         response: data,
//       });
//     } catch (error) {
// 		res.status(400).json({
// 			status:"error",
// 			message:error.message
// 		})
//     }
//   }
// })
const storageRef = bucket;
var outputPath = "";

async function uploadFile(path, filename, mediaid, messageFrom, mediatype) {
  // Upload the File
  const storage = await storageRef.upload(path, {
    public: true,
    destination: `Whatsappclouduploads/${filename}`,
    metadata: {
      metadata: {
        firebaseStorageDownloadTokens: uuid,
      },
    },
  });

  fs.stat(`${path}`, function (err, stats) {
    // console.log(stats);
    if (err) {
      return console.error(err);
    }
    fs.unlink(`${path}`, function (err) {
      if (err) return console.log(err);
    });
  });

  await db
    .collection("WhatsappMessages")
    .doc(`${messageFrom}`)
    .update({
      messages: FieldValue.arrayUnion({
        status: "success",
        messageId: mediaid,
        date: Timestamp.now(),
        url: storage[0].metadata.mediaLink,
        previevUrl: `https://firebasestorage.googleapis.com/v0/b/reverr-25fb3.appspot.com/o/${storage[0].id}?alt=media&token=${storage[0].metadata.metadata.firebaseStorageDownloadTokens}`,
        mediatype: mediatype,
      }),
    });

  // console.log(storage[0].metadata.metadata.firebaseStorageDownloadTokens);
  // console.log(storage[0].id);
  return storage[0].metadata.mediaLink;
}

const checkmsgalreadyreplied = async (id) => {
  var msgRef = await db.collection("meta").doc("msgRec").get();
  const msgRec = msgRef.data();
  console.log(msgRec);
  if (msgRec.id.includes(id)) {
    console.log(true);
  } else {
    console.log(false);
  }
};

app.post("/sendwacustommsg", async (req, res) => {
  console.log("/sendwacustommsg", req.body);
  try {
    const { number, text, countryCode } = req.body;
    const messageFrom = countryCode + number;
    messageInput = messageHelper.getCustomTextInput(messageFrom, text);
    // console.log(messageFrom)
    const { data } = await sendMessage(messageInput);

    const userexist = await db
      .collection("WhatsappMessages")
      .doc(`${messageFrom}`)
      .get();
    if (!userexist.exists) {
      console.log("no doc");
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .set({ exists: "true", number: messageFrom });
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    } else {
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    }

    // console.log(data)
    res.send("successfully send");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
app.post("/sendwamucm", async (req, res) => {
  console.log("/sendwamucm", req.body);
  try {
    const { numbers, text, countryCodes } = req.body;

    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];
      const countryCode = countryCodes[i];
      const messageFrom = countryCode + number;
      messageInput = messageHelper.getCustomTextInput(messageFrom, text);
      // console.log(messageFrom)
      const { data } = await sendMessage(messageInput);

      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage: null,
            }),
          });
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage: null,
            }),
          });
      }

      // console.log(data)
    }

    res.send("successfully send");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post("/sendwatemplatemsg", async (req, res) => {
  console.log("/sendwatemplatemsg", req.body);
  try {
    console.log("rec");
    const { number, templateName, countryCode } = req.body;
    const messageFrom = countryCode + number;
    messageInput = messageHelper.getTemplateTextInput(
      messageFrom,
      templateName
    );
    // console.log(messageFrom)
    const { data } = await sendMessage(messageInput);

    const userexist = await db
      .collection("WhatsappMessages")
      .doc(`${messageFrom}`)
      .get();
    if (!userexist.exists) {
      console.log("no doc");
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .set({ exists: "true", number: messageFrom });
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    } else {
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    }

    // console.log(data)
    console.log("send");
    res.send("successfully send");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post("/sendwamutm", async (req, res) => {
  console.log("/sendwamutm", req.body);
  try {
    console.log("rec");
    const { numbers, templateName, countryCodes } = req.body;

    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];
      const countryCode = countryCodes[i];
      const messageFrom = countryCode + number;
      messageInput = messageHelper.getTemplateTextInput(
        messageFrom,
        templateName
      );
      // console.log(messageFrom)
      const { data } = await sendMessage(messageInput);

      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage: null,
            }),
          });
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage: null,
            }),
          });
      }

      // console.log(data)
    }
    console.log("send");
    res.send("successfully send");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

/// send video template
app.post("sendwatemplatemsgvideo", async (req, res) => {
  try {
    const { number, templateName, countryCode, video } = req.body;
    const messageFrom = countryCode + number;
    messageInput = messageHelper.getTemplateTextAndVideoInput(
      messageFrom,
      templateName,
      video
    );
    const { data } = await sendMessage(messageInput);
    const userexist = await db
      .collection("WhatsappMessages")
      .doc(`${messageFrom}`)
      .get();
    if (!userexist.exists) {
      console.log("no doc");
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .set({ exists: "true", number: messageFrom });
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    } else {
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    }

    // console.log(data)
    res.send("successfully send");
  } catch (error) {
    console.log(err);
    res.send(err);
  }
});
app.post("/sendwatemplatemsgimg", async (req, res) => {
  // console.log("/sendwatemplatemsgimg", req.body);
  try {
    const { number, templateName, countryCode, image } = req.body;
    const messageFrom = countryCode + number;
    messageInput = messageHelper.getTemplateTextAndImageInput(
      messageFrom,
      templateName,
      image
    );
    const { data } = await sendMessage(messageInput);
    const userexist = await db
      .collection("WhatsappMessages")
      .doc(`${messageFrom}`)
      .get();
    if (!userexist.exists) {
      console.log("no doc");
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .set({ exists: "true", number: messageFrom });
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    } else {
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    }
    res.send("successfully send");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
/// mutiple send video template
app.post("sendwamutmvideo"),
  async (req, res) => {
    try {
      const { numbers, templateName, countryCodes, video } = req.body;
      for (let i = 0; i < numbers.length; i++) {
        const number = numbers[i];
        const countryCode = countryCodes[i];
        const messageFrom = countryCode + number;
        messageInput = messageHelper.getTemplateTextAndVideoInput(
          messageFrom,
          templateName,
          video
        );

        const { data } = await sendMessage(messageInput);
        const userexist = await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .get();
        if (!userexist.exists) {
          console.log("no doc");
          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .set({ exists: "true", number: messageFrom });
          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({
              messages: FieldValue.arrayUnion({
                status: "success",
                messageId: data.messages[0].id,
                message: JSON.parse(messageInput),
                date: Timestamp.now(),
                usermessage: null,
              }),
            });
        } else {
          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({
              messages: FieldValue.arrayUnion({
                status: "success",
                messageId: data.messages[0].id,
                message: JSON.parse(messageInput),
                date: Timestamp.now(),
                usermessage: null,
              }),
            });
        }
      }
      res.send("successfully send");
    } catch (error) {
      res.send(err);
    }
  };
app.post("/sendwamutmimg", async (req, res) => {
  // console.log("/sendwamutmimg", req.body);

  try {
    const { numbers, templateName, countryCodes, image } = req.body;
    for (let i = 0; i < numbers.length; i++) {
      const number = numbers[i];
      const countryCode = countryCodes[i];
      const messageFrom = countryCode + number;
      messageInput = messageHelper.getTemplateTextAndImageInput(
        messageFrom,
        templateName,
        image
      );
      console.log(messageFrom);
      const { data } = await sendMessage(messageInput);
      console.log(data);

      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage: null,
            }),
          });
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage: null,
            }),
          });
      }
    }
    res.send("successfully send");
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.post("/webhook", async (req, response) => {
  var webinar_details = await db.collection("meta").doc("webinar").get();
  webinar_details = webinar_details.data();
  var { payload } = req.body;
  console.log(payload);
  console.log(payload.entry[0]);
  console.log(payload.entry[0].id);
  console.log(payload.entry[0].changes[0].value.contacts);
  console.log(payload.entry[0].changes[0].value.messages);
  var msg_id = payload.entry[0].id;
  if (msg_id) checkmsgalreadyreplied(msg_id);

  var lastMsgNotEmpty = false;
  var name = "";
  var linkedin = "";
  var bio = "";
  var lastMsg = "";
  var lastMsgSend = "";
  var lastMsgRec = "";
  let messageInput;
  var stopMsg = false;
  var calendly = "";

  var currentProfile = {
    id: "918744961008",
    exists: "true",
    stage: "have an idea but lack the necessary resources/ guidance🫣",
    name: "Reverr",
    linkedin: "www.reverr.io",
    bio: "I'm Reverr",
    profile: true,
    userType: "founder",
    fundingForm: true,
    currentNeed: "Discover networking opportunities",
    space: "FinTech",
    calendly: "Reverr",
  };

  var tsp = {
    Name: "",
    Linkedin: "",
    Website: "",
    Type: [],
    Number: "",
    Email: "",
    Company: "",
    Timestamp: "",
  };

  var messageReceived = payload.entry[0].changes[0].value.messages;
  var messageText = messageReceived[0].text.body;
  var messageFrom = messageReceived[0].from;
  var usermessage = messageReceived[0].text.body;
  var userChat = await db
    .collection("WhatsappMessages")
    .doc(`${messageFrom}`)
    .get();
  if (!userChat.exists) {
    console.log("No doc found!");
  } else {
    userChat = userChat.data();
    // console.log("user data", userChat)
    // console.log(userChat.messages.length)
    var lastMsg = userChat.messages[userChat.messages.length - 1];
    if (
      lastMsg != undefined &&
      (lastMsg.message != "" || lastMsg.message != null)
    ) {
      lastMsgNotEmpty = true;
    }
    // lastMsg = userChat.messages[2]; checking template
    //  console.log(lastMsg.usermessage) // last msg that we recieved from user
    //  console.log( lastMsg.message.type =="template"?lastMsg.message.template.name: lastMsg.message.text.body) // last msg that we send to user
    lastMsgSend =
      lastMsg.message == null
        ? null
        : lastMsg.message.type == "template"
        ? lastMsg.message.template.name
        : lastMsg.message.text.body;
    lastMsgRec = lastMsg.usermessage;

    //initializing values
    if (userChat.name) {
      name = userChat.name;
    }
    if (userChat.linkedin) {
      linkedin = userChat.linkedin;
    }
    if (userChat.bio) {
      bio = userChat.bio;
    }
    if (userChat.stop) {
      stopMsg = userChat.stop;
    }
    if (userChat.calendly) {
      calendly = userChat.calendly;
    }
  }
  //   Legal
  //   Accounting
  //   Pitch deck
  //   Financial model
  //   Business Plan
  //   Secretarial & Valuations
  //   Brand Names
  //   Logo Designing
  //   Compatibility between 2 Founders
  //   Team Hiring
  //   Team Building
  //   Marketing
  //   Technology
  //   Business strategy
  //   applied human behaviour
  //   Transaction advisory
  //   Valuations
  //   M&A tax
  //   We build MVP solutions in terms of Web & Mobile Apps
  //   Credit Consultancy
  //   Professional
  //   Auding Services
  //   One Stop Solution for Business Incorporation Lincensing Registration and certification
  //   Audit
  //   Bookkeeping
  //   Taxation (GST & Income)
  //   certification
  //   Advisory
  //   Auditing
  //   Company Incorporation
  //   GST Registration
  //   Start up Registration
  //   Income Tax Return (ITR) Filing
  //   TDS filing
  //   GST Filing
  //   Tax Advisory
  //   Custom Web and App Development
  //   E‐Commerce & CMS Solutions ERP
  //   CRM & HRMS Solutions Games
  //   VFX & Animation Digital Branding Resource Augmentation
  //   Video Services (Investor pitch video, Product video, Sales booster video,  Social media video)
  //   Sales
  //   Assisted Fundraising
  //   Pitch deck
  //   CA services like taxation
  //   GST
  //   income tax
  //   auditing
  //   business set up
  //   all compliances

  // <---- CUSTOM MSG---->

  // var msg_hello = "Hi, there😉 \nWelcome to Reverr. We hope you are doing great. \n\nReverr aims to assist startups by being a platform that connects startup founders to mentors, investors, and service providers while providing knowledge and networking opportunities. 🎯 \n\nTell us about yourself and allow us to cater to all your needs. \n*Type 1* if you’re a Startup Founder \n*Type 2* if you’re a Professional "
  // var msg_askName = "We are happy that you're here.🤗 \nHow should we address you? Please type in your full name."
  var msg_confirmName1 = "Hi, ";
  var msg_confirmName3 = "? \n*Type 1* to *confirm* \n*Type 0* to *retry*";
  var msg_confirmName = msg_confirmName1 + name + msg_confirmName3;
  var msg_askLinkedin =
    "Let's build your profile first.📑 Please share your LinkedIn URL.🔗";
  //   var msg_askLinkedin =
  //     "Let's build your profile first.📑\nKindly share your Linkedin URL.";
  var msg_confirmLinkedin = `Your Linkedin URL is ${linkedin} \n*Type 1* to *confirm* \n*Type 0* to *retry*`;
  var msg_askbio =
    "We have noted it 😉.\nNow please write down a one-liner bio for yourself mentioning your expertise, experience, and interests. 👩🏻‍💼👨🏻‍💼";
  var msg_confirmBio = `${bio} , is this correct? \n*Type 1* to *confirm* \n*Type 0* to *retry*`;
  var msg_askStage =
    "That sounds good.🤩\nNow pick what resonates with you the most.\n\n*Type 1* if you have an idea and wish to execute it.🗣️\n*Type 2* if you are running a successful startup 😎\n*Type 3* if you have an idea but lack the necessary resources/ guidance🫣\n*Type 4* if you are running a startup and wish to grow & expand it further🤑\n*Type 5* if you are exploring your options 🤔";
  var msg_askOffering =
    "Type in the number of offering that suits your needs the best and let us take care of the rest 😋. \n\n*Type 1*. Get funding from VCs, Angels, and relevant Investors 💰\n*Type 2*. Discover networking opportunities 👥\n*Type 3*. Seek knowledge in bite-sized portions 📝\n*Type 4*. Connect with service providers for assistance 🧑‍🔧\n*Type 5*. Access “ *Startup Bites* ”- Precisely-curated news items🤓\n*Type 6. Build with Reverr-* a guided journey from *Idea to Enterprise*💡";
  var msg_dontUnderstand =
    "Uh oh, I don’t quite understand that.😕 \n\nType 1 to try again!";
  var msg_dontUnderstandNoAction =
    "Sorry, I dont understand what do you mean by that. \n\nPlease type menu to go to menu.";
  var msg_fundingForm =
    "We have numerous VCs, Angels, and Investors on our platform and work with Investment Associates who have substantiated experience in the industry.📈💰\n\nFill out the following form and share some details for us to provide you with a database of relevant investors.📂🙂\n\n*Link to the form*: https://forms.gle/Y93rD4vuVyFWoFZp9\n\n*Type 1* if you’ve filled out the form\n\nType back to go back";
  var msg_fundingFormFilled =
    "Thank you for sharing the Details 😋.\n\nOur team will do a manual review and will connect with you in case the deal seems doable.🙌🏻Your patience is highly valued. Have a great day ahead! 😉 \n\nType Menu to open main menu.";
  var msg_professionalOfferings =
    "Type in the number of offering that suits your needs the best and let us take care of the rest.😋\n*Type 1*. Discover networking opportunities👥\n*Type 2*. Seek knowledge in bite-sized portions🗂️\n*Type 3* to connect with *Business mentors*🧑‍💼\n*Type 4* to access “ *Startup Bites* ”- Precisely-curated news items🤓";
  var msg_professionalNetworking =
    "Networking with the right people can escalate your business to newer heights.\nLet us help you in finding the best-suited individuals based on your preferences.😉\n\n*Type 1*. Check out the latest *'Refreshed by Reverr'* offline events 👥\n*Type 2*. Join *Reverr Spaces* (Communities)🤝\n*Type 3*. Connect *one-on-one* with like-minded people 👯\n\n*Type menu* to go back to the Menu.";
  var msg_createProfile =
    "First please create your profile inorder to continue. \nType hi to start onboarding.";
  var msg_errorProfile =
    "Some error occured please create your profile again to continue. \nType hi to start onboarding.";
  //   var msg_networkingOptions =
  //     "Networking with the right people can escalate your business to newer heights.\nLet us help you in finding the best-suited individuals based on your preferences. 🤓\n\n*Type 1*. Check out the latest *'Refreshed by Reverr'* offline events 👥\n*Type 2*. Join *Reverr Spaces* (Communities)🤝\n*Type 3*. Book a seat for *Reverr School's Free Online webinars* 🧑‍🎓\n*Type 4*. *Connect one-on-one* with like-minded people 👯";
  var msg_networkingOptions =
    "Networking with the right people can escalate your business to newer heights.\n\nLet us help you in finding the best-suited individuals based on your preferences. 🤓\n\n*Type 1* to Check out Networking events👥\n\n*Type 2* to Join Reverr Spaces (Community)🤝\n\n*Type 3* to Connect one-on-one with like-minded people👯";
  var msg_Networkingevents =
    "Sounds great!\n\nWhat kind of networking events would you like to attend?🤔\n\n*Type 1* to check out online events💻\n\n*Type 2* to check out offline events👥";
  var msg_MayraReponse =
    " Understood.💯\n\nWe have noted down your preferences.\n\nWe are now forwarding you to *Myra*, Reverr’s agent who will keep in touch with you and will ensure a seamless experience for you here.🤗\n\n	\n\nType menu to back to menu";
  //   var msg_reverrSpace =
  //     "Great choice!\n\nHere is the link to join the community of budding & seasoned entrepreneurs.🤗\n\nLink to Reverrites🔗: https://chat.whatsapp.com/GYG93rm4dVSH5521jNvtej \n\nType menu to back to menu";
  var msg_rbrRegisterLink =
    "Here’s the link to register for the next Refreshed by Reverr event!\n\nRefreshed by Rever is not just your run-of-the-mill startup gathering; it's an exclusive convention tailored to empower emerging entrepreneurs by fostering connections, knowledge-sharing, and business growth.📊\n📈 Propel your startup to new heights,\n👥 Connect with potential business connections who believe in your vision,\n🎁 And access real good bonuses!\n\n*Book your seat now*: https://forms.gle/iJkCYxSaBC1pcWJx9\n\n*Type 1* if you’ve *registered* for RBR\n*Type menu* to go back to the Menu.\n*Type back* to go back.";
  var msg_rbrRegistered =
    "Yay! See you there.🙋🏻‍♀️ \n\n*Type menu* to go back to the Menu.";
  var msg_reverrSpacesCommunity =
    "Great choice!👌\nHere is the link to join the community of budding & seasoned entrepreneurs.👥\n*Link to Reverrites:* https://chat.whatsapp.com/GYG93rm4dVSH5521jNvtej \n\n*Type menu* to go back to the Menu.\n*Type back* to go back.";
  var msg_webinar =
    "Sorry currently there are no webinar taking place. \n\n*Type menu* to go back to the Menu.";
  var msg_webinarDetails = `Yayy! We would be happy to host you in our next webinar.🤗\n\nHere are the details of the next webinar:\n\n*Topic:* ${webinar_details.topic}\n\n*Speaker:* ${webinar_details.speaker}\n\n*Timings:* ${webinar_details.timings}\n\n*Registration link:* ${webinar_details.link}\n\n*Type menu* to go back to the Menu.\n*Type back* to go back.`;
  //   var msg_knowledge =
  //     "Upskilling and continuous knowledge enhancement are essential in today's competitive world.\nWorry not, we are here to your rescue.🤩\n\nCheck out our bite-sized courses that you can indulge in on the go.\n\n*Type 1* to access content around *different niches*📑 \n*Type 2* to access *educational content* around entrepreneurship😎\n\n Type *back* to go back.";
  var msg_knowledge =
    "That’s like a champ!😉\n\nEntrepreneurship is all about learning and upskilling yourself. We support your hustle!🤝🏻\n\nWhat would you like to explore?\n\n*Type 1* to access eBooks and book summaries📚\n\n*Type 2* to access video playlists📽️\n\n*Type 3* to access professional certifications & courses🏅";
  var msg_ebookAndbooksSummaries =
    "Super! Choose a category to receive eBooks:\n\n*Type 1* for Startup Essentials📋\n\n*Type 2* for Entrepreneurial Mindset🧠\n\n*Type 3* for Leadership and Management🧑🏻‍💼\n\n*Type 4* for Marketing and Branding📢\n\n*Type 5* for Financial Management💸\n\n*Type 6* for Sales and Customer Relations👥\n\n*Type 7* for Technology and Innovation💡\n\n*Type 8* for Legal and Regulatory Compliance✒️\n\n*Type 9* for Scaling and Growth📈\n\n*Type 10* for Social Impact and Sustainability🌱";
  var msg_videoPlaylist =
    "Sure then! Choose a category to access video playlists:\n\n*Type 1* for Startup Essentials📋\n\n*Type 2* for Entrepreneurial Mindset🧠\n\n*Type 3* for Leadership and Management🧑🏻‍💼\n\n*Type 4* for Marketing and Branding📢\n\n*Type 5* for Financial Management💸\n\n*Type 6* for Sales and Customer Relations👥\n\n*Type 7* for Technology and Innovation💡\n\n*Type 8* for Legal and Regulatory Compliance✒️\n\n*Type 9* for Scaling and Growth📈\n\n*Type 10* for Social Impact and Sustainability🌱";
  var msg_coursesAndCertifications =
    "Super! Choose a category to receive courses & certifications:\n\n*Type 1* for Startup Essentials📋\n\n*Type 2* for Entrepreneurial Mindset🧠\n\n*Type 3* for Leadership and Management🧑🏻‍💼\n\n*Type 4* for Marketing and Branding📢\n\n*Type 5* for Financial Management💸\n\n*Type 6* for Sales and Customer Relations👥\n\n*Type 7* for Technology and Innovation💡\n\n*Type 8* for Legal and Regulatory Compliance✒️\n\n*Type 9* for Scaling and Growth📈\nType 10 for Social Impact and Sustainability🌱";

  var msg_knowledgecontent =
    "Tell us your interest areas. What would you like to learn more about?🤔\nPick your interest area(s).\n\n1. Idea validation🤓\n2. Business collaterals📑\n3. Funding options💸\n4. Startup Financing💰\n5. Growth strategies📈\n6. Startup scaling📊\n7. Incubators & Accelerators🏢\n8. Mentorship🧑‍🏫\n9. Product Development🛠️\n10. Customer Acquisition👥 \n\n*Type menu* to go back to the Menu.\n*Type back* to go back.";
  var msg_knowledgeYt =
    "Smart choice!😎\n*There you go:* https://www.youtube.com/@YourStartupGuy \n\nBinge on some content that’s actually worth your time.🥳 \n\n*Type menu* to go back to the Menu.\n*Type back* to go back.";
  var msg_serviceProvider =
    "Sure thing!\nWe have many service providers listed on our platform.😋\n\nWhat kind of service(s) are you looking to avail?🤔\n\n*Type 1* if you’re looking for *legal* assistance📑\n*Type 2* if you’re looking for assistance with *accounting, taxation*, and/ or *audit*📊 \n*Type 3* if you’re looking for *technological* assistance🧑‍💻\n*Type 4* if you’re looking for assistance with creating *pitch decks, business plans,* and/ or *financial model*🗂️\n*Type 5* if you’re looking for assistance with *Marketing*📈 \n\n*Type menu* to go back to the Menu.\n*Type back* to go back.";
  var msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
    tsp.Namemsg_Journeyuwant
  }\n*Profile*: ${tsp.Linkedin ? tsp.Linkedin : tsp.Website}\n*Expertise*: ${
    tsp.Type
  }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;
  var msg_unavailable =
    "Ah, we are still working on this section!😶‍🌫️\nOur team will keep you posted & will ping you once we’re live! 😉 \n\n*Type menu* to go back to the Menu.";
  var msg_bie = "See you soon, Byeee... 👋";
  var msg_returnUserHi = `Hi ${name}, How can I assist you today? \n\nType menu to go to Menu.`;
  var msg_nomoresp =
    "Uh oh! We've run out of more options to showcase to you. \n\nFret not, our range of service providers is ever-expanding! You can check out & connect with new service providers in this domain very soon.🤗 \n\n*Type menu* to go back to the Menu.";
  var msg_spaces =
    "Great!\nNow select the *space* that resonates the most with you.😉\n\nType the number of Space that you wish to join: (For example- 11) 😋\n1. FinTech\n2. EdTech\n3. AgriTech\n4. FoodTech\n5. Ecommerce\n6. Logistics & Delivery\n7. Cleantech & Renewable Energy\n8. AI & ML\n9. Web 3.0\n10. FashionTech\n11. SpaceTech\n12. HealthTech\n13. Cybersecurity\n14. AR & VR\n15. Internet of Things(IOT)\n16. Biotech\n17. TravelTech\n18. Real Estate-Tech\n19. BeautyTech\n20. LegalTech\n21. HR-Tech\n22. Personal fitness Tech\n23. Waste Management Technologies\n24. Online Marketplaces\n25. CloudTech";
  var msg_Journeywant =
    "Got it!😉\n\nType in the number of offering that suits your needs the best and let us take care of the rest. 😋";
  var msg_stop =
    "Okay, you’ll no longer receive messages from Reverr. 🫡\n\nYou can type “Start” to initiate the chat again.🤗";
  var msg_connect =
    " Let's get on to finding some suitable connections.😉\nWho are you looking to connect with?🤔 Pick the numbers of the Spaces you’re looking to explore. \n\n(Example: 11,5,8)👀\n\n1.  FinTech\n2. EdTech\n3. AgriTech\n4. FoodTech\n5. Ecommerce\n6. Logistics & Delivery\n7. Cleantech & Renewable Energy\n8. AI & ML\n9. Web 3.0\n10. FashionTech\n11. SpaceTech\n12. HealthTech\n13. Cybersecurity\n14. AR & VR\n15. Internet of Things(IOT)\n16. Biotech\n17. TravelTech\n18. Real Estate-Tech\n19. BeautyTech\n20. LegalTech\n21. HR-Tech\n22. Personal fitness Tech\n23. Waste Management Technologies\n24. Online Marketplaces\n25. CloudTech\n\n*Type back* to go back.";
  var msg_shareProfile = `Super! We have found just the right person for you.😎\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu \n*Type back* to go back.`;
  var msg_shareRequests = `Here are your requests.👀\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;
  var msg_noMoreRequests =
    "Ah! We’ve run out of connection requests.😔\nStart Networking again by going to the menu.\n\n*Type menu* to go back to the Menu";
  var msg_shareResponses = `Here are your responses.👀\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more responses😉*\n*Type 2* to set up a *one-on-one networking* session😁\n\n*Type menu* to go back to the Menu `;
  var msg_noMoreResponses =
    "Ah! We’ve run out of connection responses.😔\nStart Networking again by going to the menu.\n\n*Type menu* to go back to the Menu";
  var msg_noMoreProfile =
    "Alas! We’ve run out of potential connections.😕\nTry checking out some other Spaces.🤔\n\n*Type menu* to go back to the Menu";
  var msg_1o1getUserType =
    "Noted!🫡\nBefore we move forward, who are you looking to connect with?🤔\n\n*Type 1* to connect with *founders*🧑🏻‍💼\n*Type 2* to connect with *professionals*🧑🏻‍🏫\n*Type 3* to connect with *both* 🤗";
  var msg_1o1askCalendly =
    "Alrighty!\nIn order to experience one-on-one networking, we would require your Calendly link.🔗👥\n\n*Type 1* to share your *Calendly link*🔗\n*Type 2* to learn how to *create* a Calendly link🛠️\n\nType *Menu* to go back to the Menu\nType *back* to go back.";
  var msg_1o1getCalendly = "Great!\nPlease share the link.😉";
  var msg_1o1confirmCalendly = `Your Calendly link is ${calendly} 🧐\n\n*Type 1* to *confirm* the link\n*Type 2* to *retry*`;
  var msg_1o1infoCalendly =
    "Don’t worry, we’ve got you!😋\n\nLearn how to *create a Calendly link* here: https://app.tango.us/app/workflow/Workflow-with-Calendly-and-Tango-80502116519548baac5887f161cd9119 \n\n*Type 1* to share your Calendly link🔗\nType *Menu* to go back to the Menu";
  var msg_1o1recievedCalendly =
    "Perfect!\nYou are now ready to experience one-on-one networking.😉\n\n*Type 1* to start seeing *suitable connections*.\nType *Menu* to go back to the Menu";
  var msg_1o1showintrest =
    "Great choice!🙌🏻\nWe have let them know that you’re interested in connecting.☺️\n\nWe will let you know once they accept your invitation to connect.😉\n\n*Type 1* to see *more connections*🧐\n\n*Type menu* to go back to the Menu ";
  var msg_1o1recRequest = `Hi, there!🤗\nWe’ve just got a connection request for you.💯\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\n*Type 1* if you’re *interested in connecting* one-on-one👥\n*Type 2* if you don’t find them a suitable match😔\n\n*Type menu* to go back to the Menu`;
  var msg_1o1sharedCalendly =
    "Great! We’ve shared your Calendly link with them.🥳\n\nKeep an eye on your calendar for all scheduled sessions.\n\nHappy networking!🎊🤗";
  var msg_1o1notIntrested =
    "No worries! \nYou can check out more networking opportunities.🤭\n\n*Type menu* to go back to the Menu";
  var msg_1o1reqRejected = `Your connection request was declined by 🫤\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nNo worries, we’re sure you’ll find more suitable connections!😌\n\n*Type menu* to go back to the menu!😉`;
  var msg_1o1reqAccepted = `Hello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSet up a one-on-one networking session here: ${currentProfile.calendly}`;
  var msg_1o1reqRejectedtemp = `Here are your responses.👀\nYour connection request was declined by 🫤\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nNo worries, we’re sure you’ll find more suitable connections!😌\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;
  var msg_1o1reqAcceptedtemp = `Here are your responses.👀\nHello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSet up a one-on-one networking session here: ${currentProfile.calendly}\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

  //knowledge msgs
  var msg_ideaValidation =
    "*Idea Validation*:📝\n\n1. How to Test Your Startup Idea (https://www.youtube.com/watch?v=J4e0OogLpOo) (YouTube Video)\n2. The Ultimate Guide to Idea Validation for Startups (https://www.startups.com/library/expert-advice/idea-validation-guide) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_businessCollaterals =
    "*Business Collaterals*:🗂️\n\n1. Understanding Business Collateral (https://www.businessloans.com/guides/business-collateral/) (Article)\n2. Business Collateral: What It Is and How It Works (https://www.nav.com/blog/business-collateral-422422/) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_fundingOptions =
    "*Funding Options*:💸\n\n1. Startup Funding Options Explained\n(https://www.youtube.com/watch?v=7wvGmY4EQrE) (YouTube Video)\n2. A Comprehensive Guide to Startup Funding (https://www.startups.com/library/expert-advice/startup-funding-guide) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_startupFinancing =
    "*Startup Financing*:💰\n\n1. Startup Financing: What You Need to Know (https://www.youtube.com/watch?v=vkGX6ziLuVU) (YouTube Video)\n2. A Beginner's Guide to Startup Financing (https://www.entrepreneur.com/article/324041) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_growthStrategies =
    "*Growth Strategies*:📈\n\n1. Strategies for Startup Growth (https://www.youtube.com/watch?v=9Vp8TJiIIOk) (YouTube Video)\n2. 10 Proven Strategies for Scaling Your Startup (https://www.startups.com/library/expert-advice/scaling-strategies) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_startupscaling =
    "*Startup Scaling*:📊\n\n1. Scaling Your Startup: Tips and Advice (https://www.youtube.com/watch?v=uxquHcYy5dU) (YouTube Video)\n2. The Art of Scaling: A Guide for Startups (https://www.startups.com/library/expert-advice/scaling-guide) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_incubators =
    "*Incubators & Accelerators*:🏢\n\n1. Startup Incubators vs. Accelerators Explained (https://www.youtube.com/watch?v=kxXauPPCYnE) (YouTube Video)\n2. How to Choose the Right Incubator or Accelerator (https://www.techstars.com/the-line/startup-basics/how-choose-right-incubator-or-accelerator-your-startup) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_mentorship =
    "*Mentorship*:🧑‍🏫\n\n1. The Power of Mentorship (https://www.youtube.com/watch?v=nfWgX4C3B0k) (YouTube Video)\n2. Why Mentorship is Essential for Your Career  (https://www.forbes.com/sites/janbruce/2021/11/01/why-mentorship-is-essential-for-your-career/?sh=29076e3d4300) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_productDvp =
    "*Product Development*:🛠️\n\n1. Product Development Process Explained (https://www.youtube.com/watch?v=2XebzSDxIKg) (YouTube Video)\n2. The Complete Guide to Product Development (https://www.startups.com/library/expert-advice/product-development-guide) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";
  var msg_customerAcq =
    "*Customer Acquisition*:👥\n\n1. Customer Acquisition Strategies for Startups (https://www.youtube.com/watch?v=6T5VXULd9yI) (YouTube Video)\n2. The Ultimate Guide to Customer Acquisition (https://www.startups.com/library/expert-advice/customer-acquisition-guide) (Article) \n\nType 1 to change category. \nType menu to go back to menu.";

  var msg_hello =
    "Welcome to Reverr 😉. We hope you are doing great.\n\nReverr aims to assist startups by being a platform that connects startup founders to mentors, investors, and service providers while providing knowledge and networking opportunities.🎯\n\nTell us about yourself and allow us to cater to all your needs.\n*Type 1* if you’re a “ *Startup Founder* ”🧑‍💻\n*Type 2* if you’re a “ *Professional* ” 🧑🏻‍💼";
  var msg_intiate =
    "Hello, there!\nWe welcome you to Reverr, a Startup India-recognized startup platform enabling and empowering entrepreneurs and redesigning the startup ecosystem.🏅🌐\n\nWith over 5000+ startup founders, 150+ business mentors, 50+ VCs, and 20+ ecosystem partners, Reverr welcomes you aboard as an essential addition to our platform.😉\n\nTo move forward, we’ll now onboard you and understand your preferences.💁🏻‍♀️\n\n*Type 1* to initiate *onboarding*🧐";
  var msg_askName =
    "We are happy that you're here.🤗\n\nHow should we address you? Please type in your *full name*.";
  var msg_howtoProceed =
    "Got it!😉\nAnd finally, how do you wish to proceed from here?🤔\n\n*Type 1* to *Build with Reverr*, where we take you on an *entrepreneurial journey* from Idea Validation to making big billions $!💡💰\n\n*Type 2* to *pave your way* and explore *Reverr’s core offerings* like Fundraising, Networking, Service Providers, and Knowledge!💯🔥\n\nYou can switch between these modes later on by typing “ *BWR* ” and/ or “ *Explore* ”.💯";
  var msg_startupStage =
    "That sounds good.🤩\nNow pick what resonates with you the most.\n\n*Type 1* if you have an *Idea* and wish to execute it.🗣️\n*Type 2* if you are building the *MVP* and have *early traction* 😎\n*Type 3* if you are generating *Revenue* and wish to *Scale* further🤑";
  var msg_IdeaStage =
    "Perfect!\nYour profiling is complete.💯\n\n*Type 1* to initiate the journey for *Idea-stage Founders*.💡";
  var msg_MvpStage =
    "Perfect!\nYour profiling is complete.💯\n\n*Type 1* to initiate the journey for MVP-stage Founders.🛠️";
  var msg_RevenueStage =
    "Perfect!\nYour profiling is complete.💯\n\n*Type 1* to initiate the journey for Revenue-stage Founders.💰";
  var msg_fwdtoMyra =
    "Hurray! It’s time.🎉\n\nWe are now forwarding you to *Myra*, Reverr’s agent who will keep in touch with you and will ensure a seamless experience for you here.🤗";
  var msg_myraback =
    "Uh oh! That didn't work.🙁\nMyra will get in touch with you soon.";
  var msg_professionalStartupBites =
    "understood.💯\nWe have noted down your preferences.\n\nWe are now forwarding you to Inaya, Reverr’s agent who will keep in touch with you and will ensure a seamless experience for you here.🤗\n\nType *menu* to go back to the main menu.";
  var msg_confirmSpace = "*Type 1* to confirm the same\n*Type 0* to retry";
  var msg_startUpbites =
    "Keeping up with the latest happenings is always the right thing to do!📰😎\n\n You have successfully subscribed to weekly Startup Bites. The latest, crisp news will land in your inbox super soon.📬\n\nType menu to back to menu";

  var msg_IdeaValidationtoEnterprise =
    "super choice!😉\n\n*Build with Reverr* is a guided journey where we take you on an entrepreneurial pursuit from *Idea Validation to Enterprise*.💡🏢\n\nWe assist you on this journey and act as a guide who hand-holds you at every step and ensures you fulfil your entrepreneurial aspirations.🤗\n\n*Type 1* to *join the waitlist* (For serious aspirants only)⏳\n\nType *back* to opt-out and go to the previous menu";

  var msg_ideaValidationtoEnterenterpriseResponseMessage =
    "Welcome aboard, champ.😉\n\nWe are excited to go on an entrepreneurial journey and watch you build a solution that caters to millions of users.🎉\n\n*You’ve been waitlisted*. We’ll share the next steps soon.💯\n\nType menu to go to menu";

  const sendMsg = async () => {
    // console.log("stop",stopMsg)
    if (stopMsg == false) {
      const { data } = await sendMessage(messageInput);
      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage,
            }),
          });
        lastMsgNotEmpty = true;
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage,
            }),
          });
      }
      response.json({
        status: "success",
      });
    } else {
      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: Date.now(),
              message: null,
              date: Timestamp.now(),
              usermessage,
            }),
          });
        lastMsgNotEmpty = true;
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: Date.now(),
              message: null,
              date: Timestamp.now(),
              usermessage,
            }),
          });
      }
      response.json({
        status: "success",
      });
    }
  };
  const noResponseSendMsg = async (sendto, messageInput) => {
    // console.log("stop",stopMsg)
    if (stopMsg == false) {
      const { data } = await sendMessage(messageInput);
      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${sendto}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${sendto}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${sendto}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage,
            }),
          });
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${sendto}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: data.messages[0].id,
              message: JSON.parse(messageInput),
              date: Timestamp.now(),
              usermessage,
            }),
          });
      }
    } else {
      const userexist = await db
        .collection("WhatsappMessages")
        .doc(`${sendto}`)
        .get();
      if (!userexist.exists) {
        console.log("no doc");
        await db
          .collection("WhatsappMessages")
          .doc(`${sendto}`)
          .set({ exists: "true", number: messageFrom });
        await db
          .collection("WhatsappMessages")
          .doc(`${sendto}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: Date.now(),
              message: null,
              date: Timestamp.now(),
              usermessage,
            }),
          });
      } else {
        await db
          .collection("WhatsappMessages")
          .doc(`${sendto}`)
          .update({
            messages: FieldValue.arrayUnion({
              status: "success",
              messageId: Date.now(),
              message: null,
              date: Timestamp.now(),
              usermessage,
            }),
          });
      }
    }
  };
  const noResponseSendTemplate = async (messageFrom, templateName) => {
    messageInput = messageHelper.getTemplateTextInput(
      messageFrom,
      templateName
    );
    // console.log(messageFrom)
    const { data } = await sendMessage(messageInput);

    const userexist = await db
      .collection("WhatsappMessages")
      .doc(`${messageFrom}`)
      .get();
    if (!userexist.exists) {
      console.log("no doc");
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .set({ exists: "true", number: messageFrom });
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    } else {
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({
          messages: FieldValue.arrayUnion({
            status: "success",
            messageId: data.messages[0].id,
            message: JSON.parse(messageInput),
            date: Timestamp.now(),
            usermessage: null,
          }),
        });
    }
  };
  const resendLastToLastMsg = () => {
    var ltlMsg = userChat.messages[userChat.messages.length - 2];
    if (ltlMsg.message.type == "template") {
      var ltlMsgSend = ltlMsg.message.template.name;

      messageInput = messageHelper.getTemplateTextInput(
        messageFrom,
        ltlMsgSend
      );

      sendMsg();
    } else {
      var ltlMsgSend = ltlMsg.message.text.body;

      messageInput = messageHelper.getCustomTextInput(messageFrom, ltlMsgSend);

      sendMsg();
    }
  };

  const getnumbers = (inputString) => {
    const numbers = inputString.match(/\d+/g);
    if (numbers == null) {
      return [];
    }
    const numbersArray = numbers.map(Number);
    return numbersArray;
  };

  const getProfile = async (intersetedSpaces, cisidx) => {
    const usersRef = db.collection("WhatsappMessages");
    const snapshot = await usersRef.get();

    var users = [];

    snapshot.forEach((doc) => {
      var data = { id: doc.id, ...doc.data() };
      users.push(data);
    });

    var filteredUsers = filterCalendlyUsers(
      filterCurrentUser(filterUsersBySpace(users, intersetedSpaces))
    );

    if (userChat.connectWith !== "both") {
      filteredUsers = filterUserType(filteredUsers, userChat.connectWith);
    }

    if (filteredUsers.length == 0) {
      return null;
    } else {
      return filteredUsers[cisidx];
    }
  };
  function filterUsersBySpace(users, spaceArray) {
    if (!Array.isArray(spaceArray)) {
      console.error("Space array is not defined or not an array");
      return [];
    }
    return users.filter((user) => spaceArray.includes(user.space));
  }

  function filterCurrentUser(users) {
    return users.filter((user) => user.id != messageFrom);
  }
  function filterUserType(users, userType) {
    return users.filter((user) => user.userType == userType);
  }
  function filterCalendlyUsers(users) {
    return users.filter(
      (user) => user.calendly != undefined && user.calendly != ""
    );
  }

  const getSpaces = (numbers) => {
    const techCategories = [
      "FinTech",
      "EdTech",
      "AgriTech",
      "FoodTech",
      "Ecommerce",
      "Logistics & Delivery",
      "Cleantech & Renewable Energy",
      "Ai & ML",
      "Web 3.0",
      "FashionTech",
      "SpaceTech",
      "HealthTech",
      "Cybersecurity",
      "AR & VR",
      "Internet of Things (IoT)",
      "Biotech",
      "TravelTech",
      "Real Estate-Tech",
      "BeautyTech",
      "LegalTech",
      "HR-Tech",
      "Personal Fitness Tech",
      "Waste Management Technologies",
      "Online Marketplaces",
      "CloudTech",
    ];

    const mappedCategories = numbers.map((number) => {
      const index = number - 1; // Adjust for 0-based indexing
      if (index >= 0 && index < techCategories.length) {
        return techCategories[index];
      }
      return "NotFound";
    });

    return mappedCategories;
  };

  const msgMatcher = (lastMsgSend) => {
    console.log(lastMsgSend);
    var result = "not found";
    if (lastMsgSend == null) {
      result = "not found";
    } else if (lastMsgSend == msg_hello) {
      result = "msg_hello";
    } else if (lastMsgSend == msg_askName) {
      result = "msg_askName";
    } else if (lastMsgSend == msg_confirmName) {
      result = "msg_confirmName";
    } else if (lastMsgSend == msg_askLinkedin) {
      result = "msg_askLinkedin";
    } else if (lastMsgSend == msg_confirmLinkedin) {
      result = "msg_confirmLinkedin";
    } else if (lastMsgSend == msg_askbio) {
      result = "msg_askbio";
    } else if (lastMsgSend == msg_confirmBio) {
      result = "msg_confirmBio";
    } else if (lastMsgSend == msg_askStage) {
      result = "msg_askStage";
    } else if (lastMsgSend == msg_askOffering) {
      result = "msg_askOffering";
    } else if (lastMsgSend == msg_dontUnderstand) {
      result = "msg_dontUnderstand";
    } else if (lastMsgSend == msg_fundingForm) {
      result = "msg_fundingForm";
    } else if (lastMsgSend == msg_fundingFormFilled) {
      result = "msg_fundingFormFilled";
    } else if (lastMsgSend == msg_professionalOfferings) {
      result = "msg_professionalOfferings";
    } else if (lastMsgSend == msg_createProfile) {
      result = "msg_createProfile";
    } else if (lastMsgSend == msg_errorProfile) {
      result = "msg_errorProfile";
    } else if (lastMsgSend == msg_professionalNetworking) {
      result = "msg_professionalNetworking";
    } else if (lastMsgSend == msg_networkingOptions) {
      result = "msg_networkingOptions";
    } else if (lastMsgSend == msg_rbrRegisterLink) {
      result = "msg_rbrRegisterLink";
    } else if (lastMsgSend == msg_reverrSpacesCommunity) {
      result = "msg_reverrSpacesCommunity";
    } else if (lastMsgSend == msg_webinar) {
      result = "msg_webinar";
    } else if (lastMsgSend == msg_knowledge) {
      result = "msg_knowledge";
    } else if (lastMsgSend == msg_knowledgecontent) {
      result = "msg_knowledgecontent";
    } else if (lastMsgSend == msg_knowledgeYt) {
      result = "msg_knowledgeYt";
    } else if (lastMsgSend == msg_serviceProvider) {
      result = "msg_serviceProvider";
    } else if (lastMsgSend == msg_moreSp) {
      result = "msg_moreSp";
    } else if (lastMsgSend == msg_unavailable) {
      result = "msg_unavailable";
    } else if (lastMsgSend == msg_rbrRegistered) {
      result = "msg_rbrRegistered";
    } else if (lastMsgSend == msg_bie) {
      result = "msg_bie";
    } else if (lastMsgSend == msg_ideaValidation) {
      result = "msg_ideaValidation";
    } else if (lastMsgSend == msg_businessCollaterals) {
      result = "msg_businessCollaterals";
    } else if (lastMsgSend == msg_fundingOptions) {
      result = "msg_fundingOptions";
    } else if (lastMsgSend == msg_startupFinancing) {
      result = "msg_startupFinancing";
    } else if (lastMsgSend == msg_growthStrategies) {
      result = "msg_growthStrategies";
    } else if (lastMsgSend == msg_startupscaling) {
      result = "msg_startupscaling";
    } else if (lastMsgSend == msg_incubators) {
      result = "msg_incubators";
    } else if (lastMsgSend == msg_mentorship) {
      result = "msg_mentorship";
    } else if (lastMsgSend == msg_productDvp) {
      result = "msg_productDvp";
    } else if (lastMsgSend == msg_customerAcq) {
      result = "msg_customerAcq";
    } else if (lastMsgSend == msg_webinarDetails) {
      result = "msg_webinarDetails";
    } else if (lastMsgSend == msg_nomoresp) {
      result = "msg_nomoresp";
    } else if (lastMsgSend[0] == "U" && lastMsgSend[1] == "n") {
      result = "msg_moreSp";
    } else if (lastMsgSend == msg_spaces) {
      result = "msg_spaces";
    } else if (lastMsgSend == msg_stop) {
      result = "msg_stop";
    } else if (lastMsgSend == msg_connect) {
      result = "msg_connect";
    } else if (lastMsgSend[0] == "S" && lastMsgSend[1] == "u") {
      result = "msg_shareProfile";
    } else if (lastMsgSend == msg_shareProfile) {
      result = "msg_shareProfile";
    } else if (lastMsgSend == msg_1o1getUserType) {
      result = "msg_1o1getUserType";
    } else if (lastMsgSend == msg_1o1askCalendly) {
      result = "msg_1o1askCalendly";
    } else if (lastMsgSend == msg_1o1getCalendly) {
      result = "msg_1o1getCalendly";
    } else if (
      lastMsgSend[0] == "Y" &&
      lastMsgSend[1] == "o" &&
      lastMsgSend[2] == "u" &&
      lastMsgSend[3] == "r" &&
      lastMsgSend[4] == " " &&
      lastMsgSend[5] == "C"
    ) {
      result = "msg_1o1confirmCalendly";
    } else if (lastMsgSend == msg_1o1infoCalendly) {
      result = "msg_1o1infoCalendly";
    } else if (lastMsgSend == msg_1o1recievedCalendly) {
      result = "msg_1o1recievedCalendly";
    } else if (lastMsgSend == msg_1o1showintrest) {
      result = "msg_1o1showintrest";
    } else if (lastMsgSend.substring(0, 10) == "Hi, there!") {
      result = "msg_1o1recRequest";
    } else if (lastMsgSend.substring(0, 13) == "Hello, again!") {
      result = "msg_1o1reqAccepted";
    } else if (lastMsgSend.substring(0, 23) == "Your connection request") {
      result = "msg_1o1reqRejected";
    } else if (lastMsgSend == msg_1o1sharedCalendly) {
      result = "msg_1o1sharedCalendly";
    } else if (lastMsgSend == "networking_requests") {
      result = "networking_requests";
    } else if (lastMsgSend.substring(0, 23) == "Here are your requests.") {
      result = "msg_shareRequests";
    } else if (lastMsgSend == msg_noMoreRequests) {
      result = "msg_noMoreRequests";
    } else if (lastMsgSend.substring(0, 24) == "Here are your responses.") {
      result = "msg_shareResponses";
    } else if (lastMsgSend == msg_noMoreResponses) {
      result = "msg_noMoreResponses";
    } else if (lastMsgSend == "networking_responses") {
      result = "networking_responses";
    } else if (lastMsgSend == msg_intiate) {
      result = "msg_intiate";
    } else if (lastMsgSend == msg_howtoProceed) {
      result = "msg_howtoProceed";
    } else if (lastMsgSend == msg_startupStage) {
      result = "msg_startupStage";
    } else if (lastMsgSend == msg_IdeaStage) {
      result = "msg_IdeaStage";
    } else if (lastMsgSend == msg_MvpStage) {
      result = "msg_MvpStage";
    } else if (lastMsgSend == msg_RevenueStage) {
      result = "msg_RevenueStage";
    } else if (lastMsgSend == msg_fwdtoMyra) {
      result = "msg_fwdtoMyra";
    } else if (lastMsgSend == msg_myraback) {
      result = "msg_myraback";
    } else if (lastMsgSend == msg_professionalStartupBites) {
      result = "msg_professionalStartupBites";
    } else if (lastMsgSend == msg_confirmSpace) {
      result = "msg_confirmSpace";
    } else if (lastMsgSend == msg_startUpbites) {
      result = "msg_startUpbites";
    } else if (lastMsgSend == msg_Networkingevents) {
      result = "msg_Networkingevents";
    } else if (lastMsgSend == msg_ebookAndbooksSummaries) {
      result = "msg_ebookAndBooksSummaries";
    } else if (lastMsgSend == msg_videoPlaylist) {
      result = "msg_videoPlaylist";
    } else if (lastMsgSend == msg_coursesAndCertifications) {
      result = "msg_coursesAndCertifications";
    } else if (lastMsgSend == msg_IdeaValidationtoEnterprise) {
      result = "msg_IdeaValidationtoEnterprise";
    }
    console.log(result);
    return result;
  };

  if (lastMsgNotEmpty) {
    var res = msgMatcher(lastMsgSend);
    if (
      ["hi", "hii", "hello", "hie", "hey"].includes(messageText.toLowerCase())
    ) {
      if (userChat.profile == true) {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_returnUserHi
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_intiate
        );
        sendMsg();
      }
    } else if (["explore"].includes(messageText.toLowerCase())) {
      var path = "DIY";
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ path });
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_askOffering
      );
      sendMsg();
    } else if (["bwr"].includes(messageText.toLowerCase())) {
      var path = "BWR";
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ path });
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_startupStage
      );
      sendMsg();
    } else if (
      ["bie", "bye", "byeee", "byee", "biee", "ba bie", "ba bye"].includes(
        messageText.toLowerCase()
      )
    ) {
      messageInput = messageHelper.getCustomTextInput(messageFrom, msg_bie);
      sendMsg();
    } else if (["stop"].includes(messageText.toLowerCase())) {
      var stop = true;
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ stop });
      messageInput = messageHelper.getCustomTextInput(messageFrom, msg_stop);
      sendMsg();
    } else if (["start"].includes(messageText.toLowerCase())) {
      var stop = false;
      stopMsg = false;
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ stop });
      if (userChat.profile == true) {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_returnUserHi
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(messageFrom, msg_hello);
        sendMsg();
      }
    } else if (["menu"].includes(messageText.toLowerCase())) {
      if (userChat.profile == true) {
        if (userChat.userType == "founder") {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_askOffering
          );
          sendMsg();
        } else if (userChat.userType == "professional") {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_professionalOfferings
          );
          sendMsg();
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_errorProfile
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_createProfile
        );
        sendMsg();
      }
    } else if (
      ["show request", "show requests", "showrequest", "show_request"].includes(
        messageText.toLowerCase()
      )
    ) {
      //check if user has requesting user
      if (userChat.requesting && userChat.requesting.length >= 1) {
        //get details of requesting user
        var req = userChat.requesting[0];
        var reqdoc = await db
          .collection("WhatsappMessages")
          .doc(`${req}`)
          .get();
        var requser = reqdoc.data();

        //fitting requser data into msg
        msg_shareRequests = `Here are your requests.👀\n\n*Name:* ${requser.name}\n*Linkedin:* ${requser.linkedin}\n*About:* ${requser.bio}\n*Space:* ${requser.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ sharereqidx: 0 });

        // //update requesting of curr user
        // var requesting = userChat.requesting.filter(item => item!=req)
        // await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({requesting});

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_shareRequests
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_noMoreRequests
        );
        sendMsg();
      }
    } else if (
      [
        "show response",
        "show responses",
        "showresponses",
        "show_response",
      ].includes(messageText.toLowerCase())
    ) {
      //check if user has requesting user
      if (userChat.res && userChat.res.length >= 1) {
        var reslist = userChat.res;
        var residx = 0;
        var currres = reslist[residx];
        var resdoc = await db
          .collection("WhatsappMessages")
          .doc(`${currres.id}`)
          .get();
        var resuser = resdoc.data();
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ residx });

        if (currres.accepted) {
          msg_1o1reqAcceptedtemp = `Here are your responses.👀\nHello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${resuser.name}\n*Linkedin:* ${resuser.linkedin}\n*About:* ${resuser.bio}\n*Space:* ${resuser.space}\n\nSet up a one-on-one networking session here: ${resuser.calendly}\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_1o1reqAcceptedtemp
          );
          sendMsg();
        } else {
          msg_1o1reqRejectedtemp = `Here are your responses.👀\nYour connection request was declined by 🫤\n\n*Name:* ${resuser.name}\n*Linkedin:* ${resuser.linkedin}\n*About:* ${resuser.bio}\n*Space:* ${resuser.space}\n\nNo worries, we’re sure you’ll find more suitable connections!😌\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_1o1reqRejectedtemp
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_noMoreResponses
        );
        sendMsg();
      }
    } else if (
      ["back", "return", "prev", "backk"].includes(messageText.toLowerCase())
    ) {
      if (userChat.path == "BWR") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_myraback
        );
        sendMsg();
        return;
      }
      if (
        lastMsgSend == msg_fundingForm ||
        lastMsgSend == msg_networkingOptions ||
        lastMsgSend == msg_knowledge ||
        lastMsgSend == msg_serviceProvider ||
        lastMsgSend == msg_professionalNetworking
      ) {
        if (userChat.userType == "professional") {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_professionalOfferings
          );
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_askOffering
          );
        }

        sendMsg();
      } else if (userChat.currentNeed) {
        if (
          userChat.currentNeed ==
          "Get funding from VCs, Angels, and relevant Investors"
        ) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_askOffering
          );
          sendMsg();
        } else if (
          userChat.currentNeed == "Discover networking opportunities"
        ) {
          if (userChat.userType == "founder") {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_networkingOptions
            );
          } else {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_professionalNetworking
            );
          }

          sendMsg();
        } else if (
          userChat.currentNeed == "Seek knowledge in bite-sized portions"
        ) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_knowledge
          );
          sendMsg();
        } else if (
          userChat.currentNeed ==
          "Connect with service providers for assistance"
        ) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_serviceProvider
          );
          sendMsg();
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_dontUnderstand
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_hello") {
      console.log("f1");
      if (usermessage == "1") {
        var userType = "founder";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ userType });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askName
        );
        sendMsg();
      } else if (usermessage == "2") {
        var userType = "professional";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ userType });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askName
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_intiate") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(messageFrom, msg_hello);
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_askName") {
      console.log("f2");
      name = usermessage;
      msg_confirmName = msg_confirmName1 + name + msg_confirmName3;
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ name });
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_confirmName
      );
      sendMsg();
    } else if (res == "msg_confirmName") {
      console.log("f3");
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askLinkedin
        );
        sendMsg();
      } else if (usermessage == "0") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askName
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_askLinkedin") {
      console.log("f4");
      linkedin = usermessage;
      msg_confirmLinkedin = `Your Linkedin URL is ${linkedin} \n*Type 1* to *confirm* \n*Type 0* to *retry*`;
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ linkedin });
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_confirmLinkedin
      );
      sendMsg();
    } else if (res == "msg_confirmLinkedin") {
      console.log("f5");
      if (usermessage == "1") {
		var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
		  
		  if (userChat.userType == "founder") {
			messageInput = messageHelper.getCustomTextInput(
			  messageFrom,
			  msg_askOffering
			);
			sendMsg();
		  } else if (userChat.userType == "professional") {
			messageInput = messageHelper.getCustomTextInput(
			  messageFrom,
			  msg_professionalOfferings
			);
			sendMsg();
		  }
      } else if (usermessage == "0") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askLinkedin
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_askbio") {
      console.log("f6");
      bio = usermessage;
      msg_confirmBio = `${bio} , is this correct? \n*Type 1* to *confirm* \n*Type 0* to *retry*`;
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ bio });
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_confirmBio
      );
      sendMsg();
    } else if (res == "msg_confirmBio") {
      console.log("f7");
      if (usermessage == "1") {
        if (userChat.userType == "founder") {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_howtoProceed
          );
        } else if (userChat.userType == "professional") {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_professionalOfferings
          );
          var profile = true;
          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({ profile });
        }
        sendMsg();
      } else if (usermessage == "0") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askbio
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_howtoProceed") {
      if (usermessage == "1") {
        var path = "BWR";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ path });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_startupStage
        );
        sendMsg();
      } else if (usermessage == "2") {
        var path = "DIY";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ path });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askOffering
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_startupStage") {
      if (usermessage == "1") {
        var stage = "Idea";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage, profile });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_IdeaStage
        );
        sendMsg();
      } else if (usermessage == "2") {
        var stage = "MVP";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage, profile });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_MvpStage
        );
        sendMsg();
      } else if (usermessage == "3") {
        var stage = "Revenue";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage, profile });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_RevenueStage
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_IdeaStage") {
      if (usermessage == "1") {
        var bwrNeed = "validate idea";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "2") {
        var bwrNeed = "Mentors";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "3") {
        var bwrNeed = "Knowledge";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "4") {
        var bwrNeed = "Networking opportunities";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "5") {
        var bwrNeed = "Startup Bites";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_MvpStage") {
      if (usermessage == "1") {
        var bwrNeed = "*Go-to-Market Strategy";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "2") {
        var bwrNeed = "Service Providers";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "3") {
        var bwrNeed = "Knowledge";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "4") {
        var bwrNeed = "Networking opportunities";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "5") {
        var bwrNeed = "Funds & Scale";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "6") {
        var bwrNeed = "Startup Bites";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_RevenueStage") {
      if (usermessage == "1") {
        var bwrNeed = "Funds & Scale";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "2") {
        var bwrNeed = "Networking opportunities";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "3") {
        var bwrNeed = "Service Providers";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "4") {
        var bwrNeed = "Knowledge";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else if (usermessage == "5") {
        var bwrNeed = "Startup Bites";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ bwrNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fwdtoMyra
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_askStage") {
      console.log("f8");
      if (usermessage == "1") {
        var stage = "have an idea and wish to execute it.🗣️";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askOffering
        );
        sendMsg();
      } else if (usermessage == "2") {
        var stage = "are running a successful startup 😎";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askOffering
        );
        sendMsg();
      } else if (usermessage == "3") {
        var stage = "have an idea but lack the necessary resources/ guidance🫣";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askOffering
        );
        sendMsg();
      } else if (usermessage == "4") {
        var stage =
          "are running a startup and wish to grow & expand it further🤑";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askOffering
        );
        sendMsg();
      } else if (usermessage == "5") {
        var stage = "are exploring your options 🤔";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ stage });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askOffering
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_askOffering") {
      console.log("f9");
      if (usermessage == "1") {
        var currentNeed =
          "Get funding from VCs, Angels, and relevant Investors";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fundingForm
        );
        sendMsg();
      } else if (usermessage == "2") {
        var currentNeed = "Discover networking opportunities";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_networkingOptions
        );
        sendMsg();
      } else if (usermessage == "3") {
        var currentNeed = "Seek knowledge in bite-sized portions";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_knowledge
        );
        sendMsg();
      } else if (usermessage == "4") {
        var currentNeed = "Connect with service providers for assistance";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_serviceProvider
        );
        sendMsg();
      } else if (usermessage == "5") {
        var currentNeed = "StartUp bites";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_startUpbites
        );
        sendMsg();
      } else if (usermessage == "6") {
        var currentNeed = "Idea validation to Enterprise";
        var profile = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ profile });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          //   msg_startUpbites
          msg_IdeaValidationtoEnterprise
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_dontUnderstand") {
      console.log("f10");
      if (usermessage == "1") {
        resendLastToLastMsg(); // Resend last to last msg
      }
    } else if (res == "msg_fundingForm") {
      if (usermessage == "1") {
        var fundingForm = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ fundingForm });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_fundingFormFilled
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_networkingOptions") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          //   msg_rbrRegisterLink
          msg_Networkingevents
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_reverrSpacesCommunity
        );
        sendMsg();
      } else if (usermessage == "3") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_webinarDetails
        );
        sendMsg();
        //   } else if (usermessage == "4") {
        //     messageInput = messageHelper.getCustomTextInput(
        //       messageFrom,
        //       msg_connect
        //     );
        //     sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_Networkingevents") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_MayraReponse
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          //
          msg_MayraReponse
          //   msg_NetworkingeventsReponse
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_rbrRegisterLink") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_rbrRegistered
        );
        sendMsg();
      }
    } else if (res == "msg_knowledge") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_knowledgecontent
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_knowledgeYt
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_IdeaValidationtoEnterprise") {
      if (usermessage == "1") {
        var userlist;
        var updatelist = true;
        var waitlistBWR = true;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ waitlistBWR });
        const data = await db.collection("meta").doc(`waitlistBWR`).get();
        if (data.exists) {
          userlist = data.data().user;
          if (!userlist.includes(messageFrom)) {
            userlist.push(messageFrom);
          } else {
            updatelist = false;
          }
        } else {
          userlist = [messageFrom];
        }
        if (updatelist) {
          await db
            .collection("meta")
            .doc(`waitlistBWR`)
            .update({ user: userlist });
        }
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_ideaValidationtoEnterenterpriseResponseMessage
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_serviceProvider") {
      if (usermessage == "1") {
        var csp = "1";
        var cspidx = 0;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ csp, cspidx });

        tsp = sp1[cspidx];

        msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
          tsp.Name
        }\n*Profile*: ${
          tsp.Linkedin ? tsp.Linkedin : tsp.Website
        }\n*Expertise*: ${
          tsp.Type
        }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_moreSp
        );
        sendMsg();
      } else if (usermessage == "2") {
        var csp = "2";
        var cspidx = 0;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ csp, cspidx });

        tsp = sp2[cspidx];
        msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
          tsp.Name
        }\n*Profile*: ${
          tsp.Linkedin ? tsp.Linkedin : tsp.Website
        }\n*Expertise*: ${
          tsp.Type
        }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_moreSp
        );
        sendMsg();
      } else if (usermessage == "3") {
        var csp = "3";
        var cspidx = 0;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ csp, cspidx });

        tsp = sp3[cspidx];
        msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
          tsp.Name
        }\n*Profile*: ${
          tsp.Linkedin ? tsp.Linkedin : tsp.Website
        }\n*Expertise*: ${
          tsp.Type
        }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_moreSp
        );
        sendMsg();
      } else if (usermessage == "4") {
        var csp = "4";
        var cspidx = 0;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ csp, cspidx });

        tsp = sp4[cspidx];
        msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
          tsp.Name
        }\n*Profile*: ${
          tsp.Linkedin ? tsp.Linkedin : tsp.Website
        }\n*Expertise*: ${
          tsp.Type
        }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_moreSp
        );
        sendMsg();
      } else if (usermessage == "5") {
        var csp = "5";
        var cspidx = 0;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ csp, cspidx });

        tsp = sp5[cspidx];
        msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
          tsp.Name
        }\n*Profile*: ${
          tsp.Linkedin ? tsp.Linkedin : tsp.Website
        }\n*Expertise*: ${
          tsp.Type
        }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_moreSp
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_moreSp") {
      if (usermessage == "1") {
        var csp = userChat.csp;
        var cspidx = userChat.cspidx;

        if (csp == "1") {
          cspidx = cspidx + 1;
          if (sp1.length - 1 < cspidx) {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_nomoresp
            );
            sendMsg();
          } else {
            await db
              .collection("WhatsappMessages")
              .doc(`${messageFrom}`)
              .update({ cspidx });

            tsp = sp1[cspidx];
            msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
              tsp.Name
            }\n*Profile*: ${
              tsp.Linkedin ? tsp.Linkedin : tsp.Website
            }\n*Expertise*: ${
              tsp.Type
            }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_moreSp
            );
            sendMsg();
          }
        } else if (csp == "2") {
          cspidx = cspidx + 1;
          if (sp2.length - 1 < cspidx) {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_nomoresp
            );
            sendMsg();
          } else {
            await db
              .collection("WhatsappMessages")
              .doc(`${messageFrom}`)
              .update({ cspidx });

            tsp = sp2[cspidx];
            msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
              tsp.Name
            }\n*Profile*: ${
              tsp.Linkedin ? tsp.Linkedin : tsp.Website
            }\n*Expertise*: ${
              tsp.Type
            }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_moreSp
            );
            sendMsg();
          }
        } else if (csp == "3") {
          cspidx = cspidx + 1;
          if (sp3.length - 1 < cspidx) {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_nomoresp
            );
            sendMsg();
          } else {
            await db
              .collection("WhatsappMessages")
              .doc(`${messageFrom}`)
              .update({ cspidx });

            tsp = sp3[cspidx];
            msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
              tsp.Name
            }\n*Profile*: ${
              tsp.Linkedin ? tsp.Linkedin : tsp.Website
            }\n*Expertise*: ${
              tsp.Type
            }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_moreSp
            );
            sendMsg();
          }
        } else if (csp == "4") {
          cspidx = cspidx + 1;
          if (sp4.length - 1 < cspidx) {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_nomoresp
            );
            sendMsg();
          } else {
            await db
              .collection("WhatsappMessages")
              .doc(`${messageFrom}`)
              .update({ cspidx });

            tsp = sp4[cspidx];
            msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
              tsp.Name
            }\n*Profile*: ${
              tsp.Linkedin ? tsp.Linkedin : tsp.Website
            }\n*Expertise*: ${
              tsp.Type
            }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_moreSp
            );
            sendMsg();
          }
        } else if (csp == "5") {
          cspidx = cspidx + 1;
          if (sp5.length - 1 < cspidx) {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_nomoresp
            );
            sendMsg();
          } else {
            await db
              .collection("WhatsappMessages")
              .doc(`${messageFrom}`)
              .update({ cspidx });

            tsp = sp5[cspidx];
            msg_moreSp = `Understood!😇\nHere are some *relevant service providers* who are listed on Reverr.\nCheck out their profile & feel free to connect with them.🤗\n\n*Company name*: ${
              tsp.Name
            }\n*Profile*: ${
              tsp.Linkedin ? tsp.Linkedin : tsp.Website
            }\n*Expertise*: ${
              tsp.Type
            }\n\n*Type 1* to check out *more service providers*🤔\n*Type 2* to *change* service providers *category*🔀.\n*Type menu* to go back to the Menu`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_moreSp
            );
            sendMsg();
          }
        }
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_serviceProvider
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstandNoAction
        );
        sendMsg();
      }
    } else if (res == "msg_professionalOfferings") {
      if (usermessage == "1") {
        var currentNeed = "Discover networking opportunities";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_professionalNetworking
        );
        sendMsg();
      } else if (usermessage == "2") {
        var currentNeed = "Seek knowledge in bite-sized portions";

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_knowledge
        );
        sendMsg();
      } else if (usermessage == "3") {
        var currentNeed = "Business mentor";

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_professionalStartupBites
        );
        sendMsg();
      } else if (usermessage == "4") {
        var currentNeed = "Startup news";

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ currentNeed });

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_professionalStartupBites
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_connect") {
      var temparr = getnumbers(usermessage);
      if (temparr.length == 0) {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      } else {
        var intersetedSpaces = getSpaces(temparr);
        var cisidx = 0;
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ intersetedSpaces, cisidx });
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1getUserType
        );
        sendMsg();

        // if(userChat.calendly && userChat.calendly!==""){

        // 	currentProfile = await getProfile(intersetedSpaces,cisidx);

        // 	if(currentProfile == null){
        // 		messageInput = messageHelper.getCustomTextInput(
        // 			messageFrom,
        // 			msg_noMoreProfile
        // 		);
        // 		sendMsg()
        // 	}else{
        // 		msg_shareProfile =`Super! We have found just the right person for you.😎\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see more connections\n*Type menu* to go back to the Menu `
        // 		messageInput = messageHelper.getCustomTextInput(
        // 			messageFrom,
        // 			msg_shareProfile
        // 		);
        // 		sendMsg()
        // 	}

        // }
      }
    } else if (res == "msg_1o1getUserType") {
      var hasCalendly = false;
      var error = false;
      if (userChat.calendly && userChat.calendly !== "") {
        hasCalendly = true;
      }

      if (usermessage == "1") {
        var connectWith = "founder";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ connectWith });
      } else if (usermessage == "2") {
        var connectWith = "professional";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ connectWith });
      } else if (usermessage == "3") {
        var connectWith = "both";
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ connectWith });
      } else {
        error = true;
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }

      if (!error) {
        if (!hasCalendly) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_1o1askCalendly
          );
          sendMsg();
        } else {
          var intersetedSpaces = userChat.intersetedSpaces;
          var cisidx = userChat.cisidx;
          currentProfile = await getProfile(intersetedSpaces, cisidx);

          if (currentProfile == null) {
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_noMoreProfile
            );
            sendMsg();
          } else {
            msg_shareProfile = `Super! We have found just the right person for you.😎\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;
            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_shareProfile
            );
            sendMsg();
          }
        }
      }
    } else if (res == "msg_1o1askCalendly") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1getCalendly
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1infoCalendly
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_1o1getCalendly") {
      var calendly = usermessage;
      await db
        .collection("WhatsappMessages")
        .doc(`${messageFrom}`)
        .update({ calendly });
      msg_1o1confirmCalendly = `Your Calendly link is ${calendly} 🧐\n\n*Type 1* to *confirm* the link\n*Type 2* to *retry*`;
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_1o1confirmCalendly
      );
      sendMsg();
    } else if (res == "msg_1o1confirmCalendly") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1recievedCalendly
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1getCalendly
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_1o1infoCalendly") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1getCalendly
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_1o1recievedCalendly") {
      if (usermessage == "1") {
        var intersetedSpaces = userChat.intersetedSpaces;
        var cisidx = userChat.cisidx;
        currentProfile = await getProfile(intersetedSpaces, cisidx);

        if (currentProfile == null) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreProfile
          );
          sendMsg();
        } else {
          msg_shareProfile = `Super! We have found just the right person for you.😎\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_shareProfile
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_shareProfile") {
      if (usermessage == "1") {
        var intersetedSpaces = userChat.intersetedSpaces;
        var cisidx = userChat.cisidx;

        cisidx = cisidx + 1;

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ cisidx });
        currentProfile = await getProfile(intersetedSpaces, cisidx);
        if (currentProfile == null) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreProfile
          );
          sendMsg();
        } else {
          msg_shareProfile = `Super! We have found just the right person for you.😎\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_shareProfile
          );
          sendMsg();
        }
      } else if (usermessage == "2") {
        var requested = [];
        var intersetedSpaces = userChat.intersetedSpaces;
        var cisidx = userChat.cisidx;
        var requesting = [];

        currentProfile = await getProfile(intersetedSpaces, cisidx);

        // console.log(currentProfile)

        var requser = currentProfile;

        if (userChat.requested != undefined && userChat.requested != []) {
          console.log("requested", userChat.requested);
          requested = userChat.requested;
          requested = [...requested, requser.id];
        }
        if (requser.requesting != undefined && requser.requesting != []) {
          requesting = requser.requesting;
          requesting = [...requesting, messageFrom];
        }

        requested = [requser.id];
        requesting = [messageFrom];

        // console.log(requested, requesting)
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ requested });
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ requestedIdx: requested.length - 1 });
        await db
          .collection("WhatsappMessages")
          .doc(`${requser.id}`)
          .update({ requesting });
        await db
          .collection("WhatsappMessages")
          .doc(`${requser.id}`)
          .update({ requestingIdx: requesting.length - 1 });

        currentProfile = userChat;

        msg_1o1recRequest = `Hi, there!🤗\nWe’ve just got a connection request for you.💯\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\n*Type 1* if you’re *interested in connecting* one-on-one👥\n*Type 2* if you don’t find them a suitable match😔\n\n*Type menu* to go back to the Menu`;

        messageInput = messageHelper.getCustomTextInput(
          requser.id,
          msg_1o1recRequest
        );

        console.log(requser, requser.messages.length);
        var lastMsg = requser.messages[requser.messages.length - 1];
        var convoActive = false;
        if (
          lastMsg != undefined &&
          (lastMsg.usermessage != "" || lastMsg.usermessage != null)
        ) {
          const messageDate = new Date(
            lastMsg?.date?.seconds * 1000 + lastMsg?.date?.nanoseconds / 1e6
          );
          console.log(messageDate);
          const currentDate = new Date();

          const timeDifferenceInHours = Math.ceil(
            Math.abs(currentDate - messageDate) / (1000 * 60 * 60)
          );

          if (timeDifferenceInHours < 24) {
            convoActive = true;
          }
          console.log(convoActive);
          if (convoActive) {
            noResponseSendMsg(requser.id, messageInput);
          } else {
            noResponseSendTemplate(requser.id, "networking_requests");
          }
        } else {
          noResponseSendTemplate(requser.id, "networking_requests");
        }

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1showintrest
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "networking_responses") {
      if (usermessage == "1") {
        if (userChat.res.length >= 1) {
          var reslist = userChat.res;
          var residx = 0;
          var currres = reslist[residx];
          var resdoc = await db
            .collection("WhatsappMessages")
            .doc(`${currres.id}`)
            .get();
          var resuser = resdoc.data();
          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({ residx });

          if (currres.accepted) {
            msg_1o1reqAcceptedtemp = `Here are your responses.👀\nHello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${resuser.name}\n*Linkedin:* ${resuser.linkedin}\n*About:* ${resuser.bio}\n*Space:* ${resuser.space}\n\nSet up a one-on-one networking session here: ${resuser.calendly}\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_1o1reqAcceptedtemp
            );
            sendMsg();
          } else {
            msg_1o1reqRejectedtemp = `Here are your responses.👀\nYour connection request was declined by 🫤\n\n*Name:* ${resuser.name}\n*Linkedin:* ${resuser.linkedin}\n*About:* ${resuser.bio}\n*Space:* ${resuser.space}\n\nNo worries, we’re sure you’ll find more suitable connections!😌\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_1o1reqRejectedtemp
            );
            sendMsg();
          }
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreResponses
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_shareResponses") {
      if (usermessage == "1") {
        if (userChat.res.length >= userChat.residx + 2) {
          var reslist = userChat.res;
          var residx = userChat.residx + 1;
          var currres = reslist[residx];
          var resdoc = await db
            .collection("WhatsappMessages")
            .doc(`${currres.id}`)
            .get();
          var resuser = resdoc.data();
          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({ residx });
          if (currres.accepted) {
            msg_1o1reqAcceptedtemp = `Here are your responses.👀\nHello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${resuser.name}\n*Linkedin:* ${resuser.linkedin}\n*About:* ${resuser.bio}\n*Space:* ${resuser.space}\n\nSet up a one-on-one networking session here: ${resuser.calendly}\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_1o1reqAcceptedtemp
            );
            sendMsg();
          } else {
            msg_1o1reqRejectedtemp = `Here are your responses.👀\nYour connection request was declined by 🫤\n\n*Name:* ${resuser.name}\n*Linkedin:* ${resuser.linkedin}\n*About:* ${resuser.bio}\n*Space:* ${resuser.space}\n\nNo worries, we’re sure you’ll find more suitable connections!😌\n\n*Type 1* to see *more responses😉*\n*Type menu* to go back to the menu!😉`;

            messageInput = messageHelper.getCustomTextInput(
              messageFrom,
              msg_1o1reqRejectedtemp
            );
            sendMsg();
          }
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreResponses
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "networking_requests") {
      if (usermessage == "1") {
        //check if user has requesting user
        if (userChat.requesting.length >= 1) {
          //get details of requesting user
          var req = userChat.requesting[0];
          var reqdoc = await db
            .collection("WhatsappMessages")
            .doc(`${req}`)
            .get();
          var requser = reqdoc.data();

          //fitting requser data into msg
          msg_shareRequests = `Here are your requests.👀\n\n*Name:* ${requser.name}\n*Linkedin:* ${requser.linkedin}\n*About:* ${requser.bio}\n*Space:* ${requser.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;

          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({ sharereqidx: 0 });

          // //update requesting of curr user
          // var requesting = userChat.requesting.filter(item => item!=req)
          // await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({requesting});

          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_shareRequests
          );
          sendMsg();
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreRequests
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_shareRequests") {
      if (usermessage == "1") {
        if (userChat.requesting.length >= userChat.sharereqidx + 2) {
          var req = userChat.requesting[userChat.sharereqidx + 1];
          var reqdoc = await db
            .collection("WhatsappMessages")
            .doc(`${req}`)
            .get();
          var requser = reqdoc.data();

          msg_shareRequests = `Here are your requests.👀\n\n*Name:* ${requser.name}\n*Linkedin:* ${requser.linkedin}\n*About:* ${requser.bio}\n*Space:* ${requser.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;

          await db
            .collection("WhatsappMessages")
            .doc(`${messageFrom}`)
            .update({ sharereqidx: userChat.sharereqidx + 1 });

          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_shareRequests
          );
          sendMsg();
        } else {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreRequests
          );
          sendMsg();
        }
      } else if (usermessage == "2") {
        var req = userChat.requesting[userChat.sharereqidx];
        var reqdoc = await db
          .collection("WhatsappMessages")
          .doc(`${req}`)
          .get();
        var requser = reqdoc.data();

        //update requesting of curr user
        var requesting = userChat.requesting.filter((item) => item != req);
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ requesting });

        currentProfile = userChat;
        msg_1o1reqAccepted = `Hello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSet up a one-on-one networking session here: ${currentProfile.calendly}`;

        messageInput = messageHelper.getCustomTextInput(
          req,
          msg_1o1reqAccepted
        );

        var lastMsg = requser.messages[requser.messages.length - 1];
        var convoActive = false;
        if (
          lastMsg != undefined &&
          (lastMsg.usermessage != "" || lastMsg.usermessage != null)
        ) {
          const messageDate = new Date(
            lastMsg?.date?.seconds * 1000 + lastMsg?.date?.nanoseconds / 1e6
          );
          console.log(messageDate);
          const currentDate = new Date();

          const timeDifferenceInHours = Math.ceil(
            Math.abs(currentDate - messageDate) / (1000 * 60 * 60)
          );

          if (timeDifferenceInHours < 24) {
            convoActive = true;
          }
          console.log(convoActive);
          if (convoActive) {
            noResponseSendMsg(req, messageInput);
          } else {
            var reslist;
            if (requser.res) {
              reslist = [...requser.res, { id: messageFrom, accepted: true }];
            } else {
              reslist = [{ id: messageFrom, accepted: true }];
            }
            await db
              .collection("WhatsappMessages")
              .doc(`${req}`)
              .update({ res: reslist });
            noResponseSendTemplate(req, "networking_responses");
          }
        } else {
          var reslist;
          if (requser.res) {
            reslist = [...requser.res, { id: messageFrom, accepted: true }];
          } else {
            reslist = [{ id: messageFrom, accepted: true }];
          }
          await db
            .collection("WhatsappMessages")
            .doc(`${req}`)
            .update({ res: reslist });
          noResponseSendTemplate(req, "networking_responses");
        }

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1sharedCalendly
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_1o1showintrest") {
      if (usermessage == "1") {
        var intersetedSpaces = userChat.intersetedSpaces;
        var cisidx = userChat.cisidx;

        cisidx = cisidx + 1;

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ cisidx });
        currentProfile = await getProfile(intersetedSpaces, cisidx);
        if (currentProfile == null) {
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_noMoreProfile
          );
          sendMsg();
        } else {
          msg_shareProfile = `Super! We have found just the right person for you.😎\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSend out a connection request already.😉\n\n*Type 1* to see *more connections*🧐\n*Type 2* if you’re *interested in connecting* one-on-one👥\n\n*Type menu* to go back to the Menu `;
          messageInput = messageHelper.getCustomTextInput(
            messageFrom,
            msg_shareProfile
          );
          sendMsg();
        }
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_1o1recRequest") {
      console.log("recreq ", usermessage);
      if (usermessage == "1") {
        var id = userChat.requesting[userChat.requestingIdx];

        var requesting = userChat.requesting;
        requesting = requesting.filter((num) => num != id);

        var requser = await db
          .collection("WhatsappMessages")
          .doc(`${id}`)
          .get();
        requser = requser.data();
        requser.id = id;

        var requested = requser.requested;
        requested = requested.filter((num) => num != messageFrom);

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ requesting });
        await db
          .collection("WhatsappMessages")
          .doc(`${requser.id}`)
          .update({ requested });

        currentProfile = userChat;
        msg_1o1reqAccepted = `Hello, again!🤩\nYour connection request has been accepted.\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nSet up a one-on-one networking session here: ${currentProfile.calendly}`;

        messageInput = messageHelper.getCustomTextInput(
          requser.id,
          msg_1o1reqAccepted
        );
        var lastMsg = requser.messages[requser.messages.length - 1];
        var convoActive = false;
        if (
          lastMsg != undefined &&
          (lastMsg.usermessage != "" || lastMsg.usermessage != null)
        ) {
          const messageDate = new Date(
            lastMsg?.date?.seconds * 1000 + lastMsg?.date?.nanoseconds / 1e6
          );
          console.log(messageDate);
          const currentDate = new Date();

          const timeDifferenceInHours = Math.ceil(
            Math.abs(currentDate - messageDate) / (1000 * 60 * 60)
          );

          if (timeDifferenceInHours < 24) {
            convoActive = true;
          }
          console.log(convoActive);
          if (convoActive) {
            noResponseSendMsg(requser.id, messageInput);
          } else {
            noResponseSendTemplate(requser.id, "networking_responses");
          }
        } else {
          noResponseSendTemplate(requser.id, "networking_responses");
        }

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1sharedCalendly
        );
        sendMsg();
      } else if (usermessage == "2") {
        var id = userChat.requesting[userChat.requestingIdx];

        var requesting = userChat.requesting;
        requesting = requesting.filter((num) => num != id);

        var requser = await db
          .collection("WhatsappMessages")
          .doc(`${id}`)
          .get();
        requser = requser.data();
        requser.id = id;

        var requested = requser.requested;
        requested = requested.filter((num) => num != messageFrom);

        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ requesting });
        await db
          .collection("WhatsappMessages")
          .doc(`${requser.id}`)
          .update({ requested });

        currentProfile = userChat;
        msg_1o1reqRejected = `Your connection request was declined by 🫤\n\n*Name:* ${currentProfile.name}\n*Linkedin:* ${currentProfile.linkedin}\n*About:* ${currentProfile.bio}\n*Space:* ${currentProfile.space}\n\nNo worries, we’re sure you’ll find more suitable connections!😌\n\n*Type menu* to go back to the menu!😉`;

        messageInput = messageHelper.getCustomTextInput(
          requser.id,
          msg_1o1reqRejected
        );
        var lastMsg = requser.messages[requser.messages.length - 1];
        var convoActive = false;
        if (
          lastMsg != undefined &&
          (lastMsg.usermessage != "" || lastMsg.usermessage != null)
        ) {
          const messageDate = new Date(
            lastMsg?.date?.seconds * 1000 + lastMsg?.date?.nanoseconds / 1e6
          );
          console.log(messageDate);
          const currentDate = new Date();

          const timeDifferenceInHours = Math.ceil(
            Math.abs(currentDate - messageDate) / (1000 * 60 * 60)
          );

          if (timeDifferenceInHours < 24) {
            convoActive = true;
          }
          console.log(convoActive);
          if (convoActive) {
            noResponseSendMsg(requser.id, messageInput);
          } else {
            noResponseSendTemplate(requser.id, "networking_responses");
          }
        } else {
          noResponseSendTemplate(requser.id, "networking_responses");
        }

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_1o1notIntrested
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_professionalNetworking") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_rbrRegisterLink
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_reverrSpacesCommunity
        );
        sendMsg();
      } else if (usermessage == "3") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_connect
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_spaces") {
      var space = "";
      var gofwd = false;

      if (usermessage == "1") {
        space = "FinTech";
        gofwd = true;
      } else if (usermessage == "2") {
        space = "EdTech";
        gofwd = true;
      } else if (usermessage == "3") {
        space = "AgriTech";
        gofwd = true;
      } else if (usermessage == "4") {
        space = "FoodTech";
        gofwd = true;
      } else if (usermessage == "5") {
        space = "Ecommerce";
        gofwd = true;
      } else if (usermessage == "6") {
        space = "Logistics & Delivery";
        gofwd = true;
      } else if (usermessage == "7") {
        space = "Cleantech & Renewable Energy";
        gofwd = true;
      } else if (usermessage == "8") {
        space = "Ai & ML";
        gofwd = true;
      } else if (usermessage == "9") {
        space = "Web 3.0";
        gofwd = true;
      } else if (usermessage == "10") {
        space = "FashionTech";
        gofwd = true;
      } else if (usermessage == "11") {
        space = "SpaceTech";
        gofwd = true;
      } else if (usermessage == "12") {
        space = "HealthTech";
        gofwd = true;
      } else if (usermessage == "13") {
        space = "Cybersecurity";
        gofwd = true;
      } else if (usermessage == "14") {
        space = "AR & VR";
        gofwd = true;
      } else if (usermessage == "15") {
        space = "Internet of Things(IOT)";
        gofwd = true;
      } else if (usermessage == "16") {
        space = "Biotech";
        gofwd = true;
      } else if (usermessage == "17") {
        space = "TravelTech";
        gofwd = true;
      } else if (usermessage == "18") {
        space = "Real Estate-Tech";
        gofwd = true;
      } else if (usermessage == "19") {
        space = "BeautyTech";
        gofwd = true;
      } else if (usermessage == "20") {
        space = "LegalTech";
        gofwd = true;
      } else if (usermessage == "21") {
        space = "HR-Tech";
        gofwd = true;
      } else if (usermessage == "22") {
        space = "Personal fitness Tech";
        gofwd = true;
      } else if (usermessage == "23") {
        space = "Waste Management Technologies";
        gofwd = true;
      } else if (usermessage == "24") {
        space = "Online Marketplaces";
        gofwd = true;
      } else if (usermessage == "25") {
        space = "CloudTech";
        gofwd = true;
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstandNoAction
        );
        sendMsg();
      }
      if (gofwd) {
        await db
          .collection("WhatsappMessages")
          .doc(`${messageFrom}`)
          .update({ space });

        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_confirmSpace
        );
        sendMsg();
      }
    } else if (res == "msg_confirmSpace") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_askbio
        );
        sendMsg();
      } else if (usermessage == "0") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_spaces
        );
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (
      res == "msg_ideaValidation" ||
      res == "msg_businessCollaterals" ||
      res == "msg_fundingOptions" ||
      res == "msg_startupFinancing" ||
      res == "msg_growthStrategies" ||
      res == "msg_startupscaling" ||
      res == "msg_incubators" ||
      res == "msg_mentorship" ||
      res == "msg_productDvp" ||
      res == "msg_customerAcq"
    ) {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_knowledgecontent
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_knowledgecontent") {
      if (usermessage == "1") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          //   msg_ideaValidation
          msg_ebookAndbooksSummaries
        );
        sendMsg();
      } else if (usermessage == "2") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          //   msg_businessCollaterals
          msg_videoPlaylist
        );
        sendMsg();
      } else if (usermessage == "3") {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          //   msg_fundingOptions
          msg_coursesAndCertifications
        );
        sendMsg();
      }
      //   else if (usermessage == "4") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_startupFinancing
      //     );
      //     sendMsg();
      //   } else if (usermessage == "5") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_growthStrategies
      //     );
      //     sendMsg();
      //   } else if (usermessage == "6") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_startupscaling
      //     );
      //     sendMsg();
      //   } else if (usermessage == "7") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_incubators
      //     );
      //     sendMsg();
      //   } else if (usermessage == "8") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_mentorship
      //     );
      //     sendMsg();
      //   } else if (usermessage == "9") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_productDvp
      //     );
      //     sendMsg();
      //   } else if (usermessage == "10") {
      //     messageInput = messageHelper.getCustomTextInput(
      //       messageFrom,
      //       msg_customerAcq
      //     );
      //     sendMsg();
      //   }
      else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstand
        );
        sendMsg();
      }
    } else if (res == "msg_ebookAndbooksSummaries") {
      if (
        usermessage == "1" ||
        usermessage == "2" ||
        usermessage == "3" ||
        usermessage == "4" ||
        usermessage == "5" ||
        usermessage == "6" ||
        usermessage == "7" ||
        usermessage == "8" ||
        usermessage == "9" ||
        usermessage == "10"
      ) {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_MayraReponse
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstandNoAction
        );
        sendMsg();
      }
    } else if (res == "msg_videoPlaylist") {
      if (
        usermessage == "1" ||
        usermessage == "2" ||
        usermessage == "3" ||
        usermessage == "4" ||
        usermessage == "5" ||
        usermessage == "6" ||
        usermessage == "7" ||
        usermessage == "8" ||
        usermessage == "9" ||
        usermessage == "10"
      ) {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_MayraReponse
        );
        sendMsg();
      } else {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_dontUnderstandNoAction
        );
        sendMsg();
      }
    } else if (res == "msg_coursesAndCertifications") {
      if (
        usermessage == "1" ||
        usermessage == "2" ||
        usermessage == "3" ||
        usermessage == "4" ||
        usermessage == "5" ||
        usermessage == "6" ||
        usermessage == "7" ||
        usermessage == "8" ||
        usermessage == "9" ||
        usermessage == "10"
      ) {
        messageInput = messageHelper.getCustomTextInput(
          messageFrom,
          msg_MayraReponse
        );
        sendMsg();
      }
    } else {
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_dontUnderstandNoAction
      );
      sendMsg();
    }
  } else {
    if (
      ["hi", "hii", "hello", "hie", "hey"].includes(messageText.toLowerCase())
    ) {
      messageInput = messageHelper.getCustomTextInput(messageFrom, msg_intiate);
      sendMsg();
    } else {
      messageInput = messageHelper.getCustomTextInput(
        messageFrom,
        msg_dontUnderstandNoAction
      );
      sendMsg();
    }
  }

  try {
    // console.log(req.body)
    // const  {payload}  = req.body;
    // console.log(messageReceived);
    // const messageFrom = messageReceived[0].from;
    let mediaid = " ";
    let mediatype = " ";
    //for media files start
    if (
      messageReceived[0].type === "image" ||
      messageReceived[0].type === "audio" ||
      messageReceived[0].type === "video"
    ) {
      if (messageReceived[0].type === "image") {
        mediaid = messageReceived[0].image.id;
        mediatype = "png";
      }
      if (messageReceived[0].type === "audio") {
        mediaid = messageReceived[0].audio.id;
        mediatype = "mp3";
      }
      if (messageReceived[0].type === "video") {
        mediaid = messageReceived[0].video.id;
        mediatype = "mp4";
      }

      const media = await getmedia(mediaid);
      const mediaurl = media.data.url;
      outputPath = `${mediaid}.${mediatype}`;
      res.send(mediaurl);

      axios(mediaurl, {
        method: "GET",
        responseType: "stream",
        headers: {
          Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
        },
      })
        .then((response) => {
          //  console.log(response);

          const writer = fs.createWriteStream(outputPath);
          response.data.pipe(writer);
          // writer.pipe(uploadStream);
          writer.on("finish", () => {
            const url = uploadFile(
              outputPath,
              outputPath,
              mediaid,
              messageFrom,
              mediatype
            );
            // return  console.log(url);
            console.log(`File saved as ${outputPath}`);
          });

          writer.on("error", (err) => {
            console.error("Error saving file:", err);
          });
        })
        .catch((error) => {
          console.error("Error making request:", error);
        });

      //  console.log("done");
    }
    //for media files end
    else {
      //for text CASES below
      // <---------- BASIC MSG SEND -------------->
      // if (["hi", "hii", "hello", "Hi", "hie", "Hello", "hey", "Hey", "Hie", "Hii"].includes(messageText.toLowerCase())) {
      // 	// Use a template or custom message here
      // 	messageInput = messageHelper.getCustomTextInput(
      // 	  // "917007393348",
      // 	  messageFrom,
      // 	  msg_hello
      // 	);
      //   } else {
      // 	  messageInput = messageHelper.getCustomTextInput(
      // 		// "917007393348",
      // 		messageFrom,
      // 		"Thank you for your message. We will get back to you soon."
      // 	  );
      // 	}
      // if (["hi", "hii", "hello", "Hi"].includes(messageText.toLowerCase())) {
      //   // Use a template or custom message here
      //   messageInput = messageHelper.getTemplateTextInput(
      // 	// "917007393348",
      // 	messageFrom,
      // 	"hello_world"
      //   );
      // } else {
      //   messageInput = messageHelper.getCustomTextInput(
      // 	// "917007393348",
      // 	messageFrom,
      // 	"Thank you for your message. We will get back to you soon."
      //   );
      // }
      // console.log("DATA")
      // console.log(messageInput)
      // console.log("DATA END")
      // 	const { data } = await sendMessage(messageInput);
      //    const userexist = await db.collection("WhatsappMessages").doc(`${messageFrom}`).get()
      //    if(!userexist.exists){
      // 	console.log("no doc");
      // 	await db.collection('WhatsappMessages').doc(`${messageFrom}`).set(
      // 	 {exists: "true"})
      // 	 await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({
      // 	  messages: FieldValue.arrayUnion(
      // 		{status: "success",
      // 		   messageId: data.messages[0].id,
      // 	   message: JSON.parse(messageInput),
      // 	   date: Timestamp.now(),
      // 	   usermessage,
      // 	  })
      // 	})
      //    }else{
      // 	await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({
      // 	  messages: FieldValue.arrayUnion(
      // 		{status: "success",
      // 		   messageId: data.messages[0].id,
      // 	   message: JSON.parse(messageInput),
      // 	   date: Timestamp.now(),
      // 	   usermessage,
      // 	  })
      // 	});
      //    }
    }
  } catch (error) {
    console.error("Error:", error);
    const statusCode = error.response ? error.response.status : 500;
    res.status(statusCode).json({
      message: error.message,
    });
  }
});

app.post("/extract", async (req, res) => {
  try {
    const data = req.body;
    const pdf_url = data.pdf_url;
    // const pdf_url = "https://firebasestorage.googleapis.com/v0/b/resumecreator-3d8fd.appspot.com/o/resume%2FNipun%20Walia's%20Resume%20(2).pdf?alt=media&token=1c85697f-c2a8-435c-a6e0-74d751d536c5&_gl=1*bvzz67*_ga*NTU3MTI0NzYxLjE2OTYzMjY3MzU.*_ga_CW55HF8NVT*MTY5OTE3NDY2MC4xMS4xLjE2OTkxNzQ2OTEuMjkuMC4w";

    if (!pdf_url) {
      return res.status(400).json({ error: "PDF URL is missing" });
    }

    const pdfText = await extractTextFromPDF(pdf_url);
    const openAIResponse = await responsecreate(pdfText);

    if (openAIResponse) {
      return res.status(200).json(openAIResponse);
    } else {
      return res.status(500).json({ error: "Error processing data" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/openai", (req, res) => {
  res.send(process.env.OPENAI_API_KEY);
});
app.post("/summary", async (req, res) => {
  try {
    const data = req.body;
    const des = data.description;
    const title = data.title;
    const details = data.details;

    if (!data) {
      return res.status(400).json({ error: "content missing" });
    }

    const openAIResponse = await summary(des, title, details);

    if (openAIResponse) {
      return res.status(200).json(openAIResponse);
    } else {
      return res.status(500).json({ error: "Error processing data" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/jobdes", async (req, res) => {
  try {
    const data = req.body;
    const job = data.job;
    const des = data.description;
    const title = data.title;
    const start_date = job.startDate;
    const end_date = job.endDate;
    const job_title = job.jobTitle;
    const job_des = job.description;

    if (!data) {
      return res.status(400).json({ error: "content missing" });
    }

    const openAIResponse = await jobdes(
      des,
      title,
      start_date,
      end_date,
      job_title,
      job_des
    );

    if (openAIResponse) {
      return res.status(200).json(openAIResponse);
    } else {
      return res.status(500).json({ error: "Error processing data" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/skill", async (req, res) => {
  try {
    const data = req.body;
    const title = data.title;
    const exp = data.employmentHistory;

    if (!data) {
      return res.status(400).json({ error: "content missing" });
    }

    const openAIResponse = await skill(title, exp);

    if (openAIResponse) {
      return res.status(200).json(openAIResponse);
    } else {
      return res.status(500).json({ error: "Error processing data" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(PORT, () => {
  const date = new Date();
  console.log("Listening on " + PORT);
});
