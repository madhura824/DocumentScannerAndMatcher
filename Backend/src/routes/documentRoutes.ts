import { Request, Response, NextFunction, Router } from "express";

import jwt from "jsonwebtoken";
import { Document_ } from "../entities/Document";
import { DocumentInterface } from "../interfaces/DocumentInterface";
import { DocumentController } from "../controllers/DocumentController";
import { DocumentInteractor } from "../interactors/DocumentInteractor";
import { UserInteractor } from "../interactors/UserInteractor";
import { UserController } from "../controllers/UserController";
import { controllersResponseType } from "../lib/definitions";
import multer from "multer";
import { UserInterface } from "../interfaces/UserInterface";
import { User } from "../entities/User";

const upload = multer({ storage: multer.memoryStorage() });
const secretkey = process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY : ""
export class DocumentRoutes {
  private router: Router;
  private documentInteractor: DocumentInterface;
  private documentController: DocumentController;
  private userInteractor: UserInterface;
  private userController: UserController;
  constructor() {
    this.router = Router();
    this.documentInteractor = new DocumentInteractor();
    this.documentController = new DocumentController(this.documentInteractor);
    this.userInteractor = new UserInteractor();
    this.userController = new UserController(this.userInteractor)
    this.router.post("/scan", upload.single('file'), this.onScan.bind(this));
    this.router.post("/compare-doc", this.onCompareDocument.bind(this));



  }


  //request: auth,  body: documentId
  //response : {responseCode : number , message: DocumentSimilarityDataType[]   | Error : string }
  async onCompareDocument(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
      }
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, secretkey);
      const userId = decoded.userId;
      const userName = decoded.userName;

      if (!userId || !userName) {
        return res.status(401).json({ message: 'Invalid token data' });
      }

      const documentId = req.body.documentId;

      if (!documentId) return res.status(400).json({ message: "Invalid document ID" })

      const response = await this.documentController.onCompareDocument(userId as string, documentId as string);

      return res.status(response.responseCode).json({ message: response.message })

    } catch (error) {
      next(error);


    }

  }



  // req: auth, file added by multer object, documentSize, _timestamp, fileName
  //response: {responseCode, {message: Error: string  | Document: Document }}
  async onScan(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
      }

      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, secretkey);
      const userId = decoded.userId;
      const userName = decoded.userName;

      if (!userId || !userName) {
        return res.status(401).json({ message: 'Invalid token data' });
      }

      const file = req.file; 
      const { documentSize, _timestamp, fileName, category }: { documentSize: number; _timestamp: string; fileName: string, category: string } = req.body;


      if (!file) {
        return res.status(400).json({ message: 'No file uploaded. Please provide a valid file.' });
      }

      const fileSize = documentSize
      if (isNaN(fileSize) || fileSize <= 0) {
        return res.status(400).json({ message: 'Invalid document size.' });
      }
      if (!_timestamp || isNaN(Date.parse(_timestamp))) {
        return res.status(400).json({ message: 'Invalid timestamp provided.' });
      }

      const databody: controllersResponseType = await this.userController.onGetUser(userId);


      if (databody.responseCode != 200) return res.status(databody.responseCode).json({ message: databody.message });
      const user = databody.message as User;
       const creditsRemaining =  user.getTotalCredits- user.getCreditsUsed;
      console.log("onGetUser  ", databody.message)
      console.log("Credits remaining: ", creditsRemaining)
      if (databody.responseCode === 200 && creditsRemaining > 0) {

        const createDocumentResponse: controllersResponseType = await this.documentController.onCreateDocument({
          file,
          documentSize: fileSize,
          uploadedBy: userId,
          uploadedOn: _timestamp,
          fileName,
          category
        });
        const data: string | Document_ = createDocumentResponse.message;
        return res.status(createDocumentResponse.responseCode).json({ message: data });

      } else {
        return res.status(400).json({ message: "No more credits left. Credits will restore tomorrow. Or you can request more credits as well." });

      }

    } catch (error) {
      next(error);
    }
  }

  getRouter() {
    return this.router;
  }
}
