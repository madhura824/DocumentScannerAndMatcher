/**
 * @typedef {Object} UploadedDocumentResponse
 * @property {string} documentId
 * @property {string} documentName
 * @property {string} userId
 * @property {string} storageUrl
 * @property {string} documentType
 * @property {number} documentSize
 * @property {string} _timestamp
 * @property {string} category
 */


/**
 * @typedef {Object} Document
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
 * @typedef {Object} DocumentSimilarityDataType
 * @property {Document} document
 * @property {string} documentId
 * @property {number} similarityPercentage
 * @property {string} summary
 */

/**
 * @typedef {Object} CompareDocumentsResponse
 * @property {string | DocumentSimilarityDataType[]} message
 */



/**
 * Handles file uploads.
 * @returns {Promise<void>}
 */


async function uploadDocument() {
    const fileInput = document.getElementById("file-upload");
    const fileError = document.getElementById("file-error");
    const categoryField = document.getElementById("category-input");
    const categoryError = document.getElementById("category-error");


    fileError.textContent = "";
    categoryError.textContent = "";


    const fileValidationResult = validateFile(fileInput, fileError);
    const categoryValidationResult = validateCategory(categoryField, categoryError);


    if (!fileValidationResult || !categoryValidationResult) {
        return;
    }

    const file = fileInput.files[0];
    const fileName = file.name;


    const token = localStorage.getItem("jwtTokenUser");
    if (!token) {
        fileError.textContent = "Authentication failed. Please log in.";
        window.alert("Session expired. Please login again");
        window.location.href = "/pages/login.html";
       
        return;
    }

    const documentSize = file.size;
    const uploadedOn = new Date().toISOString();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentSize", documentSize); // number
    formData.append("_timestamp", uploadedOn);
    formData.append("fileName", fileName);
    formData.append("category", categoryField.value.trim().toLowerCase() || "general");

    for (let [key, value] of formData.entries()) {
        console.log(`${key}: ${value}  , type : ${typeof value}`);
    }

    try {
        const response = await fetch("http://localhost:5000/documents/scan", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            },
            body: formData
        });

        /** @type {string | UploadedDocumentResponse} */
        const data = (await response.json()).message;

        console.log(data);

        if (typeof data === "object" && data !== null && "documentId" in data) {
            console.log("Data received after uploading file:", data);
            await compareDocuments(data.documentId, token, data);

            if (response.ok) {
                const creditsContainer = document.getElementById("credits-container");


                const response = await getRemainingCredits();

                console.log(response)

                if (!response || typeof response === 'string') { window.alert('Error in updating the user credits'); return; }

                creditsContainer.innerHTML = String(response);
                console.log("Upload successful:", response.toString());
                alert("File uploaded successfully!");
            } else {
                fileError.textContent = data.message || "Upload failed. Please try again.";
            }
        } else {
            fileError.textContent = data || "Upload failed. Please try again.";
        }
    } catch (error) {
        console.error("Error uploading file:", error.message);
        fileError.textContent = "An error occurred. Please try again.";
    }
}

// Function to validate the file upload
function validateFile(fileInput, fileError) {
    const file = fileInput.files[0];

   
    if (!file) {
        fileError.textContent = "Please upload a file.";
        return false;
    }

    
    if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
        fileError.textContent = "Only .txt files are allowed.";
        return false;
    }

    return true;
}

// Function to validate the category input
function validateCategory(categoryField, categoryError) {
    const category = categoryField.value.trim();

    
    if (!category) {
        categoryError.textContent = "Please enter a category.";
        return false;
    }

    if (category.includes(" ")) {
        categoryError.textContent = "Category must be a single word.";
        return false;
    }

    return true;
}


// Function to validate the file upload
// function validateFile(fileInput, fileError) {
//     const file = fileInput.files[0];

//     if (!file) {
//         fileError.textContent = "Please upload a file.";
//         return false;
//     }

//     if (file.type !== "text/plain" && !file.name.endsWith(".txt")) {
//         fileError.textContent = "Only .txt files are allowed.";
//         return false;
//     }

//     return true;
// }

// Function to validate the category input
// function validateCategory(categoryField, categoryError) {
//     const category = categoryField.value.trim();

//     if (!category) {
//         categoryError.textContent = "Please enter a category.";
//         return false;
//     }

//     if (category.includes(" ")) {
//         categoryError.textContent = "Category must be a single word.";
//         return false;
//     }

//     return true;
// }




// async function compareDocuments(documentId){
//   const compareDocsResponse = await fetch("http://localhost:5000/documents/compare-doc", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       Authorization: `Bearer ${token}`
//     },
//     body: JSON.stringify({ documentId: documentId }) 
//   });


// const resBody = await compareDocsResponse.json();
// if(!compareDocsResponse.ok){
//   alert(resBody.message)
// }
// else{
// 
// }

// }


/**
* Fetches and compares doc.
* @param {string} documentId 
* @param {string} token 
* @param {UploadedDocumentResponse} uploadedDocument 
* @returns {Promise<void>}
*/


async function compareDocuments(documentId, token, uploadedDocument) {
    const documentsList = document.getElementById("documents-list");
    console.log(documentId)

    documentsList.innerHTML = "<li>Loading... You will see the list of documents that have similar contents to the file that you upload.</li>";

    try {
        const compareDocsResponse = await fetch("http://localhost:5000/documents/compare-doc", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ documentId: documentId })
        });
        /** @type {CompareDocumentsResponse} */
        const resBody = await compareDocsResponse.json();

        if (!compareDocsResponse.ok) {
            alert(resBody.message);
            return;
        }

        documentsList.innerHTML = "";

        const header = document.createElement("li");
        header.innerHTML = `<h4><strong>Document Uploaded:</strong> ${uploadedDocument.documentName}</h4>
        <p>Documents similar to the uploaded document ${uploadedDocument.documentName} are:  </p>`;
        documentsList.appendChild(header);

        console.log(resBody.message)

        if (Array.isArray(resBody.message)) {
            resBody.message.forEach(doc => {
                const card = document.createElement("li");
                card.classList.add("document-card");

                card.innerHTML = `
                  <p><strong>Document ID:</strong> ${doc.documentId}</p>
                  <p><strong>Document Name:</strong> ${doc.document.documentName}</p>
                  <p><strong>Similarity Percentage:</strong> ${doc.similarityPercentage}%</p>
                  <p><strong>Summary:</strong> ${doc.summary}</p>
              `;

                documentsList.appendChild(card);
            });
        } else {
            documentsList.innerHTML = `<li>${resBody.message}</li>`;
        }
    } catch (error) {
        console.error("Error fetching document comparison:", error);
        documentsList.innerHTML = "<li>Error loading similar documents.</li>";
    }
}

async function getRemainingCredits() {
    const token = localStorage.getItem("jwtTokenUser");
    console.log(token);

    if (!token) {
        window.alert("Session expired. Please login again");
        window.location.href = "/pages/login.html";
       
        return undefined;
    }

    try {
        const response = await fetch("http://localhost:5000/users/fetch-credits-left", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const res = await response.json();

        /**
     * Fetches the credit request.
     * @type {number | string } 
     */
        const resp = res.message;
        return resp;

    } catch (error) {
        console.error("Error fetching remaining credits:", error);
        return undefined
    }
}




