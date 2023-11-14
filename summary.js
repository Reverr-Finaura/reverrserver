require('dotenv').config()
const OpenAI =require('openai').OpenAI;
const openai = new OpenAI();

async function summary(des,title,details) {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
            role: "system", 
            content: "You are an AI resume creator." 
        },
        {
            role: 'user',
        content: `
        consider following details of a candiate's resume along with the job title and job description:
                    Resume:${details}
                    Job Title:${title}
                    Job Description:${des}
                    Generate a ATS friendly proffessional Summary based on the job title and description mentioned.
                    Don't create new information, format from only what's provided
                    `,
      
        }
    ],
      model: "gpt-3.5-turbo",
    });
  
    console.log(completion.choices[0].message.content);
    var content = JSON.parse(completion.choices[0].message.content)
    return content;
  }
  
//main(input);

module.exports = summary;