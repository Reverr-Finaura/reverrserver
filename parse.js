require('dotenv').config()

// process.env.OPENAI_API_KEY
const OpenAI =require('openai').OpenAI;
const openai = new OpenAI();

async function responsecreate(pdfText) {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
            role: "system", 
            content: "You are an AI resume extractor." 
        },
        {
            role: 'user',
        content: `
        Consider the following raw resume text extracted from a user's resume PDF delimited between ### ###:
        ###${pdfText}###
        --------------------------------------------------------------
        Generate a valid JSON response with the extracted resume text in a similar format
{
        jobTitle: '',
        firstName: '',
        middleName: '',
        lastName: '',
        inputEmail: '',
        phone: '',
        dateOfBirth: '',
        city: '',
        address: '',
        postalCode: '',
        drivingLicense: '',
        nationality: '',
        placeOfBirth: '',
        country: '',
        professionalSummary: '',
        uploadedPhotoURL: '',
        employmentHistory: [
            {
                jobTitle: '',
                employer: '',
                startDate: '',
                endDate: '',
                city: '',
                description: '',
            },
        ],
        educationHistory: [
            {
                school: '',
                degree: '',
                startDate: '',
                endDate: '',
                city: '',
                description: '',
            },
        ],
        websitesLinks: [
            {
                name: '',
                url: '',
            },
        ],
    }

        Note:
        - Generate JSON with section names as keys and text extracted from the resume as values.
        - Provide a single-line JSON response. 
        - Respond only with the generated JSON response.
        - Do not add new lines; keep the text as in the resume.
        - If the PDF does not seem to be a resume, return an error message.
        -use lower case only
        `,
      
        }
    ],
      model: "gpt-3.5-turbo",
    });
  
    console.log(completion.choices[0].message.content);
    console.log(typeof completion.choices[0].message.content);
    var temp = JSON.parse(completion.choices[0].message.content)
    console.log(temp)
    // console.log(temp.projects)
    return temp;
  }
  
//main(input);

module.exports = responsecreate;