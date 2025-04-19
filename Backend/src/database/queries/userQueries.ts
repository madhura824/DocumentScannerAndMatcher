import { User } from "../../entities/User";
import { UserQueryReturnType } from "../../lib/definitions";
import { connectDB } from "../database";

export async function getUserByIdQuery(userId: string): Promise<UserQueryReturnType | undefined> {
    const db = await connectDB(); 

    try {
        const user = await db.get(`SELECT * FROM users WHERE userId = ?`, [userId]);
        return user;
    } finally {
        db.close(); 
    }
}

export async function updateTotalCreditsQuery(userId: string, newTotalCredits: number): Promise< any> {
    const db = await connectDB(); 

    try {
        const result =await db.run(
            `UPDATE users SET totalCredits = ? WHERE userId = ?`,
            [newTotalCredits, userId]
        );

        return result
    } catch(error){

        return undefined
    }finally {
        db.close(); 
    }
}


export async function incrementCreditsUsedQuery(userId: string): Promise<any> {
    const db = await connectDB(); 

    try {
        const result = await db.run(
            `UPDATE users 
             SET creditsUsed = creditsUsed + 1 
             WHERE userId = ?`,
            [userId]
        );

        return result;
    } finally {
        db.close(); 
    }
}


export async function insertUserQuery(user: User): Promise<any> {
    const db = await connectDB(); 

    try {
        const result = await db.run(
            `INSERT INTO users (userId, userName, totalCredits, creditsUsed, _password)
             VALUES (?, ?, ?, ?, ?)`,
            [
                user.getUserId,
                user.getUserName,
                user.getTotalCredits,
                user.getCreditsUsed,
                user.getUserPassword
            ]
        );

        return result;
    } finally {
        db.close(); 
    }
}

export async function getUserCreditsLeft(userId: string): Promise<{ creditsLeft: number } | undefined> {
    const db = await connectDB();

    try {
        const row: { creditsLeft: number } | undefined = await db.get(
            `SELECT totalCredits - creditsUsed AS creditsLeft FROM users WHERE userId = ?`,
            [userId]
        );

        return row; 
    } finally {
        db.close(); 
    }
}

export async function getByUserNameQuery(userName: string): Promise<UserQueryReturnType | undefined> {
    const db = await connectDB(); 

    try {
        
        const user: UserQueryReturnType | undefined = await db.get(
            `SELECT * FROM users WHERE userName = ?`,
            [userName]
        );

        return user;
    } finally {
        db.close(); 
    }
}


export async function fetchTopUsersByCreditUsageQuery(): Promise<UserQueryReturnType[] | undefined> {
    const db = await connectDB(); 

    try {
        
        const users: UserQueryReturnType[] | undefined= await db.all(
            `SELECT * FROM users ORDER BY creditsUsed DESC`
        );

        return users;
    } finally {
        db.close(); 
    }
}


export async function resetTotalCreditsQuery(): Promise<boolean> {
    const db = await connectDB(); 
    try {
       
        const result = await db.run(
            `UPDATE users SET totalCredits = 20, creditsUsed=0`
        );
        if(!result) return false;
       
        if (result.changes  &&result.changes > 0) {
            console.log('Total credits have been reset to 20 for all users.');
            return true;
        } else {
            console.log('No users found to update.');
            return false;
        }
    } catch (error) {
        console.error('Error resetting totalCredits:', error);
        return false;
    } finally {
        db.close(); 
    }
}







