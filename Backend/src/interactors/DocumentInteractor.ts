
import dotenv from "dotenv";
import { DocumentInterface } from "../interfaces/DocumentInterface";
import { Document_ } from "../entities/Document";
dotenv.config()

import * as fs from "fs";
import * as path from "path";
import { UserInteractor } from "./UserInteractor";
import { UserController } from "../controllers/UserController";
import { UserInterface } from "../interfaces/UserInterface";
import { DocumentQueryReturnType, DocumentSimilarityDataType, GeminiApiResponseDataType } from "../lib/definitions";
import { fetchFile, generateUniqueKey } from "../lib/utils";
import { geminiApi } from "../services/GeminiApiService";
import { connectDB } from "../database/database";
import { error } from "console";
import { createDocumentQuery, getDocumentByIdQuery, getDocumentsByUserIdQuery } from "../database/queries/documentQueries";

dotenv.config();

export class DocumentInteractor implements DocumentInterface {

  private documentsFolder = path.join(__dirname, "../database/documents/");
 
  private userInteractor: UserInterface;
  private userController: UserController;

  constructor() {

    this.userInteractor = new UserInteractor();
    this.userController = new UserController(this.userInteractor);

  }


  //takes the file path and returns the text  (string : string)
  private async extractTextFromFileSync(filePath: string): Promise<string |Error> {
    try {
      return fs.readFileSync(filePath, "utf-8");
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
      return new Error("Failed to read the document.");
    }
  }


  
  async getDocumentById(documentId: string): Promise<Document_ | Error> {
    const db = await connectDB();

    try {
    
      const row : undefined  |  DocumentQueryReturnType   = await getDocumentByIdQuery(documentId)


      if (!row) return new Error(`No document found with the given documentId ${documentId}`);

      const document = new Document_(row.documentId, row.userId, row.storageUrl, row.documentName, parseInt(row.documentSize), row._timestamp, row.category)
      return document;


    } catch (error) {
      console.error("Error fetching document:", error);
      throw new Error("Could not fetch document");
    } finally {
      await db.close();
    }
  }


  //fetches the documents metadata from the database and then fetches the file and adding to the metadata
  async getUserDocuments(userId: string): Promise<Document_[] | Error> {
    const db = await connectDB();

    try {
      
      const documents: undefined  | DocumentQueryReturnType[] = await getDocumentsByUserIdQuery(userId)

      if (!documents) return new Error(`Could not fetch user documents`)

       const documentEntityArray = documents.map(doc => new Document_(doc.documentId, doc.userId, doc.storageUrl, doc.documentName, parseInt(doc.documentSize), doc._timestamp, doc.category));
       documentEntityArray.forEach(async (document: Document_, index: number) => {
        const file = await fetchFile(document.getStorageUrl())


        if (file instanceof Error) {
          console.error(`Error fetching file: ${error}`);
          return new Error(`Could not fetch file `);
        }
        documentEntityArray[index].setFile(file)
      })

      return documentEntityArray;

    } catch (error) {
      console.error("Error fetching user documents:", error);
      return new Error("Could not fetch user documents");
    } finally {
      await db.close();
    }
  }

 
  // private async compareTexts(text1: string, text2: string): Promise<{ similarityPercentage: number; summary: string }> {
  //   try {

  //     // //console.log("INside the compare texts   ")
  //     // const response = await axios.post(
  //     //   "https://api.openai.com/v1/chat/completions",
  //     //   {
  //     //     model: "gpt-4",
  //     //     messages: [
  //     //       {
  //     //         role: "system",
  //     //         content: "You are a similarity checker. Given two texts, return a JSON object containing 'similarityPercentage' (a number between 0-100%) and 'summary' (a brief explanation of the similarity)."
  //     //       },
  //     //       {
  //     //         role: "user",
  //     //         content: `Compare these texts and provide a similarity percentage and a brief summary:\n\nText 1: ${text1}\n\nText 2: ${text2}`
  //     //       }
  //     //     ],
  //     //     max_tokens: 100, // Adjust as needed
  //     //   },
  //     //   {
  //     //     headers: {
  //     //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     //       "Content-Type": "application/json",
  //     //     },
  //     //   }
  //     // );

  //     // const completionText = response.data.choices[0].message.content;
  //     import OpenAI from "openai";

  //     const openai = new OpenAI({
  //       apiKey: "",
  //     });

  //     const completion = openai.chat.completions.create({
  //       model: "gpt-4o-mini",
  //       store: true,
  //       messages: [
  //         {"role": "user", "content": "write a haiku about ai"},
  //       ],
  //     });
  //     let completionText ;
  //     completion.then((result) =>   {  completionText =result.choices[0].message});

  //     // Try parsing the response as JSON

  //     let result;
  //     try {
  //       result = JSON.parse(completionText);
  //       // //console.log("Compare Text Result: ", result);
  //       return result; // ✅ Ensure a valid return
  //     } catch (error) {
  //       // console.error("Failed to parse response:", completionText);
  //       return { similarityPercentage: 0, summary: "Parsing error. Check response format." };
  //     }
  //   } catch (error) {
  //     // console.error("Error comparing texts:", error);
  //     return { similarityPercentage: 0, summary: "An error occurred while comparing texts." };
  //   }
  // }
  // private async compareTexts(text1: string, text2: string): Promise<{ similarityPercentage: number; summary: string }> {
  //   try {
  //     //console.log("Inside the compareTexts function");

  //     // const response = await axios.post(
  //     //   "https://api.openai.com/v1/chat/completions",
  //     //   {
  //     //     model: "gpt-4o-mini",
  //     //     messages: [
  //     //       {
  //     //         role: "system",
  //     //         content: "You are a similarity checker. Given two texts, return a **JSON object** containing 'similarityPercentage' (a number between 0-100) and 'summary' (a brief explanation of the similarity). **Ensure the response is valid JSON with no additional text.**"
  //     //       },
  //     //       {
  //     //         role: "user",
  //     //         content: `Compare these texts and provide a similarity percentage and a brief summary:\n\nText 1: ${text1}\n\nText 2: ${text2}`
  //     //       }
  //     //     ],
  //     //     max_tokens: 100, 
  //     //     temperature: 0,  // Lower temperature for more deterministic results
  //     //   },
  //     //   {
  //     //     headers: {
  //     //       Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  //     //       "Content-Type": "application/json",
  //     //     },
  //     //   }
  //     // );

  //     let completionText;
  //     // completionText = response.data.choices[0]?.message?.content?.trim();

  //     // // Debugging: Print raw OpenAI response
  //     // //console.log("Raw API Response:", completionText);

  //     try {
  //       // const result = JSON.parse(completionText);
  //       // //console.log("Parsed Compare Text Result: ", result);
  //       //  return result;
  //       return {similarityPercentage: 90, summary: "This is a similarity summary. "}
  //     } catch (error) {
  //       console.error("Failed to parse response:", completionText);
  //       return { similarityPercentage: 0, summary: "Parsing error. Check response format." };
  //     }
  //   } catch (error: any) {
  //     console.error("Error comparing texts:", error?.response?.data || error.message);
  //     return { similarityPercentage: 0, summary: "An error occurred while comparing texts." };
  //   }
  // }

  // async  compareTexts(text1: string, text2: string, documentId:string )  : Promise <DocumentSimilarityDataType>{
  //   // gemini
  //   console.log("here")
  //   if (!process.env.GEMINI_API_KEY) {
  //     console.log("exception")
  //     throw new Error("GEMINI_API_KEY is missing!");

  //   }

  //   const prompt = `
  //     Compare the following two texts and provide a similarity percentage (0-100%) and a short summary of the key differences or similarities.
  //     Text 1: ${text1}
  //     Text 2: ${text2}

  //     Respond in JSON format: 
  //     {
  //       "similarityPercentage": number,
  //       "summary": string
  //     }
  //   `;

  //   const data = {
  //     contents: [
  //       {
  //         parts: [
  //           {
  //             text: prompt,
  //           },
  //         ],
  //       },
  //     ],
  //   };

  //   try {
  //     console.log("Making API request to Gemini...");
  //     console.log(`Fetching URL: https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`);

  //     // const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDBqZUo72p8IAOYq9SKcpMM-CX1gabXzdQ`, {
  //     //   method: "POST",
  //     //   headers: { "Content-Type": "application/json" },
  //     //   body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  //     // });


  //     const response = await axios({
  //       method: 'POST',
  //       url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`,
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       params: {
  //         key: process.env.GEMINI_API_KEY,
  //       },
  //       data: data,
  //     });

  //     // Check if the response is not ok
  //     if (!response.ok) {
  //       const errorText = await response; // Wait for the body
  //       console.log("Error response from Gemini API:", errorText); // Log the error body
  //       throw new Error(`Error from Gemini API: ${response.status} - ${response.statusText}`);
  //     }

  //     const resdata = await response.json();

  //     // Extract the response content
  //     const rawText = resdata?.parts?.[0]?.content?.parts?.[0]?.text || "{}";

  //     // Parse the JSON response
  //     const result = JSON.parse(rawText);

  //     console.log("Result:", result);

  //     return {
  //       similarityPercentage: result.similarityPercentage || 0,
  //       summary: result.summary || "No summary provided",
  //       documentId
  //     };
  //   } catch (error) {
  //     console.error("Error comparing texts:", error);
  //     return { similarityPercentage: 0, summary: "Error processing request", documentId };
  //   }

  // }









  //uses the geminiApi function to generate similarity and return the GeminiApiResponseDataType  | Error
  async compareTexts(text1: string, text2: string, documentId: string): Promise<GeminiApiResponseDataType | Error> {

    // const genAI = new GoogleGenerativeAI(apiKey);

    // const model = genAI.getGenerativeModel({
    //   model: "gemini-2.0-flash",
    // });

    // const generationConfig = {
    //   temperature: 1,
    //   topP: 0.95,
    //   topK: 40,
    //   maxOutputTokens: 8192,
    //   responseMimeType: "text/plain",
    // };


    //   const chatSession = model.startChat({
    //     generationConfig,
    //     history: [
    //     ],
    //   });

    //   const result = await chatSession.sendMessage("");
    //   console.log(result.response.text());

    const result = await geminiApi(text1, text2);

    if (result instanceof Error) return result;


    const regex = /```json([\s\S]*?)```/;
    const match = result.match(regex);

    if (match && match[1]) {
      const jsonString = match[1].trim();
      const json = JSON.parse(jsonString)
      if (json) {
        json[documentId] = documentId;

        return json;
      }
      else return (
        {
          similarityPercentage: 0,
          summary: "Error while unmarshalling the response of the Gemini  API",
          documentId  : documentId
        }
      )



    } else {
      return (
        {
          similarityPercentage: 0,
          summary: "Error while unmarshalling the response of the Gemini  API",
          documentId: documentId
        }
      )
    }

  }


//compares the input document with every document returned by the getUsersDocument:Document[], and returns DocumentSimilarityDataType[]
  async compareDocument(userId: string, documentId: string): Promise<DocumentSimilarityDataType[] | Error> {

    try {
      const documentInfo : Document_  | Error= await this.getDocumentById(documentId);  
      if ( documentInfo instanceof Error)  return documentInfo;

      const userFiles: Error | Document_[] =await  this.getUserDocuments(userId);   

      if(userFiles instanceof Error) return userFiles;

      const uploadedText =await  this.extractTextFromFileSync(documentInfo.getStorageUrl());
      if (uploadedText instanceof Error) return uploadedText;

      let matchingFiles: DocumentSimilarityDataType[] = [];


      for (const document of userFiles) {
        const docId =document.getDocumentId()
        if (docId === documentId) continue; 

        const fileText = await this.extractTextFromFileSync(document.getStorageUrl());
        if (fileText instanceof Error) continue;

        
        const similarity: Error  | GeminiApiResponseDataType = await this.compareTexts(uploadedText, fileText, docId);
        if(similarity instanceof Error) return similarity;
        // console.log("Similaritty % ", similarity.similarityPercentage)
        // console.log("Similarity summary  ", similarity.summary)

        if (similarity.similarityPercentage >= 60) {
         
          const similarDocument : DocumentSimilarityDataType= {
            document: document as Document_,
            documentId: docId,
            similarityPercentage: similarity.similarityPercentage,
            summary: similarity.summary
          }
          matchingFiles.push(similarDocument)
        }
        
      }

      return matchingFiles;
    } catch (error) {
      // console.error("Error in compareDocument:", error);
      return new Error("Internal server error");
    }
  }



  //returns Document | Error
  async createDocument({
    file,
    documentSize,
    _timestamp,
    userId,
    fileName,
    category
  }: {
    file: Express.Multer.File;
    documentSize: number;
    _timestamp: string;
    userId: string;
    fileName: string;
    category: string;
  }): Promise<Document_ | Error> {
    const db = await connectDB();
    try {
    
      if (!fs.existsSync(this.documentsFolder)) {
        fs.mkdirSync(this.documentsFolder, { recursive: true });
      }

      const documentId: string = generateUniqueKey();

  
      const storedFileName = `${documentId}_${fileName}`;
      const storageUrl = path.join(this.documentsFolder, storedFileName);

      fs.writeFileSync(storageUrl, file.buffer);


      const document = new Document_(documentId,userId,storageUrl,storedFileName,documentSize,_timestamp,category)
   

      const result = await createDocumentQuery(document)

      if(!result)  return new Error("Failed to insert data  in the database");

     

      return document;
    } catch (error) {
      console.error("Error creating document:", error);
      return new Error("Failed to store document.");
    }finally{
      await db.close();
    }
  }

  



}



