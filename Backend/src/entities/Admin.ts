
export class Admin {
    private adminId: string;
    private adminName: string;
    
    private password:string;

  
    constructor(adminId: string, adminName: string, password:string) {
      this.adminId = adminId;
      this.adminName = adminName;
      this.password=password
    }
  
    get getAdminId(): string {
      return this.adminId;
    }
  
    get getAdminName(): string {
      return this.adminName;
    }
    get getAdminPassword():string{
      return this.password;
    }
    
  }
  