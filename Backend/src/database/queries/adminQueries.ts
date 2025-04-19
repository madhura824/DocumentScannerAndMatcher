import { AdminQueryReturnType, CreditRequestDataType } from "../../lib/definitions";
import { connectDB } from "../database";




export async function getAdminByIDQuery(adminId: string): Promise<AdminQueryReturnType | undefined> {
    try {
        const db = await connectDB();
        const admin = await db.get(`SELECT * FROM admins WHERE adminId = ?`, [adminId]);

        await db.close();

        return admin;
    } catch (error) {
        console.error("Error fetching admin by ID:", error);
        return undefined;      }
}



export async function getAdminByNameQuery(adminName: string): Promise<AdminQueryReturnType | undefined> {
    const db = await connectDB();
    try {

        const admin: undefined  |  AdminQueryReturnType = await db.get(`SELECT * FROM admins WHERE adminName = ?`, [adminName]);

        return admin;
    } catch (error) {
        console.error("Error fetching admin by name:", error);
        return undefined;  
    }finally{
        await db.close();
    }
}


export async function getCreditRequestQuery(requestId: string): Promise<CreditRequestDataType | undefined> {
    const db = await connectDB();
    try {
        const request: undefined  | CreditRequestDataType= await db.get(`SELECT * FROM creditRequests WHERE requestId = ?`, [requestId]);      
      
        return request;
    } catch (error) {
        console.error("Error fetching credit request:", error);
        return undefined;  
    }finally{
        await db.close();
    }
}

export async function updateCreditRequestFlagQuery(requestId: string, status: 'approved'  | 'denied'): Promise<CreditRequestDataType  | undefined> {
    let db;
    try {
        db = await connectDB();
        await db.run(
            `UPDATE creditRequests SET flag = ? WHERE requestId = ?`,
            [status, requestId]
        );
        
        const updatedRecord: CreditRequestDataType | undefined = await db.get(
            `SELECT * FROM creditRequests WHERE requestId = ?`,
            [requestId]
        );
        return updatedRecord
    } catch (error) {
        console.error("Error updating credit request flag:", error);
        return undefined
    } finally {
        if (db) {
            await db.close();
        }
    }
}
