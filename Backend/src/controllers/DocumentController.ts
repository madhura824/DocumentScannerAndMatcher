

import { NextFunction, Request, Response } from "express";
import { controllersResponseType, DocumentSimilarityDataType } from "../lib/definitions";
import { DocumentInterface } from "../interfaces/DocumentInterface";
import { Document_ } from "../entities/Document";
import { UserController } from "./UserController";
import { UserInteractor } from "../interactors/UserInteractor";
import { UserInterface } from "../interfaces/UserInterface";
export class DocumentController {
  private documentInteractor : DocumentInterface;
  private userController: UserController;
  private userInteractor: UserInterface
  constructor(documentInteractor : DocumentInterface){
    this.documentInteractor = documentInteractor;
    this.userInteractor= new UserInteractor()
    this.userController = new UserController(this.userInteractor)

  }

  //response: {responseCode: number , message: Error: string  | Document: Document }
  async onCreateDocument( {file  , documentSize, uploadedOn , uploadedBy ,fileName, category} : {file : Express.Multer.File, documentSize: number, uploadedOn : string , uploadedBy: string,fileName:string, category: string}): Promise<controllersResponseType>{
    try{
     
      const data : Document_ | Error= await this.documentInteractor.createDocument({file, documentSize,_timestamp:uploadedOn,userId:uploadedBy,fileName, category});
      if(data instanceof Error){
        return {
          responseCode: 500,
          message: (data as Error).message

        }
      }
      const userResponse: controllersResponseType = await this.userController.onIncreaseUsedCredits(uploadedBy)
      if(userResponse.responseCode !==200 ) return {
        responseCode: userResponse.responseCode,
        message:  `Error occurred while incrementing user: ${userResponse.message}`
      }

      return {
        responseCode:200,
        message: 
           data as Document_,
         

        
      }
   


    }
    catch(error ){
    return{
      responseCode: 500,
      message: "Internal server error"
    }
    }
   
  }

  
  async onFetchDocument(req: Request, res: Response, next: NextFunction): Promise<any> {   

    try{


      const body = req.body;

      const data = await this.documentInteractor.getDocumentById(body);
      return res.status(200).json({ message: data });

    }catch(error){
      next(error)
    }
    
  }

  // response :    responseCode: number, message: DocumentSimilarityDataType[]   | Error: string
  async onCompareDocument(userId: string , documentId: string): Promise<controllersResponseType> {
    
    const data: DocumentSimilarityDataType[]   | Error = await this.documentInteractor.compareDocument(userId,documentId);
    if(data instanceof Error) return {responseCode : 500, message : (data as Error).message}
    return {responseCode: 200 , message: data}
  }



}
