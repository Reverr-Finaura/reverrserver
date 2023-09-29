const app = require('express')();
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
require('dotenv').config()
const cors = require('cors')
const bodyParser = require('body-parser')
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const {Payment,Refund, MessagesSend, MessagesReceived}=  require('./config');
const { json } = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const PORT = process.env.SERVER_PORT||3000;
var secret = "pZDneOGeFBwtF3B5MtUcfNkgbQUYcRAZOvARifwxDb5eBTWG2hn7Wte10KxKAuji3OvCCwfzweVdsqvih2ASw1uaYXL8KPiVqAWTYqVa2kdch1uUWrMjbSAnBNIDpNl2";
const {Authorization,Redirect,SignupAuthorization,SignupRedirect}=require("./authHelper");
const sendMessage = require('./helper/message');
const messageHelper = require('./helper/helper')
const getmedia = require("./helper/mediamessage");
const {bucket,db,Timestamp,FieldValue} = require("./config");

const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const uuid = uuidv4();
let sid=process.env.ACCOUNT_SID
let auth_token=process.env.AUTH_TOKKEN
let twilio=require("twilio")(sid,auth_token)
//server domain
//https://reverrserver.herokuapp.com/
var corsOptions = {
    origin: '*',
	optionsSuccessStatus: 200,
	methods:"GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
	allowedHeaders:"Content-Type,Authorization",
	credentials:true
  }
app.use(cors(corsOptions))
// app.options('*', cors())
app.use(bodyParser.json())

const razorpay = new Razorpay({
	key_id: 'rzp_live_BPxSfmKEXNm7T5',
	key_secret: 'FeuhD71ytsUEG22qGugjEv0A'
})

const cashfree = {
	clientId: "21235619dae90a7c71fa82b24c653212",
	clientSecret: "b3fcd2aee2a93a9d7efedcd88936046a43506c5c"
}

 const APP_ID = "904538e9e76546c49aabef629237f0fd";
 const APP_CERTIFICATE = "b083ff1a9aad4db1822cd1d8c944d016";

 function getRandomString(length) {
    var randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var result = '';
    for ( var i = 0; i < length; i++ ) {
        result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    }
    return result;
}

 const nocache = (req, res, next) =>{
	var secret = "pZDneOGeFBwtF3B5MtUcfNkgbQUYcRAZOvARifwxDb5eBTWG2hn7Wte10KxKAuji3OvCCwfzweVdsqvih2ASw1uaYXL8KPiVqAWTYqVa2kdch1uUWrMjbSAnBNIDpNl2";

	// const {authorization} = req.headers;
	// if(!authorization || authorization !== secret){
	//    return  res.status(401).json({error:"UnAuthorized!"})
	//    }
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.header('Expires','-1');
    res.header('Pragma','no-cache');

    next();
 }

 const generateAccessToken = (req,res) =>{
    res.header('Access-Control-Allow-Origin', '*');
    var channel = req.body.channelName? req.body.channelName :"demo";
    var uid = 0;
    var role = req.body.host? RtcRole.PUBLISHER:RtcRole.SUBSCRIBER;
    var expireTime = 3600;
    var currTime = Math.floor(Date.now()/ 1000);
    var privilegeExpireTime = currTime+ expireTime;

	console.log(req.body);

    const token= RtcTokenBuilder.buildTokenWithUid(APP_ID, APP_CERTIFICATE, channel, uid, role, privilegeExpireTime);

    return res.send({token});
	
 }

 const Authorize = (req,res,next)=>{
	
	

	 const {authorization} = req.headers;
	 if(!authorization || authorization !== secret){
		return  res.status(401).json({error:"UnAuthorized!"})
		}
	 next();
 }

app.post('/accesstoken',nocache,generateAccessToken);

app.get('/logo.svg', (req, res) => {
	res.sendFile(path.join(__dirname, 'logo.svg'))
})

app.post('/razorpay',Authorize, async (req, res) => {
	const payment_capture = 1
	const amount = 5
	const currency = 'INR'

	const options = {
		amount: amount * 100,
		currency,
		receipt: shortid.generate(),
		payment_capture
	}

	try {
		const response = await razorpay.orders.create(options)
		console.log(response)
		res.json({
			id: response.id,
			currency: response.currency,
			amount: response.amount
		})
	} catch (error) {
		console.log(error)
	}
})

app.post('/refund',Authorize, async(req,res)=>{

	try{
		const response = await razorpay.payments.refund("pay_J6tLxaMMxPWREU");
		console.log(response);
		res.send(response);
	}
	catch (error){
		console.log(error);
		res.send(error);
	}
})

app.get("/test",async(req,res)=>{
try{
	console.log('test')
}catch(err){
console.log('Error',err)
}
})

app.post('/verification', async(req, res) => {
	// do a validation
	const secret = 'G7brM8xQ6$RtNYs'

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		const date = new Date();
		const payment ={
			date:date.getDate()+"|"+(1+date.getMonth())+"|"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+" "+getRandomString(8),
			payment: req.body
		}
		await Payment.add(payment);
		return res.json({ status: 'ok' })
	} else {
		// pass it
		return res.status(401).json({error:"UnAuthorized!"});
	}
})

app.post('/verification/refund', async(req, res) => {
	// do a validation
	const secret = 'G7brM8xQ6$RtNYs'

	// console.log(req.body)

	const crypto = require('crypto')

	const shasum = crypto.createHmac('sha256', secret)
	shasum.update(JSON.stringify(req.body))
	const digest = shasum.digest('hex')

	console.log(digest, req.headers['x-razorpay-signature'])

	if (digest === req.headers['x-razorpay-signature']) {
		console.log('request is legit')
		// process it
		const date = new Date();
		const refund ={
			date:date.getDate()+"|"+(1+date.getMonth())+"|"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+" "+getRandomString(8),
			refund: req.body
		}
		await Refund.add(refund);
		return res.json({ status: 'ok' })
		// require('fs').writeFileSync('refund3.json', JSON.stringify(req.body, null, 4))
	} else {
		return res.status(401).json({error:"UnAuthorized!"});
	}
	
})

app.post("/cftoken",(req,res)=>{

	
	const order={
		orderId:req.body.orderId,
		orderCurrency:req.body.currency,
		orderAmount:req.body.amount
	}
	
	// var hash="$2b$10$wu8ujbqHIaelkAQ.MfmRE.eVx.7iVOBfbyIbsD1zRSWvgzsFf4goe";
	// bcrypt.genSalt(saltRounds, function(err, salt) {
	// 	bcrypt.hash(secret, salt, function(err, hashs) {
	// 		hash=hashs;
	// 		// console.log("hash",hash);
	// 	});
	// });
	
	bcrypt.compare(secret, req.body.secret, function(err, result) {
		if(result){
			try{
				axios({
					method: 'post',
					url: 'https://api.cashfree.com/api/v2/cftoken/order',
					headers:{'Content-Type': 'application/json',
							 'x-client-id':cashfree.clientId,
							 'x-client-secret':cashfree.clientSecret},
					data:JSON.stringify(order),
				  })
					.then(function (response) {
							 res.status(200)
							 res.json({cftoken:response.data.cftoken});
						
					}).catch(err => 
						{	
							res.status(400)
							res.json({error:"ERROR"})
							console.log("then error",err)})
				}
				catch (err){
					console.log("axois error",err);
					res.send("Err")
				}
		}
		else{
		res.status(401);
		res.json({msg:"UnAuthenticated!"})
		}
	});


});

app.post("/webcftoken", async(req, res) => {
	const { id, amount, currency, customer_id, customer_phone } = req.body;
	let dt = {
		customer_details: {
		  customer_id: customer_id,
		  customer_phone: customer_phone,
		},
		order_id: id,
		order_amount: amount,
		order_currency: currency,
	  }
	  try{
		let resp = await axios.post("https://api.cashfree.com/pg/orders",dt,{
			headers: {
				"x-client-id": "21235619dae90a7c71fa82b24c653212",
				"x-client-secret": "b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
				"x-api-version": "2022-01-01",
			}}
			)
		res.json({ token: resp?.data?.order_token });
	  }catch(err){
		console.log('err',err)
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

app.post("/webSplitPayment",(req,res)=>{
	const{orderId,vendorId,amount,secrett}=req.body;
	if(secrett==="2V7W@ODU6HTRS1GY$54JQ*EP0F8N%9!BI&AXKML3#ZCQ!$3U"){
	
const options={
	 method: "POST",
	  url: `https://api.cashfree.com/api/v2/easy-split/orders/${orderId}/split`,
	  headers: {
    'Content-Type': 'application/json',
    "X-Client-Id":"21235619dae90a7c71fa82b24c653212",
    "X-Client-Secret":"b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
  },
  data:{
	"split": [
        {
              "vendorId":vendorId,
              "amount":amount,
              // "vendorId":"ansh123456bansal",
              // "amount":(1)*0.9,
              "percentage": null
          }
      ],
      "splitType": "ORDER_AMOUNT"
  }
};
axios
	  .request(options)
	  .then(function (response) {
		res.json({ message: response.data });
	  })
	  .catch(function (error) {
		console.error(error);
	  });
	  
}
else{
res.status(401);
res.json({message:"UnAuthenticated!"})
}
}

)

app.post('/sendSms',(req,res)=>{
    const{to,message}=req.body
  twilio.messages.create({

    from:"+12706067949",
    to:`+91${to}`,
    body:message
  }).then((r)=>{console.log(r);res.send({status:true,message:"Message Send to your Number"})}).catch((err)=>console.log(err))
  })
app.post('/sendSmsCode',(req,res)=>{
    const{to,message,code}=req.body
  twilio.messages.create({

    from:"+12706067949",
    to:`+${code}${to}`,
    body:message
  }).then((r)=>{console.log(r);res.send({status:true,message:"Message Send to your Number"})}).catch((err)=>res.status(400).send({status:false,message:err.message}))
  })

  app.get('/api/linkedin/authorize',(req,res)=>{
	return res.redirect(Authorization());
  })
  app.get('/api/linkedin/signup/authorize',(req,res)=>{
	return res.redirect(SignupAuthorization());
  })
app.post('/getUserDataFromLinkedin',async(req,res)=>{
	const {code}=req.body
	await (Redirect(code,res))
	
})
app.post('/getUserDataFromLinkedin/signup',async(req,res)=>{
	const {code}=req.body
	await (SignupRedirect(code,res))
	
})

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
var outputPath = ''


async function uploadFile(path, filename,mediaid,messageFrom,mediatype) {

  // Upload the File
  const storage = await storageRef.upload(path, {
      public: true,
      destination: `Whatsappclouduploads/${filename}`,
      metadata: {
        metadata :{
          firebaseStorageDownloadTokens: uuid,
       }
    },
     
  });

  fs.stat(`${path}`, function (err, stats) {
    // console.log(stats);
    if (err) {
        return console.error(err);
    }
    fs.unlink(`${path}`,function(err){
         if(err) return console.log(err);
    });  
 });

 await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({
  messages: FieldValue.arrayUnion(
    {status: "success",
       messageId: mediaid,
   date: Timestamp.now(),
   url: storage[0].metadata.mediaLink,
   previevUrl: `https://firebasestorage.googleapis.com/v0/b/reverr-25fb3.appspot.com/o/${storage[0].id}?alt=media&token=${storage[0].metadata.metadata.firebaseStorageDownloadTokens}`,
   mediatype: mediatype
  })
});
  

// console.log(storage[0].metadata.metadata.firebaseStorageDownloadTokens);
// console.log(storage[0].id);
  return  storage[0].metadata.mediaLink;
}

const checkmsgalreadyreplied = async (id)=>{
 var msgRef = await db.collection("meta").doc("msgRec").get();
 const msgRec = msgRef.data();
 console.log(msgRec)
if(msgRec.id.includes(id)){
	console.log(true)
}else{
	console.log(false)
}
}



app.post("/webhook", async (req, response) => {
	const  {payload}  = req.body;
	console.log(payload)
	console.log(payload.entry[0])
	console.log(payload.entry[0].id)
	console.log(payload.entry[0].changes[0].value.contacts)
	console.log(payload.entry[0].changes[0].value.messages)
	const msg_id = payload.entry[0].id;
	if(msg_id)
	checkmsgalreadyreplied(msg_id)

	var lastMsgNotEmpty = false;	
	var name=""
	var linkedin=""
	var bio=""
	var lastMsg=""
	var lastMsgSend=""
	var lastMsgRec=""
	let messageInput;

	const messageReceived = payload.entry[0].changes[0].value.messages;
	const messageText = messageReceived[0].text.body;
	const messageFrom = messageReceived[0].from;
	const usermessage = messageReceived[0].text.body;
	var userChat = await db.collection("WhatsappMessages").doc(`${messageFrom}`).get()
	if(!userChat.exists){
		console.log("No doc found!")

	}else{
		userChat = userChat.data();
		// console.log("user data", userChat)
		// console.log(userChat.messages.length)
		var lastMsg = userChat.messages[userChat.messages.length -1];
		if(lastMsg != undefined && lastMsg != ""){
			lastMsgNotEmpty = true;
		}
		// lastMsg = userChat.messages[2]; checking template
		//  console.log(lastMsg.usermessage) // last msg that we recieved from user 
		//  console.log( lastMsg.message.type =="template"?lastMsg.message.template.name: lastMsg.message.text.body) // last msg that we send to user
		lastMsgSend = lastMsg.message.type =="template"?lastMsg.message.template.name: lastMsg.message.text.body;
		lastMsgRec = lastMsg.usermessage;
		
		//initializing values
		if(userChat.name){
			name = userChat.name;
		}
		if(userChat.linkedin){
			linkedin = userChat.linkedin;
		}
		if(userChat.bio){
			bio = userChat.bio;
		}

	}
		
	// <---- CUSTOM MSG---->
	const msg_hello = "Hi, there! \nWelcome to Reverr. We hope you are doing great. \n\nReverr aims to assist startups by being a platform that connects startup founders to mentors, investors, and service providers while providing knowledge and networking opportunities. 🎯 \n\nTell us about yourself and allow us to cater to all your needs. \nType 1 if you’re a Startup Founder \nType 2 if you’re a Professional "
	const msg_askName = "We are happy that you're here.🤗 \nHow should we address you? Please type in your full name."
	const msg_confirmName = `So your name is ${name}? \nType 1 to confirm \nType 0 to retry`
	const msg_askLinkedin = "Let's build your profile first.📑\nKindly share your LinkedIn URL."
	const msg_confirmLinkedin = `So your linkedin url is ${linkedin}? \nType 1 to confirm \nType 0 to retry`
	const msg_askbio = "We have noted it.\nNow please write down a one-liner bio for yourself mentioning your expertise, experience, and interests. 👩🏻‍💼👨🏻‍💼 \n\nExample-I’m the founder of a digital marketing agency. We work with up-and-coming e-commerce businesses."
	const msg_confirmBio = `${bio} , Is this right? \nType 1 to confirm \nType 0 to retry`
	const msg_askStage = "That sounds good.🤩\nNow pick what resonates with you the most.\n\nType 1 if you have an idea and wish to execute it.🗣️\nType 2 if you are running a successful startup 😎\nType 3 if you have an idea but lack the necessary resources/ guidance🫣\nType 4 if you are running a startup and wish to grow & expand it further🤑\nType 5 if you are exploring your options 🤔"
	const msg_askOffering = "Type in the number of offering that suits your needs the best and let us take care of the rest. \n\n1. Get funding from VCs, Angels, and relevant Investors\n2. Discover networking opportunities \n3. Seek knowledge in bite-sized portions\n4. Connect with service providers for assistance"
	const msg_dontUnderstand= "Sorry, I dont understand what do you mean by that?. \n\nType 1 to try again!"
	const msg_dontUnderstandNoAction= "Sorry, I dont understand what do you mean by that. Please try again."

	const sendMsg = async()=>{
		const { data } = await sendMessage(messageInput);

		const userexist = await db.collection("WhatsappMessages").doc(`${messageFrom}`).get()
	   if(!userexist.exists){
		console.log("no doc");
		await db.collection('WhatsappMessages').doc(`${messageFrom}`).set(
		 {exists: "true"})
		await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({
		  messages: FieldValue.arrayUnion(
			{status: "success",
			   messageId: data.messages[0].id,
		   message: JSON.parse(messageInput),
		   date: Timestamp.now(),
		   usermessage,
		  })
		}) 
	   }else{
		await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({
		  messages: FieldValue.arrayUnion(
			{status: "success",
			   messageId: data.messages[0].id,
		   message: JSON.parse(messageInput),
		   date: Timestamp.now(),
		   usermessage,
		  })
		});
	   }
	   response.json({
		status: "success",
	  });
	}
	const resendLastToLastMsg = ()=>{
		var ltlMsg = userChat.messages[userChat.messages.length -2];
		if(ltlMsg.message.type =="template"){
			var ltlMsgSend = ltlMsg.message.template.name;

			messageInput = messageHelper.getTemplateTextInput(
				messageFrom,
				ltlMsgSend
			);
			
			sendMsg();
		} else {
			var ltlMsgSend = ltlMsg.message.text.body;

			messageInput = messageHelper.getTemplateTextInput(
				messageFrom,
				ltlMsgSend
			)

			sendMsg();
		}
		
	}

	const msgMatcher = (lastMsgSend)=>{
		console.log(lastMsgSend);
		var result = "not found"
		if(lastMsgSend == msg_hello){
			result = "msg_hello"
		}else if(lastMsgSend == msg_askName){
			result = "msg_askName"
		}else if(lastMsgSend == msg_confirmName){
			result = "msg_confirmName"
		}else if(lastMsgSend == msg_askLinkedin){
			result = "msg_askLinkedin"
		}else if(lastMsgSend == msg_confirmLinkedin){
			result = "msg_confirmLinkedin"
		}else if(lastMsgSend == msg_askbio){
			result = "msg_askbio"
		}else if(lastMsgSend == msg_confirmBio){
			result = "msg_confirmBio"
		}else if(lastMsgSend == msg_askStage){
			result = "msg_askStage"
		}else if(lastMsgSend == msg_askOffering){
			result = "msg_askOffering"
		}else if(lastMsgSend == msg_dontUnderstand){
			result = "msg_dontUnderstand"
		}
		console.log(result)
		return result;
	}
	
	if(lastMsgNotEmpty){
		var res = msgMatcher(lastMsgSend);
		if (["hi", "hii", "hello", "hie", "hey"].includes(messageText.toLowerCase())){
			messageInput = messageHelper.getCustomTextInput(
				messageFrom,
				msg_hello
			  );
			sendMsg()
		}
		else if (res == "msg_hello"){
			console.log("f1")
			if(usermessage == "1"){
				var userType = "founder";
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({userType}) 
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askName
				  );
				sendMsg()
			}else if(usermessage == "2"){
				var userType = "professional"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({userType})
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askName
				  );
				sendMsg()
			}else{
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_dontUnderstand
				  );
				sendMsg()
			}

		}
		else if (res == "msg_askName"){
			console.log("f2")
			name = usermessage;
			await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({name});
			messageInput = messageHelper.getCustomTextInput(
				messageFrom,
				msg_confirmName
			  ); 
			  sendMsg()
		}
		else if (res == "msg_confirmName"){
			console.log("f3")
			if(usermessage == "1"){
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askLinkedin
				);
				sendMsg()
			}else if(usermessage=="0"){
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askName
				  );
				sendMsg()
			}else {
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_dontUnderstand
				  );
				sendMsg()
			}
		}
		else if (res == "msg_askLinkedin"){
			console.log("f4")
			linkedin = usermessage;
			await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({linkedin});
			messageInput = messageHelper.getCustomTextInput(
				messageFrom,
				msg_confirmLinkedin
			  ); 
			  sendMsg()
		}
		else if (res == "msg_confirmLinkedin"){
			console.log("f5")
			if(usermessage == "1"){
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askbio
				);
				sendMsg()
			}else if(usermessage=="0"){
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askLinkedin
				  );
				sendMsg()
			}else {
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_dontUnderstand
				  );
				sendMsg()
			}
		}
		else if (res == "msg_askbio"){
			console.log("f6")
			bio = usermessage;
			await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({bio});
			messageInput = messageHelper.getCustomTextInput(
				messageFrom,
				msg_confirmBio
			  ); 
			  sendMsg()
		}
		else if (res == "msg_confirmBio"){
			console.log("f7")
			if(usermessage == "1"){
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askStage
				);
				sendMsg()
			}else if(usermessage=="0"){
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askbio
				  );
				sendMsg()
			}else {
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_dontUnderstand
				  );
				sendMsg()
			}
		}
		else if (res == "msg_askStage"){
			console.log("f8")
			if(usermessage=="1"){
				var stage = "have an idea and wish to execute it.🗣️"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({stage});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askOffering
				  );
				sendMsg()
			} else if (usermessage=="2"){
				var stage = "are running a successful startup 😎"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({stage});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askOffering
				  );
				sendMsg()
			}  else if (usermessage=="3"){
				var stage = "have an idea but lack the necessary resources/ guidance🫣"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({stage});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askOffering
				  );
				sendMsg()
			} else if (usermessage=="4"){
				var stage = "are running a startup and wish to grow & expand it further🤑"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({stage});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askOffering
				  );
				sendMsg()
			} else if (usermessage=="5"){
				var stage = "are exploring your options 🤔"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({stage});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_askOffering
				  );
				sendMsg()
			} else {
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_dontUnderstand
				  );
				sendMsg()
			}
		}
		else if (res == "msg_askOffering"){
			console.log("f9")
			if(usermessage=="1"){
				var currentNeed = "Get funding from VCs, Angels, and relevant Investors"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({currentNeed});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					"Thank you for reaching out!"
				  );
				sendMsg()
			} else if (usermessage=="2"){
				var currentNeed = "Discover networking opportunities"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({currentNeed});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					"Thank you for reaching out!"
				  );
				sendMsg()
			}  else if (usermessage=="3"){
				var currentNeed = "Seek knowledge in bite-sized portions"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({currentNeed});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					"Thank you for reaching out!"
				  );
				sendMsg()
			} else if (usermessage=="4"){
				var currentNeed = " Connect with service providers for assistance"
				await db.collection("WhatsappMessages").doc(`${messageFrom}`).update({currentNeed});
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					"Thank you for reaching out!"
				  );
				sendMsg()
			} else {
				messageInput = messageHelper.getCustomTextInput(
					messageFrom,
					msg_dontUnderstand
				  );
				sendMsg()
			}
		}
		else if (res == "msg_dontUnderstand"){
			console.log("f10")
			if(usermessage == "1"){
				// Resend last to last msg
				resendLastToLastMsg()
			}
		}
	}else{
		if (["hi", "hii", "hello", "hie", "hey"].includes(messageText.toLowerCase())){
			messageInput = messageHelper.getCustomTextInput(
				messageFrom,
				msg_hello
			  );
			sendMsg()
		}else{
			messageInput = messageHelper.getCustomTextInput(
				messageFrom,
				msg_dontUnderstandNoAction
			  );
			sendMsg()
		}
	}

	try {
	
		// console.log(req.body)
		// const  {payload}  = req.body;
		// console.log(messageReceived);
		// const messageFrom = messageReceived[0].from;
		let mediaid = " "
		let mediatype = " "
		//for media files start
		if(messageReceived[0].type === "image" || messageReceived[0].type === "audio" || messageReceived[0].type === "video"){
		  if(messageReceived[0].type === "image"){
			mediaid= messageReceived[0].image.id;
			mediatype = "png"
		  }
		  if(messageReceived[0].type === "audio"){
			mediaid= messageReceived[0].audio.id;
			mediatype = "mp3"
		  }
		  if(messageReceived[0].type === "video"){
			mediaid= messageReceived[0].video.id;
			mediatype = "mp4"
		  }
		  
		  const media = await getmedia(mediaid)
		  const mediaurl = media.data.url
		 outputPath = `${mediaid}.${mediatype}`
		res.send(mediaurl);
		
		 axios(mediaurl,{
		  method: 'GET',
		  responseType: 'stream',
		  headers: {
			Authorization: `Bearer ${process.env.ACCESS_TOKEN}` ,
		  },
		}).then((response) => {
		  //  console.log(response);
	
		  const writer = fs.createWriteStream(outputPath);
		   response.data.pipe(writer);
		  // writer.pipe(uploadStream);
		  writer.on('finish', () => {
		const url =  uploadFile(outputPath, outputPath,mediaid,messageFrom,mediatype);
		// return  console.log(url);
			console.log(`File saved as ${outputPath}`);
		  });
	  
		  writer.on('error', (err) => {
			console.error('Error saving file:', err);
		  });
		})
		.catch((error) => {
		  console.error('Error making request:', error);
		});
	  
		//  console.log("done");
		
	  
		}
		//for media files end
	
		else{
	
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
		 
		
	  }} catch (error) {
	 
		console.error("Error:", error);
		const statusCode = error.response ? error.response.status : 500;
		res.status(statusCode).json({
		  message: error.message,
		 
		});
		}
	});

app.listen(PORT, () => {
	const date = new Date();
	console.log('Listening on '+PORT)
})
