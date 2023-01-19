const app = require('express')();
const path = require('path')
const shortid = require('shortid')
const Razorpay = require('razorpay')
const cors = require('cors')
const bodyParser = require('body-parser')
const {RtcTokenBuilder, RtcRole} = require('agora-access-token');
const PORT = process.env.PORT||3000;
const {Payment,Refund}=  require('./config');
const { json } = require('body-parser');
const axios = require('axios');
const bcrypt = require('bcrypt');
const saltRounds = 10;
var secret = "pZDneOGeFBwtF3B5MtUcfNkgbQUYcRAZOvARifwxDb5eBTWG2hn7Wte10KxKAuji3OvCCwfzweVdsqvih2ASw1uaYXL8KPiVqAWTYqVa2kdch1uUWrMjbSAnBNIDpNl2";

//server domain
//https://reverrserver.herokuapp.com/

app.use(cors())
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

app.post("/webcftoken", (req, res) => {
	const { id, amount, currency, customer_id, customer_phone } = req.body;
	const options = {
	  method: "POST",
	  url: "https://api.cashfree.com/pg/orders",
	  headers: {
		accept: "application/json",
		"x-client-id": "21235619dae90a7c71fa82b24c653212",
		"x-client-secret": "b3fcd2aee2a93a9d7efedcd88936046a43506c5c",
		"x-api-version": "2022-01-01",
		"content-type": "application/json",
		"Access-Control-Allow-Origin": "*",
	  },
	  data: {
		customer_details: {
		  customer_id: customer_id,
		  customer_phone: customer_phone,
		},
		order_id: id,
		order_amount: amount,
		order_currency: currency,
	  },
	};
  
	axios
	  .request(options)
	  .then(function (response) {
		res.json({ token: response.data.order_token });
	  })
	  .catch(function (error) {
		console.error(error);
	  });
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

app.listen(PORT, () => {
	const date = new Date();
	// console.log(date.getDate()+"|"+(1+date.getMonth())+"|"+date.getFullYear()+" "+date.getHours()+":"+date.getMinutes()+" "+getRandomString(8));
	console.log('Listening on '+PORT)
})
