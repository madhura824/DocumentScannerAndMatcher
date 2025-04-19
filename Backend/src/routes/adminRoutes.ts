import express, { Request, Response, NextFunction, Router } from "express";

import jwt from "jsonwebtoken";
import { AdminInteractor } from "../interactors/AdminInteractor";
import { AdminController } from "../controllers/AdminController";
import { AdminInterface } from "../interfaces/AdminInterface";
import { controllersResponseType } from "../lib/definitions";
import { UserController } from "../controllers/UserController";
import { UserInterface } from "../interfaces/UserInterface";
import { UserInteractor } from "../interactors/UserInteractor";
const secretkey = process.env.JWT_SECRET_KEY ? process.env.JWT_SECRET_KEY : ""
export class AdminRoutes {
  private router: Router;
  private adminInteractor: AdminInterface;
  private adminController: AdminController;
  private userInteractor: UserInterface;
  private userController: UserController;

  constructor() {
    this.router = Router();
    this.adminInteractor = new AdminInteractor();
    this.adminController = new AdminController(this.adminInteractor);
    this.userInteractor = new UserInteractor();
    this.userController = new UserController(this.userInteractor);

    this.router.post("/login", this.onLogin.bind(this));
    this.router.get("/get-admin", this.onGetAdmin.bind(this));
    this.router.post("/increase-credits-request", this.onIncreaseCredits.bind(this));
    this.router.get("/fetch-pending-requests", this.onFetchPendingCreditRequests.bind(this));
    this.router.post("/approve-credits", this.onProcessCredits.bind(this));
    this.router.get("/fetch-users-by-credit-usage", this.fetchUsersOnCreditUsage.bind(this));
    this.router.get("/fetch-categories-and-count", this.fetchCategoriesAndCount.bind(this));
    



  }





  //req : Auth Token    res: {responseCode ,  message : Admin | string}
  async onGetAdmin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {

      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: Missing or invalid token" });
      }


      const token = authHeader.split(" ")[1];

      try {


        const decoded: any = jwt.verify(token, secretkey);
        const userId = decoded.userId;
        const userName = decoded.userName;

        if (!userId || !userName) {
          return res.status(401).json({ message: "Invalid token data" });
        }

        const databody = await this.adminController.onGetAdmin(userId);

        return res.status(databody.responseCode).json({ message: databody.message });
      } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
      }
    } catch (error) {
      next(error);
    }
  }




  //request body :   {userName, password}  { response:  responseCode , message: {token: string | error: string}}
  async onLogin(req: Request, res: Response, next: NextFunction): Promise<any> {
    try {
      const data = req.body as {
        userName: string,
        password: string
      };

      if (!data || !data.userName || !data.password) {
        return res.status(400).json({ message: "Invalid data" });
      }


      const adminName = data.userName;
      const password = data.password;

      const databody: controllersResponseType = await this.adminController.onLogin(adminName, password);

      return res.status(databody.responseCode).json({ message: databody.message });
    } catch (error) {
      next(error);
    }
  }


  //user sent a increase credits request
  //  request: auth , credits: number    response :    responseCode: number,message: {CreditRequestDataType: object  | Error: string} 
  async onIncreaseCredits(req: Request, res: Response, next: NextFunction): Promise<any> {
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
      const requestedCredits: number = req.body.credits;
      console.log("Inside the admin routes:  ", requestedCredits, typeof requestedCredits)

      if (!requestedCredits || requestedCredits < 0 || requestedCredits > 5) {
        return res.status(400).json({ message: "You can request at max 5 credits" })
      }

      const response: controllersResponseType = await this.adminController.onRequestCredits(userId, requestedCredits);
      return res.status(response.responseCode).json({ message: response.message })


    }
    catch (error) {

      return res.status(500).json({ message: (error as Error).message })

    }


  }

  //request: auth,      response : responseCode : number   message : {Error: string | CreditRequestDataType[]}
  async onFetchPendingCreditRequests(req: Request, res: Response, next: NextFunction): Promise<any> {
    // //console.log(1)
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


    // //console.log(1)
    const response = await this.adminController.onFetchPendingCreditRequests();
    // //console.log(2)
    // //console.log("response of fetch pending requests:  ", response )
    return res.status(response.responseCode).json({ message: response.message })

  }






  //request: auth , requestBody :  userId,flag, creditsRequested, requestId
  //response :   responseCode ,   message {Error: string | User: User}
  async onProcessCredits(req: Request, res: Response, next: NextFunction): Promise<any> {

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, secretkey);
    const adminId = decoded.userId;
    const adminName = decoded.userName;

    if (!adminId || !adminName) {
      return res.status(401).json({ message: 'Invalid token data' });
    }

    const userId: string = req.body.userId;
    const flag: 'approved' | 'denied' = req.body.flag;
    const creditsRequested: number = req.body.creditsRequested;
    const requestId = req.body.requestId;



    if (!userId || !creditsRequested || isNaN(creditsRequested) || creditsRequested < 0 || creditsRequested > 5 || !requestId || !flag || (flag != "approved" && flag != "denied")) {
      return res.status(400).json({ message: "Bad Request. The userId, requested credits, or the flag is not valid" })
    }

    const isValidUser: controllersResponseType = await this.userController.onGetUser(userId)


    if (isValidUser.responseCode != 200) return res.status(isValidUser.responseCode).json({ message: isValidUser.message.toString() })
    const response: controllersResponseType = await this.adminController.onProcessCredits(userId, creditsRequested, requestId, flag);

    return res.status(response.responseCode).json({ message: response.message });

  }
  //request:   auth
  //response : {message :string | User[]}
  async fetchUsersOnCreditUsage(req: Request, res: Response, next: NextFunction): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, secretkey);
    const adminId = decoded.userId;
    const adminName = decoded.userName;

    if (!adminId || !adminName) {
      return res.status(401).json({ message: 'Invalid token data' });
    }


    const response = await this.userController.onFetchUsersByCreditUsage();
    console.log(response.message)
    return res.status(response.responseCode).json({ message: response.message });



  }


  //request: auth
  //response :   {responseCode : number , message: Error: string | category: string; count: number; }[] }

  async fetchCategoriesAndCount(req: Request, res: Response, next: NextFunction): Promise<any> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized: Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, secretkey);
    const adminId = decoded.userId;
    const adminName = decoded.userName;

    if (!adminId || !adminName) {
      return res.status(401).json({ message: 'Invalid token data' });
    }



    const response: controllersResponseType = await this.adminController.onFetchCategoriesAndCount();
    console.log(response.message)
    return res.status(response.responseCode).json({ message: response.message });



  }




  getRouter() {
    return this.router;
  }
}
