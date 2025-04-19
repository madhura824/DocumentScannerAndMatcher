const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = 'AIzaSyBeUakBVyEjLcg1zLrFzrfp7uENCRaEKB8';
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };
  
  export async function geminiApi(text1:string, text2: string): Promise<string | Error> {
    try{
        const chatSession = model.startChat({
            generationConfig,
            history: [
            ],
          });
          const prompt = `Please compare the following two texts and provide a similarity percentage (0-100) and a brief summary of their key similarities. Respond in JSON format:

          {
            similarityPercentage: <number>,
            summary: <one-sentence summary of similarities in the texts' shared topic>"
          }
          
          Text 1: ${text1}
          Text 2: ${text2}`
          
          const result = await chatSession.sendMessage(prompt);
          const resultText =result.response.text();
          console.log(resultText)
          return resultText
    }
    catch(error){
        console.log((error as Error).message)
        return new Error(`An unexpected error occurred: ${(error as Error).message}`)
    }
    
  }
  
  