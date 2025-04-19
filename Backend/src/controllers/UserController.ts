
require('dotenv').config();
import bcrypt from "bcrypt";
import { AuthService } from "../services/AuthenticationService";
import { User } from "../entities/User"
import { UserInterface } from "../interfaces/UserInterface";
import { controllersResponseType, CreditRequestDataType } from "../lib/definitions";
import { Document_ } from "../entities/Document";

import { isValidEmail, isValidPassword } from "../lib/utils";
const jwtSecretKey = process.env.JWT_SECRET_KEY;

export class UserController {

  private userInteractor: UserInterface;
  private authService = new AuthService(jwtSecretKey ? jwtSecretKey : "");
  constructor(userInteractor: UserInterface) {
    this.userInteractor = userInteractor;

  }

  //response:  {responseCode: number, message:    User:User | Error: string}
  async onGetUser(userId: string): Promise<controllersResponseType> {

  
    const response: User | Error = await this.userInteractor.getUserByID(userId)
    if (response instanceof Error) {
      return ({
        responseCode: 400,
        message: (response as Error).message
      })
    }
  
    return (
      {
        responseCode: 200,
        message: response
      }
    )


  }



  //response :  {responseCode: number ,   message:   User: User    | Error: string}
  async onIncreaseUsedCredits(userId: string): Promise<controllersResponseType> {
    if (!userId || userId === "") return { responseCode: 400, message: "Invalid User Id" };


    const user: User | Error = await this.userInteractor.getUserByID(userId)

    if (user instanceof Error) return { responseCode: 500, message: (user as Error).message }
    const res = await this.userInteractor.increaseUsedCredits(userId);
    if (res instanceof Error) {
      return {
        responseCode: 500,
        message: (res as Error).message
      }
    }
    return {
      responseCode: 200,
      message: res as User
    }

  }


  //response:  {responseCode: number, message:  creditsLeft number | Error: string}
  async onFetchCreditsLeft(userId: string): Promise<controllersResponseType> {
    if (!userId || userId === "") return { responseCode: 400, message: "Invalid User Id" };

    const creditsLeft: Error | number = await this.userInteractor.fetchCreditsLeft(userId);

    if (creditsLeft instanceof Error) {
      return {
        responseCode: 500,
        message: (creditsLeft as Error).message
      }
    }
    return {
      responseCode: 200,
      message: creditsLeft as number
    }

  }


  //response :  {responseCode: number, message: Error: string , number} 
  async onIncreaseCredits(userId: string, increaseBy: number): Promise<controllersResponseType> {

    const result: number | Error = await this.userInteractor.increaseTotalCredits(userId, increaseBy);


    if (result instanceof Error) return {
      responseCode: 500,
      message: (result as Error).message

    }

    return {
      responseCode: 200,
      message: result as number
    }

  }



  //response:   responseCode : number, message: Error: string | Token : string

  async onSignUp(userName: string, password: string): Promise<controllersResponseType> {


    if (!isValidEmail(userName)) return ({ responseCode: 400, message: "Enter a valid email-ID as username" });


    if (isValidPassword(password) === false) return ({ responseCode: 400, message: "Enter a valid password." });
    const user: User | Error = await this.userInteractor.findByUsername(userName);

    if (user instanceof User) {
      return {
        responseCode: 400,
        message: `User with the entered username ${userName} already exists.`
      }
    }

    const createdUser: User | Error = await this.userInteractor.createUser(userName, password);

    if (createdUser instanceof Error) return {
      responseCode: 500,
      message: `An error occurred while creating user:  ${createdUser.message}`
    }

    const token = this.authService.generateToken((createdUser as User).getUserId, (createdUser as User).getUserName);

    return {
      responseCode: 200, message: token
    }


  }

  //response:  responseCode : number, message :   Error: string | Token : string
  async onLogin(userName: string, password: string): Promise<controllersResponseType> {


    if (!isValidEmail(userName)) return ({ responseCode: 400, message: "Enter a valid email-ID as username" });


    if (!isValidPassword(password)) return ({ responseCode: 400, message: "Enter a valid password." });
    const user: User | Error = await this.userInteractor.findByUsername(userName);

    if (user instanceof Error) {
      return { responseCode: 400, message: user.message }

    }

    const hashedPassword = (user as User).getUserPassword

    const isMatch = await bcrypt.compare(password, hashedPassword);

    if (isMatch) {


      const token = this.authService.generateToken((user as User).getUserId, (user as User).getUserName);

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


  //responseCode : number , {message :   string , CreditRequestDataType}
  async onFetchRequestByUserId(userId: string): Promise<controllersResponseType> {
    console.log("INside the user controller fetch credit request by id")
    const res: Error | CreditRequestDataType = await this.userInteractor.fetchCreditRequestByUserId(userId);
    if (res instanceof Error) {

      console.log(3)
      return {

        responseCode: 500,
        message: (res as Error).message
      }
    }
    console.log(res)
    return {
      responseCode: 200,
      message: res as CreditRequestDataType
    }


  }


  //req: mothing
  //response:   responseCOde : number , message : string | User[]
  async onFetchUsersByCreditUsage(): Promise<controllersResponseType> {

    const res: Error | User[] = await this.userInteractor.fetchUsersByCreditUsage();
    if (res instanceof Error) return {
      responseCode: 500,
      message: (res as Error).message
    }
    return {
      responseCode: 200,
      message: res as User[]
    }
  }

  async onFetchAllCreditRequestsById(userId : string): Promise<controllersResponseType>{

      const result = await this.userInteractor.fetchAllRequestsMade(userId);

      if(result instanceof Error)   return {
        responseCode: 500,
        message:  result.message
      }

      return {
        responseCode: 200,
        message: result as CreditRequestDataType[]
      }
      




  }


  async onFetchAllDocumentsByUserId(userId : string): Promise<controllersResponseType>{

    const result = await this.userInteractor.fetchAllDocumentsById(userId);

    if(result instanceof Error)   return {
      responseCode: 500,
      message:  result.message
    }

    return {
      responseCode: 200,
      message: result as Document_[]
    }
    
}

}



