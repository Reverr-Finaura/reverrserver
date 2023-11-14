require('dotenv').config()
const OpenAI =require('openai').OpenAI;
const openai = new OpenAI();

async function jobdes(des,title,start_date,end_date,job_title,job_des) {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
            role: "system", 
            content: "You are an AI resume creator." 
        },
        {
            role: 'user',
          content: `Task: rewrite these responsibilities"${job_des}" for the position of ${job_title} in such a way that it uses some keywords from the job description. the content should be relevant to the position mentioned
          Style: Business
          Tone: Professional
          Length: 50 words
          Format: markdown
          Job Description:${des}


          `
          //`take some keyowrds from Job Description:${des}
        //  and update this text in such a way that it is relevant to his position ${job_title}, and incorportes those keyowrds as well
        //  ${job_des}
        //  Note-
        //  -Don't deviate from his actual position
        //  -Don't make it for the job Description
        //  - don't exceed 50 words         
        //  `
        // `the candidate has worked on 
        // Position worked:${job_title} from start date:${start_date} to end date:${end_date}, and these were their role:${job_des}
        // consider these details of the candiate and provide a updated role text based on the job title and description
        //             Job Title(the one he's applying for):${title}
        //             Job Description:${des},
                    
        //             Note-
        //             Don't create new information, format from only what's provided
        //             Don't create new job title, and keep the text relevant to the position he worked 
        //             pick some relevant keywords for the Job Description, and use them while creating the role text 
        //             don't exceed 50 words
        //             `,

      
        }
    ],
      model: "gpt-3.5-turbo",
    });
  
    console.log(completion.choices[0].message.content);
    var content = completion.choices[0].message.content
    return content;
  }
  
//main(input);

module.exports = jobdes;