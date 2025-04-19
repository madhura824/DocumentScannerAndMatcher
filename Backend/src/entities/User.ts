
export class User {
    private userId: string;
    private userName: string;
    private totalCredits: number;
    private creditsUsed: number;
    private _password:string;

   
    constructor(userId: string, userName: string, totalCredits: number = 20, creditsUsed: number =0, _password:string) {
      this.userId = userId;
      this.userName = userName;
      this.totalCredits = totalCredits;
      this.creditsUsed = creditsUsed;
      this._password=_password
    }
  
   
    get getUserId(): string {
      return this.userId;
    }
  
    get getUserName(): string {
      return this.userName;
    }
    get getUserPassword():string{
      return this._password;
    }
    get getCreditsUsed():number{
      return this.creditsUsed;
    }
    get getTotalCredits():number{
      return this.totalCredits;
    }

  }
  