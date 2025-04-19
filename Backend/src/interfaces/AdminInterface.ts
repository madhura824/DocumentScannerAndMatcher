
import { Admin } from "../entities/Admin";
import { User } from "../entities/User";
import { CreditRequestDataType } from "../lib/definitions";

export interface AdminInterface {
  
    fetchAdminByName(userName: string): Promise<Admin | Error>
    getAdminByID(userId: string): Promise<Admin | Error>;
    onRequestCredits(userId: string, requestedCredits: number): Promise<CreditRequestDataType | Error>;
    approveCredits(userId: string, requestedCredits: number , requestId: string): Promise<User | Error>;
    fetchPendingCreditRequests(): Promise<CreditRequestDataType[] | Error>;
    fetchCategoryByCount():Promise<{ category: string, count: number }[] | Error>
    processCreditRequest(
        requestId: string,
        status: "approved" | "denied"
    ): Promise<Error | CreditRequestDataType>
}