const qs=require('querystring')
const axios=require('axios')


const Authorization=()=>{
    return encodeURI(`https://linkedin.com/oauth/v2/authorization?client_id=${process.env.LINKEDIN_CLIENT_ID}&response_type=code&state=DCEeFWf45A53sdfKef424&scope=${process.env.LINKEDIN_SCOPE}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI}`)
}

const SignupAuthorization=()=>{
    return encodeURI(`https://linkedin.com/oauth/v2/authorization?client_id=${process.env.LINKEDIN_CLIENT_ID}&response_type=code&state=DCEeFWf45A53sdfKef424&scope=${process.env.LINKEDIN_SCOPE}&redirect_uri=${process.env.LINKEDIN_REDIRECT_URI_SIGNUP}`)
}

const Redirect=async(code,appResponse)=>{

    const payload={
        client_id:process.env.LINKEDIN_CLIENT_ID,
        client_secret:process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri:process.env.LINKEDIN_REDIRECT_URI,
        grant_type:'authorization_code',
        code:code
    }

const data=await axios({
    url:`https://linkedin.com/oauth/v2/accessToken?${qs.stringify(payload)}`,
    method:'POST',
    headers:{
        'Content-Type':'x-www-form-urlencoded'
    }
}).then(response=>{
 
    UserInfo(response.data.access_token,appResponse)
}).catch(error=>{
    appResponse.status(400).send({status:false,message:error.message})
    return error
    
})
return data

}

const SignupRedirect=async(code,appResponse)=>{

    const payload={
        client_id:process.env.LINKEDIN_CLIENT_ID,
        client_secret:process.env.LINKEDIN_CLIENT_SECRET,
        redirect_uri:process.env.LINKEDIN_REDIRECT_URI_SIGNUP,
        grant_type:'authorization_code',
        code:code
    }

const data=await axios({
    url:`https://linkedin.com/oauth/v2/accessToken?${qs.stringify(payload)}`,
    method:'POST',
    headers:{
        'Content-Type':'x-www-form-urlencoded'
    }
}).then(response=>{
 
    UserInfo(response.data.access_token,appResponse)
}).catch(error=>{
    appResponse.status(400).send({status:false,message:error.message})
    return error
    
})
return data

}


const UserInfo=async(token,appResponse)=>{

const data=await axios({
    url:`https://api.linkedin.com/v2/userinfo`,

    method:'GET',
    headers:{
        'Connection': 'Keep-Alive'  ,
        'Authorization': `Bearer ${token}`
    }

}).then(response=>{  

    appResponse.send({data:response.data,status:true})
    
}).catch(error=>{

    appResponse.status(400).send({message:error.message,status:false})
 
})
return data
}


module.exports={
    SignupAuthorization,
    Authorization,
    Redirect,
    SignupRedirect
}