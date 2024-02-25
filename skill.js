require('dotenv').config()
const OpenAI =require('openai').OpenAI;
const openai = new OpenAI();

async function skill(title,exp) {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
            role: "system", 
            content: "You are an AI resume creator." 
        },
        {
            role: 'user',
        content: `
        consider following experience of a candidate:
                    ${exp}
                    Generate a array of skills based on his experience and also add some skills that you think he might have based on his experience and relevant to this position ${title}.
                    Respond only with the array of skills.
                    use lower case only
        `,
      
        }
    ],
      model: "gpt-3.5-turbo-1106",
    });
  
    console.log(completion.choices[0].message.content);
    var content = JSON.parse(completion.choices[0].message.content)
    return content;
  }
  
//main(input);

module.exports = skill;