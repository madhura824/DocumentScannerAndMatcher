
require('dotenv').config();
import bcrypt from "bcrypt";
import { AuthService } from "../services/AuthenticationService";
import { Admin } from "../entities/Admin"
import { AdminInterface } from "../interfaces/AdminInterface";
import { controllersResponseType, CreditRequestDataType } from "../lib/definitions";
import { isValidEmail, isValidPassword } from '../lib/utils'

import { User } from "../entities/User";
import { UserInteractor } from "../interactors/UserInteractor";
const jwtSecretKey = process.env.JWT_SECRET_KEY;

export class AdminController {

  private adminInteractor: AdminInterface;
  private userInteractor: UserInteractor;
  private authService = new AuthService(jwtSecretKey ? jwtSecretKey : "");
  constructor(adminInteractor: AdminInterface) {
    this.adminInteractor = adminInteractor;
    this.userInteractor = new UserInteractor()
  }





  //  {responseCode: number, message : token: string | error : string }
  async onLogin(adminName: string, password: string): Promise<controllersResponseType> {

    console.log(adminName, password)
    if (!isValidEmail(adminName)) return ({ responseCode: 400, message: "Enter a valid email-ID as username" });


    if (!isValidPassword(password)) return ({ responseCode: 400, message: "Enter a valid password. It should have minimum 8 digits and must include character, special symbol and digit" });

    const admin: Admin | Error = await this.adminInteractor.fetchAdminByName(adminName);

    if (admin instanceof Error) {
      return { responseCode: 400, message: admin.toString() }

    }

    const hashedPassword = (admin as Admin).getAdminPassword

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {

      const token = this.authService.generateToken((admin as Admin).getAdminId, (admin as Admin).getAdminName);

      return {
        responseCode: 200, message: token
      }
    } else {
      return {
        responseCode: 400,
        message: "Incorrect Password.",
      };




    }


  }

  async onGetAdmin(userId: string): Promise<controllersResponseType> {


    const response: Admin | Error = await this.adminInteractor.getAdminByID(userId)
    if (response instanceof Error) {
      return ({
        responseCode: 500,
        message: (response as Error).message.toString()
      })
    }

    return (
      {
        responseCode: 200,
        message: response as Admin
      }
    )




  }

  async onRequestCredits(userid: string, requestedCredits: number): Promise<controllersResponseType> {

    const response: CreditRequestDataType | Error = await this.adminInteractor.onRequestCredits(userid, requestedCredits);
    if (response instanceof Error) return { responseCode: 500, message: (response as Error).message.toString() } as controllersResponseType;
    return { responseCode: 200, message: response } as controllersResponseType
  }


  async onFetchPendingCreditRequests(): Promise<controllersResponseType> {

    const response: Error | CreditRequestDataType[] = await this.adminInteractor.fetchPendingCreditRequests();

    if (response instanceof Error) return {
      responseCode: 500,
      message: (response as Error).message,

    }
    else {
      console.log("RESPOSE  ", response)
      return {
        responseCode: 200,
        message: response as CreditRequestDataType[]
      }

    }

  }


  //response : responseCode: number , message : User  | Error: string
  async onProcessCredits(userId: string, creditsRequested: number, requestId: string, flag: 'approved' | 'denied'): Promise<controllersResponseType> {

    const response: Error | CreditRequestDataType = await this.adminInteractor.processCreditRequest(requestId, flag);
    const user: User | Error = await this.userInteractor.getUserByID(userId);
    if (response instanceof Error) return {
      responseCode: 500,
      message: (response as Error).message
    }

    if (flag === 'approved') {
      const approveResponse: Error | User = await this.adminInteractor.approveCredits(userId, creditsRequested, requestId);
      if (approveResponse instanceof Error) return {
        responseCode: 500,
        message: (approveResponse as Error).message
      }
      return {
        responseCode: 200,
        message: approveResponse as User
      }
    }


    if (user instanceof Error) {
      return {
        responseCode: 500,
        message: (user as Error).message
      }
    }


    return {
      responseCode: 200,
      message: user as User
    }



  }

  //request: nothing
  //response :   {responseCode : number , message: Error: string | category: string; count: number; }[] }



  async onFetchCategoriesAndCount(): Promise<controllersResponseType> {


    try {


      const response: Error | {
        category: string;
        count: number;
      }[] = await this.adminInteractor.fetchCategoryByCount()


      if (response instanceof Error) {
        return {
          responseCode: 500,
          message: response.message
        }
      }


      return {
        responseCode: 200,

        message: response

      }

    }
    catch (error) {
      return {

        responseCode: 500,
        message: (error as Error).message
      }
    }

  }
}


