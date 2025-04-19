import * as fs from "fs";
import * as path from "path";


export function generateUniqueKey(length: number = 8): string {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    
    return result;
  }


   export async function fetchFile(storageUrl: string): Promise<Buffer | Error> {
     try {
         const filePath = path.resolve(storageUrl);
 
         
         if (!fs.existsSync(filePath)) {
             throw new Error("File not found.");
         }
 
         
         return fs.promises.readFile(filePath);
     } catch (error) {
         console.error("Error fetching file:", error);
         return new Error("Could not fetch the file.");
     }
 }

 export function isValidPassword(password: string) {

  if (password.length < 8) {
    return false;
  }


  const regex = /^[A-Za-z\d@$!%*?&]{8,}$/;

  return regex.test(password);
}
  
 export function isValidEmail(email: string): boolean {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}


