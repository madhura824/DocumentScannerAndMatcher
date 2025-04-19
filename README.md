Running Instructions:

The given folder has 2 sub-folders:

1) Backend
2) Frontend

Steps to Run the Backend:

1) Open a terminal in the backend folder.
2) Run the following command to install all the dependencies:  npm install
3) Note: The database.sqlite file for the sqlite database is already available. In case not initialize the      database using:   npm run migrate 
4) To start the server run the command: npm run dev  (Server will start running on port 5000.) 




Steps to Run the Frontend:


Method 1: Running on localhost using serve    (Requires node)
1) Open a terminal in the frontend folder.
2) Run the following command: npx serve
3) If prompted, allow the installation of the serve package.
4) After installation, a local address will be displayed.
5) Copy the local address and append the path to the main page  :


Example:  http://localhost:port-number/index.html

Or for login:

http://localhost:port-number/pages/login.html

6) Open the URL in a browser to run the project.



Method 2: Using VS Code (Live Server)  
1) Install the Live Server extension by Ritwick Dey in VS Code.
2) Open the frontend folder in VS Code.
3) Right-click on index.html and select Open with Live Server.

Note: Running files directly using the file:/// protocol will not work, as the project requires local storage for authentication.








