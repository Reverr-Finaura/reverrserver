require('dotenv').config()
const OpenAI =require('openai').OpenAI;
const openai = new OpenAI();

async function resume(des,title,details) {
    const completion = await openai.chat.completions.create({
      messages: [
        { 
            role: "system", 
            content: "You are an AI resume creator." 
        },
        {
            role: 'user',
        content: `
        consider following details of resume along with the job title and job description:
                    Resume:${details}
                    Job Title:${title}
                    Job Description:${des}
                    Generate a ATS friendly resume for the job title and description mentioned with the following sections for the mentioned job description:
                    Professional Summary, Education, Projects, Experience, Skills and Interests, Achievements (if any)
                    Respond in json format with the extact key value as the section provided to you.
                    Respond only with the generated resume text.
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
    var content = JSON.parse(completion.choices[0].message.content)
    return content;
  }
  
//main(input);

module.exports = resume;