
import express, { Request, Response, NextFunction, Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserInteractor } from "../interactors/UserInteractor";
import { UserInterface } from "../interfaces/UserInterface";
import jwt from "jsonwebtoken";
import { controllersResponseType } from "../lib/definitions";
const secretkey = process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY : ""
export class UserRoutes {
  private router: Router;
  private userInteractor: UserInterface;
  private userController: UserController;


  constructor() {
    this.router = Router();
    this.userInteractor = new UserInteractor();
    this.userController = new UserController(this.userInteractor);


    
    this.router.get("/fetch-credits-left", this.onFetchCreditsLeft.bind(this));
    this.router.post("/increase-credits", this.onIncreaseCredits.bind(this));
    this.router.get("/get-user", this.onGetUser.bind(this));
    this.router.post("/sign-up", this.onSignUp.bind(this));
    this.router.post("/login", this.onLogin.bind(this));
    this.router.get("/fetch-all-requests", this.onFetchAllRequests.bind(this));
    this.router.get("/fetch-all-categories-by-userid", this.onFetchAllCategoriesByUserId.bind(this))
    this.router.get('/fetch-credit-request', this.onFetchCreditRequestByUserId.bind(this));
    this.router.get("/fetch-all-documents-by-user-id", this.onFetchAllDocumentsByUserId.bind(this))

  }

  async onFetchAllDocumentsByUserId(req: Request, res: Response, next: NextFunction): Promise<any>{
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }
      const token = authHeader.split(" ")[1];
  
  
  
      const decoded: any = jwt.verify(token, secretkey);
      const userId = decoded.userId;
      const userName = decoded.userName;
  
      if (!userId || !userName) {
        return res.status(401).json({ message: "Invalid token data" });
      }
  
      const databody: controllersResponseType = await this.userController.onFetchAllDocumentsByUserId(userId);
  
      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  
  
  }
async onFetchAllCategoriesByUserId(req: Request, res: Response, next: NextFunction): Promise<any>{
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];



    const decoded: any = jwt.verify(token, secretkey);
    const userId = decoded.userId;
    const userName = decoded.userName;

    if (!userId || !userName) {
      return res.status(401).json({ message: "Invalid token data" });
    }

    const databody: controllersResponseType = await this.userController.onFetchAllCreditRequestsById(userId);

    return res.status(databody.responseCode).json({ message: databody.message });
  } catch (error) {
    next(error);
  }


}
  async onFetchAllRequests(req: Request, res: Response, next: NextFunction): Promise<any>{

    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }
      const token = authHeader.split(" ")[1];



      const decoded: any = jwt.verify(token, secretkey);
      const userId = decoded.userId;
      const userName = decoded.userName;

      if (!userId || !userName) {
        return res.status(401).json({ message: "Invalid token data" });
      }

      const databody: controllersResponseType = await this.userController.onFetchAllCreditRequestsById(userId);

      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  }

  
  //request: auth,    {responseCode : number , message: creditsLeft: number | Error:  string}
  async onFetchCreditsLeft(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }
      const token = authHeader.split(" ")[1];



      const decoded: any = jwt.verify(token, secretkey);
      const userId = decoded.userId;
      const userName = decoded.userName;

      if (!userId || !userName) {
        return res.status(401).json({ message: "Invalid token data" });
      }

      const databody: controllersResponseType = await this.userController.onFetchCreditsLeft(userId);

      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  }



  //request:  auth,   body:  increaseBy: number
  //response: responseCode: number ,    message: Error: string , number
  async onIncreaseCredits(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }
      const token = authHeader.split(" ")[1];

      const decoded: any = jwt.verify(token, secretkey);
      const userId = decoded.userId;
      const userName = decoded.userName;

      if (!userId || !userName) {
        return res.status(401).json({ message: "Invalid token data" });
      }
      const increaseBy: number = req.body.increaseBy;

      if (increaseBy < 1 || increaseBy > 5) return res.status(400).json({ message: `You can request only uptill 5 credits.` })

        console.log("increase by in updated user routes ",increaseBy, typeof increaseBy)
      const databody: controllersResponseType = await this.userController.onIncreaseCredits(userName, increaseBy);

      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  }

  //request:   auth
  //response:   responsecode : number message:   User | Error: string
  async onGetUser(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      console.log("here")
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }
      console.log(authHeader)

      const token = authHeader.split(" ")[1];
      console.log(token)
      try {

        const decoded: any = jwt.verify(token, secretkey);
        console.log(decoded)
        const userId = decoded.userId;
        const userName = decoded.userName;
        console.log(userName, userId)
        if (!userId || !userName) {
          return res.status(401).json({ message: "Invalid token data" });
        }

        const databody = await this.userController.onGetUser(userId);
        return res.status(databody.responseCode).json({ message: databody.message });
      } catch (error) {
        console.log((error as Error).message)
        return res.status(401).json({ message: `${(error as Error).message}. Please login again.` });
      }
    } catch (error) {
      next(error);
    }
  }

  //request:  userName,password
  //response: responseCode : number ,  message : Error: string | Token : string
  async onSignUp(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = req.body as {
        userName: string,
        password: string
      };

      if (!data || !data.userName || !data.password) {
        return res.status(400).json({ message: "Invalid data" });
      }


      const userName = data.userName;
      const password = data.password;

      const databody = await this.userController.onSignUp(userName, password);

      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  }





  //request:   userName,password
  //response:   responseCode : number , message: Error:string | Token : string
  async onLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = req.body as {
        userName: string,
        password: string
      };

      if (!data || !data.userName || !data.password) {
        return res.status(400).json({ message: "Invalid data" });
      }


      const userName = data.userName;
      const password = data.password;

      const databody = await this.userController.onLogin(userName, password);

      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  }


  //req: auth
  //responseCode : number , {message :   string , CreditRequestDataType}
  async onFetchCreditRequestByUserId(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      console.log("inside fetch credit request by id")
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }
      console.log(authHeader)

      const token = authHeader.split(" ")[1];
      console.log("token in the fetch credit request  ", token)
      try {

        const decoded: any = jwt.verify(token, secretkey);
        console.log(decoded)
        const userId = decoded.userId;
        const userName = decoded.userName;
        console.log(userName, userId)
        if (!userId || !userName) {
          return res.status(401).json({ message: "Invalid token data" });
        }
        console.log("Before calling the user  controlller fetchCreditRequest")
        const databody = await this.userController.onFetchRequestByUserId(userId);
        return res.status(databody.responseCode).json({ message: databody.message });


      }
      catch (error) {

      }
    } catch (error) {

    }


  }
  getRouter() {
    return this.router;
  }
}
