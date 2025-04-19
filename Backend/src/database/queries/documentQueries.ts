import { DocumentQueryReturnType } from "../../lib/definitions";
import { connectDB } from "../database";
import { Document_ } from "../../entities/Document";
export async function getDocumentByIdQuery(documentId: string): Promise<DocumentQueryReturnType | undefined> {
    const db = await connectDB(); 

    try {
        const row: DocumentQueryReturnType | undefined = await db.get(
            `SELECT * FROM documents WHERE documentId = ?`,
            [documentId]
        );

        return row;
    } finally {
        db.close();
    }
}
export async function getDocumentsByUserIdQuery(userId: string): Promise<DocumentQueryReturnType[] | undefined> {
    const db = await connectDB(); 

    try {
        const documents: DocumentQueryReturnType[] | undefined = await db.all(
            `SELECT * FROM documents WHERE userId = ?`,
            [userId]
        );

        return documents;
    } finally {
        db.close(); 
    }
}


export async function createDocumentQuery(document: Document_): Promise<any> {
    const db = await connectDB(); 

    try {
        const result = await db.run(
            `INSERT INTO documents (documentId, documentSize, _timestamp, userId, documentName, storageUrl, category)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                document.getDocumentId(),
                document.getDocumentSize(),
                document.getTimeStamp(),
                document.getUserId(),
                document.getDocumentName(),
                document.getStorageUrl(),
                document.getCategory()
            ]
        );

        return result;
    } finally {
        db.close();     }
}



export async function fetchCategories(): Promise<{ category: string, count: number }[] | undefined> {
    const db = await connectDB(); 

    try {
        
        const categories: { category: string, count: number }[] | undefined = await db.all(
            `SELECT category, COUNT(*) as count 
             FROM documents 
             GROUP BY category 
             ORDER BY count DESC`
        );

        return categories;
    } finally {
        db.close(); 
    }
}


export async function fetchAllDocumentsByUserId(userId: string): Promise<DocumentQueryReturnType[] | undefined> {
    const db = await connectDB(); 

    try {
        const documents: DocumentQueryReturnType[] | undefined = await db.all(
            `SELECT * FROM documents WHERE userId = ?`,
            [userId]
        );

        return documents;
    } finally {
        db.close(); 
    }
}

