/**
 * @typedef {Object} DocumentResponse
 * @property {string} documentId
 * @property {string} documentName
 * @property {string} userId
 * @property {string} storageUrl
 * @property {number} documentSize
 * @property {string} _timestamp
 * @property {string} category
 * @property {Buffer} [file] 
 */

/**
 * @typedef {Object} CreditRequestDataType
 * @property {string} requestId 
 * @property {string} userId
 * @property {string} _timestamp 
 * @property {number} requestedCredits 
 * @property {'approved' | 'denied' | 'pending'} flag 
 */

/**
        * @typedef {Object} User
        * @property {string} userId 
        * @property {string} userName 
        * @property {number} totalCredits 
        * @property {number} creditsUsed 
        * @property {number} _password
        */
document.addEventListener("DOMContentLoaded", onUserPageLoad);


/**
 * Fetches user data and updates UI.
 * Redirects to the login page if the session has expired .
 * @returns {Promise<void>}
 */
async function onUserPageLoad() {
  const token = localStorage.getItem("jwtTokenUser");
  console.log(token);

  if (!token) {
    window.alert("Session expired. Please login again");
    window.location.href = "/pages/login.html";
    
    return;
  }
  const user = await getUser(token)

  if (typeof user === 'string') {
    window.alert(user)
    return;
  }
  const { userId, userName, totalCredits, creditsUsed, _password } = user;

  console.log(userId, userName, totalCredits, creditsUsed);



  const usernameContainer = document.getElementById("username-container");
  const creditsContainer = document.getElementById("credits-container");
  const creditsRemaining = (totalCredits - creditsUsed).toString()
  if (usernameContainer) usernameContainer.innerHTML = userName;
  if (creditsContainer) creditsContainer.innerHTML = creditsRemaining;


  /**
       * @type { CreditRequestDataType | undefined }
       */
  const creditRequest = await getCreditRequestByUserId();

  console.log(creditRequest)
  console.log(typeof creditRequest, creditRequest.flag, creditsRemaining)
  if (typeof creditRequest == 'object') {
    console.log("hereeeee")


    const { _timestamp, requestedCredits, flag } = creditRequest;


    const requestDate = new Date(_timestamp);
    const today = new Date();

    if (
      requestDate.getFullYear() === today.getFullYear() &&
      requestDate.getMonth() === today.getMonth() &&
      requestDate.getDate() === today.getDate()
    ) {

      const noteElement = document.getElementById("credits-requested-note");
      noteElement.textContent = `Today's latest credit request: \n  Credits Requested: ${requestedCredits} credits Status: ${flag}.\n
        (The data is for the last request you made today.)`;
    }

  }




}
/**
 * Fetchs the user
 * @param {string} token 
 * @returns {Promise<{ message: User | string }>} 
 */

async function getUser(token) {
  try {

    const response = await fetch("http://localhost:5000/users/get-user", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });


    /**
     * @type {{ message: User | string }}
     */
    const res = await response.json();

    if (!response.ok) {
      window.alert(`${res.message}`);
      window.href('/pages/login.html')
      return;
    }

    if (typeof res.message !== "object") {
      window.alert("Invalid response format. Please log in again.");
      window.location.href = "/pages/login.html";
      return;
    }

    return res.message;




  } catch (error) {
    console.error("Error fetching user data:", error);
    window.alert("An error occurred. Please try again.");
    window.location.href = "/pages/login.html";
  }

}


async function onRequestCredits() {
  const creditsContainer = document.getElementById("credits-container");
  let currentCredits = parseInt(creditsContainer.innerHTML, 10);

  if (currentCredits === 0) {


    let res;
    try {
      res = await getCreditRequestByUserId();
    } catch (error) {
      console.error("Error fetching credit request:", error);
      alert("An error occurred while checking your previous credit request.");
      return;
    }

    console.log("Credit request result:", res);
    console.log(typeof res, res.flag)

    if (typeof res === 'object' && res.flag === 'pending') {
      alert("You have already requested credits.");
      return;
    }
    console.log("object", res, typeof res)

    if (typeof res === 'string' || (typeof res === 'object' && res.flag !== 'pending')) {

      let requestedCredits = parseInt(prompt("Enter the number of credits to request (1-5):"), 10);


      if (requestedCredits < 1 || requestedCredits > 5) {
        alert("You can at max request 5 credits");
        return;
      }


      const userToken = localStorage.getItem("jwtTokenUser");


      if (!userToken) {
        
        window.alert("Session expired. Please login again");
        window.location.href = "/pages/login.html";
        return;
      }

      try {

        const response = await fetch("http://localhost:5000/admins/increase-credits-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${userToken}`
          },
          body: JSON.stringify({ credits: requestedCredits })
        });

        const data = await response.json();

        if (response.ok) {
          console.log(data.message);
          alert("Your request has been forwarded to the admin. The credits will increase when the admin grants it.");
          const creditRequestNote = document.getElementById("credits-requested-note");
          if (creditRequestNote) {
            creditRequestNote.innerHTML = `You have requested ${requestedCredits} credits. You will be informed when the request is approved.`;
          }
        } else {
          alert(data.message.toString());
        }
      } catch (error) {
        console.error("Error requesting credits:", error);
        alert("An error occurred while requesting credits.");
      }
    } else {

      alert("Unexpected response format from credit request check.");
    }
  } else {
    alert("Cannot request credits until you have 0 remaining.");
  }
}


/**
 * Fetches the credit request
 * @returns {Promise<CreditRequestDataType | string >} 
 */
async function getCreditRequestByUserId() {
  const token = localStorage.getItem("jwtTokenUser");
  console.log(token);

  if (!token) {
    window.alert("Session expired. Please login again");
    window.location.href = "/pages/login.html";
    
    return;
  }

  try {
    const response = await fetch("http://localhost:5000/users/fetch-credit-request", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    const res = (await response.json()).message;
    return res;



  } catch (error) {
    console.error("Error fetching remaining credits:", error);
  }
}


/**
 * 
 * @returns {Promise< CreditRequestDataType[] | string >} 
 */
async function fetchAllRequests(token) {
  try {


    const response = await fetch("http://localhost:5000/users/fetch-all-requests", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    /**
 * 
 * @type {CreditRequestDataType[] | string } 
 */
    const res = (await response.json()).message;
    return res;



  } catch (error) {
    console.error("Error fetching remaining credits:", error);
  }


}

/**
 * 
 * @returns {Promise< DocumentResponse[] | string >} 
 */
async function fetchAllDocumentsByUserId(token) {
  try {


    const response = await fetch("http://localhost:5000/users/fetch-all-documents-by-user-id", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });

    /**
  * Fetches the credit request data.
  * @type { DocumentResponse[] | string } 
  */
    const res = (await response.json()).message;
    return res;



  } catch (error) {
    console.error("Error fetching remaining credits:", error);
  }
}



/**
 * Generates a Markdown report 
 * @param {string} userName
 * @param {string} userId
 * @param {number} totalCredits
 * @param {number} creditsUsed
 * @param {CreditRequestDataType[]} allRequests
 * @param {DocumentResponse[]} allDocuments
 * @returns {string} 
 */
function generateUserReportMarkdown(userName, userId, totalCredits, creditsUsed, allRequests, allDocuments) {
  const remainingCredits = totalCredits - creditsUsed;

  let markdownContent = `# 📝 User Report: ${userName}\n\n`;
  markdownContent += `**User ID:** ${userId}  \n`;
  markdownContent += `**Total Credits:** ${totalCredits}  \n`;
  markdownContent += `**Credits Used:** ${creditsUsed}  \n`;
  markdownContent += `**Remaining Credits:** ${remainingCredits}  \n\n`;

  markdownContent += `## 📌 Credit Requests\n`;
  if (allRequests.length === 0) {
    markdownContent += "_No credit requests found._\n\n";
  } else {
    markdownContent += `| Request ID | Requested Credits | Status | Timestamp |\n`;
    markdownContent += `|------------|------------------|--------|------------|\n`;
    allRequests.forEach(req => {
      markdownContent += `| ${req.requestId} | ${req.requestedCredits} | ${req.flag} | ${req._timestamp} |\n`;
    });
    markdownContent += `\n`;
  }

  markdownContent += `## 📂 Uploaded Documents\n`;
  if (allDocuments.length === 0) {
    markdownContent += "_No documents uploaded._\n\n";
  } else {
    markdownContent += `| Document ID | Name | Category | Size (KB) | Uploaded On |\n`;
    markdownContent += `|------------|------|----------|-----------|------------|\n`;
    allDocuments.forEach(doc => {
      markdownContent += `| ${doc.documentId} | ${doc.documentName} | ${doc.category} | ${doc.documentSize} | ${doc._timestamp} |\n`;
    });
    markdownContent += `\n`;
  }

  return markdownContent;
}

/**
* initiates a file download on browser
* @param {string} fileName 
* @param {string} content 
*/
function downloadMarkdownFile(fileName, content) {
  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();


  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}


async function onDownloadReport() {
  const token = localStorage.getItem("jwtTokenUser");
  if (!token) {
    window.alert("Session expired. Please login again.");
    window.location.href = "/pages/login.html";
    return;
  }

  const user = await getUser(token);
  if (typeof user === 'string') {
    window.alert(user);
    return;
  }

  const allRequests = await fetchAllRequests(token);
  if (typeof allRequests === 'string') {
    window.alert(allRequests);
    return;
  }

  const allDocuments = await fetchAllDocumentsByUserId(token);
  if (typeof allDocuments === 'string') {
    window.alert(allDocuments);
    return;
  }


  const markdownContent = generateUserReportMarkdown(
    user.userName,
    user.userId,
    user.totalCredits,
    user.creditsUsed,
    allRequests,
    allDocuments
  );


  downloadMarkdownFile(`User_Report_${user.userId}.md`, markdownContent);

}
