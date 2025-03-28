]1.  Using Live Server in VS Code (Recommended)
Open the project folder in VS Code.
Install the Live Server extension if you haven't already:
Go to Extensions (Ctrl + Shift + X)
Search for Live Server
Click Install
Open index.html in VS Code.
Right-click anywhere inside the file and select "Open with Live Server".
The project should open in your default browser at http://127.0.0.1:5500/ or a similar local address.

📌 Prerequisites
Before running the project, ensure you have:

Node.js Installed

1. Start a Local HTTP Server
Run the following command inside the project directory:

http-server -p 8000

This starts a local server on port 8000.

2.  Open in Browser
Once the server is running, open a browser and visit:

http://localhost:8000/index.html

Your D3.js visualizations should now be displayed correctly. 🎉