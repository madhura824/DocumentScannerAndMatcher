



export class Document_ {
    private documentId: string;
    private documentName:string;
    private userId: string;
    private storageUrl: string;
  
    private documentSize: number;
    private _timestamp: string;
    private category : string;
    private  file? : Buffer;


  
    constructor(
      documentId: string,
      userId: string,
      storageUrl: string,
      documentName:string,
      documentSize: number,
      _timestamp: string = new Date().toISOString(),
      category:string
    ) {
      this.documentId = documentId;
      this.userId = userId;
      this.storageUrl = storageUrl;
      this.documentSize = documentSize;
      this._timestamp = _timestamp;  
      
      this.documentName=documentName;
      this.category = category;
    }
  
    getDocumentId()  : string {
      return this.documentId;
    }
    getUserId(): string {
      return this.userId;
    }
    getStorageUrl(): string {
      return this.storageUrl
    }
    getDocumentSize(): number {
      return this.documentSize;
    }
    getTimeStamp(): string {
      return this._timestamp;
    }
    getDocumentName()  : string {
      return this.documentName;
    }
    getCategory(): string{
      return this.category;
    }
    setFile(file : Buffer ){
      this.file= file;
    }
    getDocumentFile(){
      this.file;
    }
  }
  