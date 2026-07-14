const { GoogleGenAI } = require("@google/genai");
const z = require("zod");
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY    
});

// 1. Define your exact, original Zod Schema
const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100).describe("The match score between the candidate's resume and the job description, on a scale of 0 to 100"),

    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question that can be asked during the interview"),
        intention: z.string().describe("The intention of the interviewer behind the technical question"),
        answer: z.string().describe("How to answer the question, what points to cover, what approach to take")
    })).describe("Technical questions that can be asked in the interview along with their intention and how to answer them"),

    behaviouralQuestions: z.array(z.object({
        question: z.string().describe("The behavioural question that can be asked during the interview"),
        intention: z.string().describe("The intention of the interviewer behind the behavioural question"),
        answer: z.string().describe("How to answer the question, what points to cover, what approach to take")
    })).describe("Behavioural questions that can be asked in the interview along with their intention and how to answer them"),

    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill that the candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("The severity of the skill gap, whether it is low, medium or high")
    })).describe("List of skill gaps that the candidate has along with their severity"),

    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number of the preparation plan"),
        focus: z.string().describe("The focus of the preparation plan for that day"),
        tasks: z.array(z.string()).describe("The tasks to be completed on that day for the preparation plan")
    })).describe("A day-wise preparation plan for the candidate to prepare for the interview, with focus areas and tasks to be completed on each day"),
    title: z.string().describe("The title of the job for which the interview report is generated"),
});

// 2. Tiny helper to convert Zod directly into a flat JSON tree structure without $defs shortcuts
function cleanZodSchema(schema) {
    if (schema instanceof z.ZodObject) {
        const properties = {};
        const required = [];
        for (const [key, value] of Object.entries(schema.shape)) {
            properties[key] = cleanZodSchema(value);
            if (!value.isOptional()) required.push(key);
        }
        return { type: "OBJECT", properties, required };
    } else if (schema instanceof z.ZodArray) {
        return { type: "ARRAY", items: cleanZodSchema(schema.element) };

        if (currentKey === "preparationPlan") {
            arraySchema.minItems = 7;
            arraySchema.maxItems = 7;
        }
        return arraySchema;

    } else if (schema instanceof z.ZodEnum) {
        return { type: "STRING", enum: schema.options };
    } else if (schema instanceof z.ZodNumber) {
        return { type: "NUMBER" };
    } else if (schema instanceof z.ZodString) {
        return { type: "STRING" };
    } else if (schema instanceof z.ZodEffects) { // For refinements
        return cleanZodSchema(schema.innerType());
    } else if (schema._def && schema._def.innerType) {
        return cleanZodSchema(schema._def.innerType);
    }
    return { type: "STRING" }; // Safe default fallback
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `Generate a comprehensive, highly detailed 7-day interview preparation plan and report for the candidate based on the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}`;
    
    // Convert your Zod rules natively right here
    const cleanSchema = cleanZodSchema(interviewReportSchema);

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cleanSchema 
            }
        });
        
        // Parse the safe layout and validate it directly against Zod to be 100% type-safe
        const rawJson = JSON.parse(response.text);
        const structuredReport = interviewReportSchema.parse(rawJson);

        return structuredReport;

    } catch (error) {
        console.error("Structured Output Error:", error);
    }
}

async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({ format: 'A4', margin: {
        top:"20mm",
        bottom:"20mm",
        left:"15mm",
        right:"15mm"
    } 
});
    await browser.close();
    return pdfBuffer;
}

async function generateResumePdf({ resume, selfDescription, jobDescription }) {
 
    const resumePdfSchema = z.object({
        html: z.string().describe("The HTML content of the resume which can be converted to PDF using any library like pupeeteer "),
    })

    const prompt = `Generate a resume for a candidate with the following details:
                    Resume: ${resume}
                    Self Description: ${selfDescription}
                    Job Description: ${jobDescription}
                    the format should be in HTML and should be suitable for converting to PDF using libraries like Puppeteer.
                    The resume should be tailored for the given job description and should highlight the candidate's strength and relevant experience. The HYTML content should be well-formatted and structured, making it easy to read and visually appealing.
                    The content of the resume should not sound like it's generated by AI and should be as close as possbile to a real human-written resume 
                    You can highlight the content using some colors or different font styles but the overall design should be simple and proffesional
                    The content should be ATS friendly, i.e should be easily parsable by ATS system without losing important information.
                    The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chance of getting an interview call for the given job description.  `
                    

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash", 
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: cleanZodSchema(resumePdfSchema)
        }
    })

    const jsonContent = JSON.parse(response.text)

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer


}

module.exports = {generateInterviewReport, generateResumePdf};