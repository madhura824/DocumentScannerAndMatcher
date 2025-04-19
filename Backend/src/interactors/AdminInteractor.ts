
import { connectDB } from "../database/database";
import { AdminInterface } from "../interfaces/AdminInterface";
import { Admin } from "../entities/Admin";
import { UserController } from "../controllers/UserController";
import { UserInteractor } from "./UserInteractor";
import { UserInterface } from "../interfaces/UserInterface";
import { generateUniqueKey } from "../lib/utils";
import { AdminQueryReturnType, CreditRequestDataType, UserQueryReturnType } from "../lib/definitions";
import { User } from "../entities/User";
import { getAdminByNameQuery, getAdminByIDQuery, getCreditRequestQuery, updateCreditRequestFlagQuery } from "../database/queries/adminQueries";
import { getUserByIdQuery, updateTotalCreditsQuery } from "../database/queries/userQueries";
import { createCreditRequestQuery, getAllPendingCreditRequestsQuery } from "../database/queries/requestQueries";
import { fetchCategories } from "../database/queries/documentQueries";
export class AdminInteractor implements AdminInterface {
    private userInteractor: UserInterface;
    private userController: UserController;


    constructor() {

        this.userInteractor = new UserInteractor();
        this.userController = new UserController(this.userInteractor);

    }



    async fetchCategoryByCount(): Promise<{ category: string, count: number }[] | Error> {
        try {



            const result: {
                category: string;
                count: number;
            }[] | undefined = await fetchCategories();


            if (!result) {

                return new Error(`An unexpected error occurred while fetching the document category from the database`)

            }

            return result;

        }
        catch (error) {
            return error as Error;
        }
    }
    async getAdminByID(adminId: string): Promise<Admin | Error> {


        try {
            const admin: AdminQueryReturnType | undefined = await getAdminByIDQuery(adminId)
            if (!admin) {

                return new Error(`Admin with ID ${adminId} not found.`);
            }
            const AdminType = new Admin(admin.adminId, admin.adminName, admin._password)
            return AdminType;

        } catch (error) {
            console.error("Error fetching admin by ID:", error);
            return new Error("Database query failed.");
        }
    }


    async fetchAdminByName(adminName: string): Promise<Admin | Error> {
        console.log(adminName)
        try {
            
            const admin: undefined | AdminQueryReturnType = await getAdminByNameQuery(adminName);
            if (!admin) {
                return new Error(`Could not find the admin with username ${adminName}`);

            } else {
                console.log(admin)
                const adminEntity = new Admin(admin.adminId, admin.adminName, admin._password);
                console.log(adminEntity)
                return adminEntity
            }
        } catch (error) {
            console.error("Error fetching admin by name:", error);
            return new Error("Database query failed.");
        } 

    }


   

    async fetchCreditRequest(requestId: string): Promise<CreditRequestDataType | Error> {
        const db = await connectDB();

        try {
           
            const request: undefined | CreditRequestDataType = await getCreditRequestQuery(requestId);
            if (!request) {
                return new Error("Credit request not found");

            } else {
                return request;
            }
        } catch (error) {
            console.error("Error fetching credit request:", error);
            return new Error("An error occurred while fetching the credit request from the database");
        } finally {
            await db.close();
        }
    }

    async processCreditRequest(
        requestId: string,
        status: "approved" | "denied"
    ): Promise<Error | CreditRequestDataType> {
        const db = await connectDB();

        try {
            
            const existingRequest: undefined | CreditRequestDataType = await getCreditRequestQuery(requestId)

            if (!existingRequest) {
                return new Error("Credit request not found");
            }

            const updatedRequest = await updateCreditRequestFlagQuery(requestId, status)

            return updatedRequest as CreditRequestDataType;
        } catch (error) {
            console.error("Error updating credit request:", error);
            return new Error("An error occurred while updating the credit request");
        } finally {
            await db.close();
        }
    }


    async approveCredits(
        userId: string,
        requestedCredits: any,
        requestId: string
    ): Promise<User | Error> {
        const db = await connectDB();

        try {
           
            const fetchCreditResponse: undefined | CreditRequestDataType = await getCreditRequestQuery(requestId)

            if (!fetchCreditResponse) {
                return new Error("Credit request not found.");
            }


            const user: undefined | UserQueryReturnType = await getUserByIdQuery(userId)

            if (!user) {
                return new Error(`User with ID ${userId} not found.`);
            }
            
           
            const newTotalCredits: number = parseInt(user.totalCredits) + parseInt(requestedCredits);

            console.log("new total credits ", newTotalCredits)

            const result = await updateTotalCreditsQuery(userId, newTotalCredits);

            if (!result)
                return new Error('An unexpected error occurred while updating data to the database.');


            const userResult: undefined | UserQueryReturnType = await getUserByIdQuery(userId)




            if (!userResult) return new Error('Error in fetching the user from the server.')

           
            const userEntity = new User(userResult.userId, userResult.userName, parseInt(userResult.totalCredits), parseInt(userResult.creditsUsed), userResult._password)
            return userEntity;
        } catch (error) {
            console.error("Error updating credits:", error);
            return new Error("An error occurred while updating credits.");
        } finally {
            await db.close();
        }
    }



    async onRequestCredits(userId: string, requestedCredits: number): Promise<CreditRequestDataType | Error> {
        const db = await connectDB();

        try {

            const requestId = generateUniqueKey();
            const timeStamp = new Date().toISOString();

            
            const result = await createCreditRequestQuery(requestId, userId, timeStamp, requestedCredits)

            if (!result) {
                return new Error("Failed to create credit request.");
            }

            const request: undefined | CreditRequestDataType = await getCreditRequestQuery(requestId);

            if (!request) return new Error('Error in fetching the credit request')


            return request;
        } catch (error) {
            console.error("Error creating credit request:", error);
            return new Error("An error occurred while creating the credit request.");
        } finally {
            await db.close();
        }
    }



    async fetchPendingCreditRequests(): Promise<CreditRequestDataType[] | Error> {
        const db = await connectDB();

        try {
            const pendingRequests: undefined | CreditRequestDataType[] = await getAllPendingCreditRequestsQuery();

            if (!pendingRequests) {
                return new Error("No pending credit requests found.");
            }

            return pendingRequests;
        } catch (error) {
            console.error("Error fetching pending credit requests:", error);
            return new Error("An error occurred while fetching pending credit requests.");
        } finally {
            await db.close();
        }
    }

}


