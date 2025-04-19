import { CreditRequestDataType } from "../../lib/definitions";
import { connectDB } from "../database";

export async function createCreditRequestQuery(requestId: string, userId: string, timeStamp: string, requestedCredits: number): Promise<any> {
    const db = await connectDB();

    try {
       const result = await db.run(
            `INSERT INTO creditRequests (requestId, userId, _timestamp, requestedCredits, flag) 
             VALUES (?, ?, ?, ?, ?)`,
            [requestId, userId, timeStamp, requestedCredits, "pending"]
        );

        return result
    } finally {
        db.close(); 
    }
}

export async function getCreditRequestQueryByUserId(userId: string): Promise<CreditRequestDataType | undefined> {
    const db = await connectDB(); 
console.log("INside the qury", userId)
try {
    const request: CreditRequestDataType | undefined = await db.get(
        `SELECT * FROM creditRequests WHERE userId = ? ORDER BY _timestamp DESC LIMIT 1`,
        [userId]
    );

    return request;
} finally {
    db.close(); 
}
}

export async function getAllPendingCreditRequestsQuery(): Promise<CreditRequestDataType[] | undefined> {
    const db = await connectDB(); 

    try {
        const pendingRequests: CreditRequestDataType[]  | undefined = await db.all(
            `SELECT * FROM creditRequests WHERE flag = ?`,
            ["pending"]
        );

        return pendingRequests;
    } finally {
        db.close(); 
    }
}


export async function getLatestCreditRequestByUserId(userId: string): Promise<CreditRequestDataType | undefined> {
    const db = await connectDB();

    try {
        const request: CreditRequestDataType | undefined = await db.get(
            `SELECT * FROM creditRequests WHERE userId = ? ORDER BY _timestamp DESC LIMIT 1`,
            [userId]
        );

        return request ?? undefined;
    } catch (error) {
        console.error("Error fetching latest credit request:", error);
        return undefined;
    } finally {
        await db.close();
    }
}


export async function getAllCreditRequestQueryByUserId(userId: string): Promise<CreditRequestDataType[]> {
    const db = await connectDB(); 

    try {
       
        const request: CreditRequestDataType[] = await db.all(
            `SELECT * FROM creditRequests WHERE userId = ?`,
            [userId]
        );

       
        return request;
    } finally {
        db.close(); 
    }
}