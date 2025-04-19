import { Document_ } from "../entities/Document";
import { DocumentSimilarityDataType } from "../lib/definitions";

export interface DocumentInterface {

  createDocument({file,documentSize,_timestamp,userId,fileName}: {file: Express.Multer.File;documentSize: number; _timestamp: string;userId: string;fileName: string; category: string}): Promise<Document_| Error>;
  getDocumentById(documentId: string): Promise<Document_ | Error>
  compareDocument(userId:string, documentId : string) : Promise<DocumentSimilarityDataType[]   | Error>;
}