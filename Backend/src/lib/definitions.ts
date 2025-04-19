import { Document_ } from "../entities/Document";
export interface controllersResponseType {
  responseCode: number;
  message: any;
}


export interface FileDataType {
  fileId: string, documentSize: number, uploadedOn: string, uploadedBy: string, fileName: string, storageUrl: string
}


export interface DocumentSimilarityDataType {
  document: Document_,
  documentId: string, similarityPercentage: number, summary: string
}




export interface GeminiApiResponseDataType {
  similarityPercentage: number, summary: string, documentId: string
}


export interface CreditRequestDataType {
  requestId: string,
  _timestamp: string,
  userId: string,

  requestedCredits: number,
  flag: 'approved' | 'denied' | 'pending'
}


export interface UserQueryReturnType {
  userId: string;
  userName: string;
  totalCredits: string;
  creditsUsed: string;
  _password: string;
}
export interface DocumentQueryReturnType {
  documentId: string;
  documentName: string;
  userId: string;
  storageUrl: string;
  documentSize: string;
  _timestamp: string;
  category: string;
  file?: Buffer;


}

export interface RequestQueryReturnType {

  requestId: string,
  userId: string,
  _timestamp: string,
  requestedCredits: string,
  flag: 'approved' | 'pending' | 'denied'

}
export interface AdminQueryReturnType {
  adminId: string;
  adminName: string;

  _password: string;


}