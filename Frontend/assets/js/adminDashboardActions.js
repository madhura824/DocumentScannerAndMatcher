/**
        * @typedef {Object} User
        * @property {string} userId 
        * @property {string} userName 
        * @property {number} totalCredits 
        * @property {number} creditsUsed 
        * @property {number} _password
        */

/**
       * @typedef {Object} RequestData
       * @property {string} requestId 
       * @property {string} userId 
       * @property {string} _timestamp 
       * @property {number} requestedCredits 
       * @property {string} flag
       */

/**
       * @typedef {Object} CategoryResponse
       * @property {string} category 
       * @property {number} count 
     
       */


document.addEventListener("DOMContentLoaded", onAdminDashboardLoad);
document.getElementById('logout').addEventListener('click', adminLogout);
document.getElementById('credit-requests-btn').addEventListener('click', function () {
  document.getElementById('credit-request-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('user-stats-btn').addEventListener('click', function () {
  document.getElementById('user-stats-section').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('content-trends-btn').addEventListener('click', function () {
  document.getElementById('content-trends-section').scrollIntoView({ behavior: 'smooth' });
});

async function onAdminDashboardLoad() {
  const token = localStorage.getItem("jwtTokenAdmin");

  if (!token) {
    window.alert("Session expired. Please login again.");
    window.location.href = "/pages/login.html";
    return;
  }
  await fetchAdmin(token)
  await fetchUsersByCreditsUsage(token)
  await fetchCategoriesAndCount(token)
}


async function adminLogout() {
  if (localStorage.getItem('jwtTokenAdmin')) {
    localStorage.removeItem('jwtTokenAdmin');
  }

  window.location.href = '/pages/login.html';
}

async function fetchCategoriesAndCount(token) {

  try {
    const response = await fetch("http://localhost:5000/admins/fetch-categories-and-count", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },

    });
    /** @type {CategoryResponse[]  | string} */
    const result = (await response.json()).message;

    if (!response.ok) {
      alert(`Error: ${result.message}`);
      return;
    }

    if (Array.isArray(result)) {
      createCategoriesCard(result);
    }

  } catch (error) {
    window.alert(error.message)
  }
}

async function fetchPendingRequests(token) {
  fetch('http://localhost:5000/admins/fetch-pending-requests', {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
    }
  })
    .then(response => {
      if (!response.ok) {
        alert(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("request details ", data.message);

      /** @type {RequestData[]} */
      const requests = data.message


      if (requests.length !== 0) {


        const container = document.getElementById('card-container');
        container.innerHTML = "";
        if (container) {

          for (/** @type {RequestData} */ const request of requests) {

            console.log(request)
            const card = document.createElement('div');
            card.className = 'card';
            card.id = `${request.requestId}`

            card.innerHTML = `
              <p><strong>User ID:</strong> <span class="userId" id=${request.userId}>${request.userId}</span></p>
              <p><strong>Credits Requested:</strong> <span class="creditsRequested" id=${request.userId}>${request.requestedCredits}</span></p>
              <p><strong>Time Stamp:</strong> ${new Date(request._timestamp).toLocaleString()}</p>
              <button class="approve-btn" id="approve" id=${request.userId}>Approve</button>
              <button class="approve-btn"  id="deny" id=${request.userId}>Deny</button>
            `;

            container.appendChild(card);
            const approveBtn = card.querySelector("#approve");
            const denyBtn = card.querySelector("#deny");
            approveBtn.addEventListener("click", () => approveCredits(card, token, 'approved'));
            denyBtn.addEventListener("click", () => approveCredits(card, token, 'denied'));

          }
        }

      }
      else {
        const container = document.getElementById('card-container');

        if (container) {
          container.innerHTML = 'You will see pending requests here if any. Currently you have no pending requests'
        }
      }
    })
    .catch(error => {
      alert('Error fetching pending requests. Please refresh the page.');
      console.error('Error fetching pending requests:', error);
    });
}

async function approveCredits(card, token, flag) {

  console.log(card)
  const requestId = card.id;
  console.log("This is the request Id ", requestId)
  const userId = card.querySelector(".userId").textContent;
  console.log(userId)
  const creditsRequested = card.querySelector(".creditsRequested").textContent;
  console.log(creditsRequested)

  try {
    const response = await fetch("http://localhost:5000/admins/approve-credits", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ userId, creditsRequested, requestId, flag })
    });
    /** @type {User  | string} */
    const result = (await response.json()).message;
    console.log(result)
    if (!response.ok) {
      alert(`Error: ${result.message}`);
      return;
    }

    card.remove();
    alert("Credits processed successfully!");

  } catch (error) {
    alert("Error approving credits. Please try again.");
    console.error("Error approving credits:", error);
  }
}

async function fetchAdmin(token) {

  try {
    const response = await fetch("http://localhost:5000/admins/get-admin", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });


    if (!response.ok) {
      
      window.alert("Session expired. Please login again");
      window.location.href = "/pages/login.html";
      return;
    }

    const data = await response.json();

    if (typeof data.message === "string") {
      window.alert("Session expired. Please login again");
      window.location.href = "/pages/login.html";
    } else {
      const { adminId, adminName, password } = data.message;

      console.log(adminId, adminName, password);

      document.getElementById('username-container').innerHTML = adminName;


      fetchPendingRequests(token);
    }
  } catch (error) {

    console.error("Error fetching user data:", error);
    window.location.href = "/pages/login.html";
  }

}

async function fetchUsersByCreditsUsage(token) {
  console.log(1)
  const response = await fetch("http://localhost:5000/admins/fetch-users-by-credit-usage", {
    method: "GET",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  console.log(2)
  /** @type {User[] | string} */
  const data = await response.json();
  console.log(data)

  if (!response.ok) {
    window.alert(data.message);
    return;
  }


  console.log(Array.isArray(data.message))
  if (Array.isArray(data.message)) {
    createTable(data.message);
  }


}

/**
 * Creates a modern styled table to display user statistics.
 * 
 * @param {User[]} users 
 */
function createTable(users) {

  console.log(4)
  const userStatsSection = document.querySelector("#user-stats-section");
  const tableContainer = document.createElement('div');
  tableContainer.classList.add('table-container');

  const table = document.createElement('table');
  table.classList.add('user-table');

  const tableHeader = document.createElement('thead');
  const headerRow = document.createElement('tr');
  const headers = ['User ID', 'User Name', 'Credits Used', 'Total Credits Issued Today'];

  headers.forEach(headerText => {
    const th = document.createElement('th');
    th.textContent = headerText;
    headerRow.appendChild(th);
  });

  tableHeader.appendChild(headerRow);
  table.appendChild(tableHeader);

  const tableBody = document.createElement('tbody');

  users.forEach((user, idx) => {
    const row = document.createElement('tr');

    if (idx >= 0 && idx < 5) {
      const shadesOfBlue = [
        '#A9C9D8',
        '#BFD6E4',
        '#D3E2EC',
        '#E7F0F6',
        '#F1F8FC'
      ];
      row.style.backgroundColor = shadesOfBlue[idx];
    }


    const userIdCell = document.createElement('td');
    userIdCell.textContent = user.userId;
    row.appendChild(userIdCell);

    const userNameCell = document.createElement('td');
    userNameCell.textContent = user.userName;
    row.appendChild(userNameCell);

    const creditsUsedCell = document.createElement('td');
    creditsUsedCell.textContent = user.creditsUsed;
    row.appendChild(creditsUsedCell);

    const totalCreditsCell = document.createElement('td');
    totalCreditsCell.textContent = user.totalCredits;
    row.appendChild(totalCreditsCell);

    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);

  tableContainer.appendChild(table);
  userStatsSection.appendChild(tableContainer);
}

/**
 * Creates the categories card with tags and their respsective counts.
 * @param {CategoryResponse[]} data 
 */
function createCategoriesCard(data) {
  const container = document.getElementById('category-tags-container');
  container.innerHTML = '';


  data.forEach(item => {
    const tagWrapper = document.createElement('div');
    tagWrapper.classList.add('category-tag-wrapper');


    const tag = document.createElement('span');
    tag.classList.add('category-tag');
    tag.textContent = item.category;


    const countCircle = document.createElement('span');
    countCircle.classList.add('category-count-circle');
    countCircle.textContent = item.count;


    tagWrapper.appendChild(tag);
    tagWrapper.appendChild(countCircle);
    container.appendChild(tagWrapper);
  });
}
