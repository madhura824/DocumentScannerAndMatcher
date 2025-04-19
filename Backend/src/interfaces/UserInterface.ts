
import { User } from "../entities/User";
import { Document_ } from "../entities/Document";
import { CreditRequestDataType } from "../lib/definitions";

export interface UserInterface {
  createUser(userName: string, password: string): Promise<User | Error>;
  getUserByID(userId: string): Promise<User | Error>;
  increaseTotalCredits(userId: string, increaseBy: number): Promise<number | Error>;
  fetchCreditsLeft(userId: string): Promise<number | Error>
  findByUsername(userName: string): Promise<User | Error>
  increaseUsedCredits(userId: string): Promise<User | Error>;
  fetchCreditRequestByUserId(userId: string): Promise<CreditRequestDataType | Error>
  fetchUsersByCreditUsage(): Promise<User[] | Error>;

  fetchAllRequestsMade(userId: string): Promise<Error | CreditRequestDataType[]>
  fetchAllDocumentsById(userId: string): Promise<Error | Document_[]>
}