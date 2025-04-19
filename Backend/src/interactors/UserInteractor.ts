import { User } from "../entities/User";
import { UserInterface } from "../interfaces/UserInterface";
import * as fs from "fs";
import * as path from "path";
import bcrypt from "bcrypt";
import { generateUniqueKey } from "../lib/utils";
import { connectDB } from "../database/database";
import { CreditRequestDataType, UserQueryReturnType } from "../lib/definitions";
import { fetchTopUsersByCreditUsageQuery, getByUserNameQuery, getUserByIdQuery, getUserCreditsLeft, incrementCreditsUsedQuery, insertUserQuery, updateTotalCreditsQuery } from "../database/queries/userQueries";
import { getAllCreditRequestQueryByUserId, getCreditRequestQueryByUserId } from "../database/queries/requestQueries";
import { fetchAllDocumentsByUserId } from "../database/queries/documentQueries";
import { Document_ } from "../entities/Document";
export class UserInteractor implements UserInterface {
    private databasePath = path.join(__dirname, "../database/users.json");





    async increaseUsedCredits(userId: string): Promise<User | Error> {
        const db = await connectDB()
        try {

            const user: UserQueryReturnType | undefined = await getUserByIdQuery(userId);
            if (!user) {
                return new Error(`User with ID ${userId} not found while incrementing the usedCredits.`);
            }


            const result = await incrementCreditsUsedQuery(userId);

            if (result.changes === 0) {
                return new Error("Failed to update credits.");
            }

            const updatedUser: UserQueryReturnType | undefined = await getUserByIdQuery(userId)

            if (!updatedUser) return new Error("Failed to fetch updated user data.");
            const updatedUseruserType: User = new User(updatedUser.userId, updatedUser.userName, parseInt(updatedUser.totalCredits), parseInt(updatedUser.creditsUsed), updatedUser._password)
            return updatedUseruserType;
        } catch (error) {
            console.error("Error increasing used credits:", error);
            return new Error("An error occurred while updating user credits.");
        }
    }






    async createUser(userName: string, password: string): Promise<User | Error> {
        const db = await connectDB();
        const newUserId = generateUniqueKey();
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        try {

            const user = new User(newUserId, userName, 20, 0, hashedPassword)
            console.log("Created a user entity ", user);

            const result = await insertUserQuery(user);
            if (result.changes !== 1) return new Error("Failed to insert data  in the database");
            console.log("Result returned by the insert user: ", result)


            console.log(`User created with ID: ${newUserId}`);
            return user;
        } catch (error) {
            console.error("Error creating user:", error);
            return new Error("Could not create user");
        } finally {
            await db.close();
        }
    }



    async getUserByID(userId: string): Promise<User | Error> {
        const db = await connectDB();

        try {

            const user: UserQueryReturnType | undefined = await getUserByIdQuery(userId);
            if (user) {
                console.log("Details of the user fetched:  ", user, " ", typeof user)
                const userDataType = new User(user.userId, user.userName, parseInt(user.totalCredits), parseInt(user.creditsUsed), user._password)
                return userDataType;
            } else {
                return new Error(`User with ID ${userId} not found`);
            }
        } catch (error) {
            console.error("Error fetching user:", error);
            return new Error("An unexpected error was thrown: Could not fetch user.");
        } finally {
            await db.close();
        }
    }


    //returns number (totalCredits-creditsUsed)  or error
    async fetchCreditsLeft(userId: string): Promise<number | Error> {
        const db = await connectDB();

        try {

            const row: { creditsLeft: number } | undefined = await getUserCreditsLeft(userId)

            if (row) {
                return row.creditsLeft;
            } else {
                return new Error(`User with ID ${userId} not found`);
            }
        } catch (error) {
            console.error("Error fetching credits:", error);
            throw new Error("An unexpected error occurred. Could not fetch credits");
        } finally {
            await db.close();
        }
    }





    //returns totalCredits : number  | Error


    async increaseTotalCredits(userId: string, increaseBy: number): Promise<number | Error> {
        const db = await connectDB();
        console.log("inside the increase total credits of the user interactor  ", increaseBy, typeof increaseBy)
        try {

            const user: undefined | UserQueryReturnType = await getUserByIdQuery(userId)
            if (!user) {
                return new Error(`User with ID ${userId} not found`)
            }


            const newTotalCredits = parseInt(user.totalCredits) + increaseBy;


            console.log("New total credits", newTotalCredits, typeof newTotalCredits)
            const result = await updateTotalCreditsQuery(userId, newTotalCredits)

            if (!result) {
                return new Error('An unexpected error occurred while updating data to the database.');

            }
            return newTotalCredits;

        } catch (error) {
            console.error("Error increasing credits:", error);
            return new Error("An unexpected error occurred. Could not update user credits");
        } finally {
            await db.close();
        }
    }

    //finds user by username returns the user or error
    async findByUsername(userName: string): Promise<User | Error> {
        const db = await connectDB();

        try {

            const user: UserQueryReturnType | undefined = await getByUserNameQuery(userName);
            if (user) {
                return new User(user.userId, user.userName, parseInt(user.totalCredits), parseInt(user.creditsUsed), user._password);
            } else {
                return new Error(`Could not find the user with username ${userName}`);
            }
        } catch (error) {
            console.error("An unexpected error occurred while finding user by username: ", error);
            throw new Error(`An unexpected error occurred while finding user by username: ${error}`);
        } finally {
            await db.close();
        }
    }

    async fetchCreditRequestByUserId(userId: string): Promise<CreditRequestDataType | Error> {
        console.log(userId)
        const creditRequest: CreditRequestDataType | undefined = await getCreditRequestQueryByUserId(userId)
        console.log("Response of the query  fetch ", creditRequest)
        if (!creditRequest) return new Error('Error in fetching request query from database.')

        return creditRequest;

    }

    async fetchUsersByCreditUsage(): Promise<User[] | Error> {

        const users = await fetchTopUsersByCreditUsageQuery();
        if (!users) return new Error('An error occurred while fetching the users from database.')
        const userEntity = users.map(userData => new User(userData.userId, userData.userName, parseInt(userData.totalCredits), parseInt(userData.creditsUsed), userData._password));
        return userEntity;
    }

    async fetchAllRequestsMade(userId: string): Promise<Error | CreditRequestDataType[]> {

        const requests = await getAllCreditRequestQueryByUserId(userId);
        if (!requests) {
            return new Error((requests as Error).message);

        }
        return requests

    }

    async fetchAllDocumentsById(userId: string): Promise<Error | Document_[]> {



        const documents = await fetchAllDocumentsByUserId(userId);

        if (!documents) return new Error(`Failed to fetch data from the database`);
        const documentEntity = documents.map(document => new Document_(document.documentId, document.userId, document.storageUrl, document.documentName, parseInt(document.documentSize), document._timestamp, document.category));

        return documentEntity
    }


}




