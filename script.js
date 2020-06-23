 // Client ID and API key from the Developer Console
 const CLIENT_ID = '405137222603-ngvc2euqqsre20p9u11t49rk6co86v1i.apps.googleusercontent.com';
 const API_KEY = 'AIzaSyCb5-w5KJKTdZ2QFbe5EkEMAygoQBtYK3Y';

 // Array of API discovery doc URLs for APIs used by the quickstart
 const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

 // Authorization scopes required by the API; multiple scopes can be
 // included, separated by spaces.
 //var SCOPES = "https://www.googleapis.com/auth/spreadsheets.readonly";

 const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

 const authorizeButton = document.getElementById('authorize_button');
 const signoutButton = document.getElementById('signout_button');
 const updateBtn = document.getElementById('update_data');
 const addRowBtn = document.getElementById('add_row');
 const deleteRowBtn = document.getElementById('delete_row');
 const mainElement = document.querySelector('.page-main');
 const headerElement = document.querySelector('.page-header');
 const info = document.querySelector('.page-main__info-panel');

 const showInfo = function(message) {
  info.innerText = message;
 }
 let selectedRow = null;

 const table = new Tabulator("#tbl", {
   height:"500px",
   layout:"fitColumns",
   columns:[
    {title:"Employee", field:"employee", width:200, editor:"input", verAlign:"center"},
    {title:"Department", field:"department", editor:"input", hozAlign:"center"},
    {title:"Task", field:"task", editor:"input", formatter:"textarea", verAlign:"center"} ],
   rowClick:function(e, row){
     selectedRow = row;
  },
 });

const dataAdapter = function(data) {
    const result = [];
    for (let i = 1; i < data.length; i++) {
        let rowData = {};
        for (let j = 0; j < data[i].length; j++) {
            rowData[data[0][j].toLowerCase()] = data[i][j];
        }
        result.push(rowData);
    }
    return result;
};

const dataToRaw = function(data) {
    const result = [];
    const titles = [];
    for (const key of Object.keys(data[0])) {
        titles.push(key)
    }
    result.push(titles);
    for (let i = 0; i < data.length; i++) {
        const dataRow = [];
        for (const value of Object.values(data[i])) {
            dataRow.push(value);
        }
        result.push(dataRow);
    }
    return result;
}

 /**
  *  On load, called to load the auth2 library and API client library.
  */
 function handleClientLoad() {
   gapi.load('client:auth2', initClient);
 }

 /**
  *  Initializes the API client library and sets up sign-in state
  *  listeners.
  */
 function initClient() {
   gapi.client.init({
     apiKey: API_KEY,
     clientId: CLIENT_ID,
     discoveryDocs: DISCOVERY_DOCS,
     scope: SCOPES
   }).then(function () {
     // Listen for sign-in state changes.
     gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

     // Handle the initial sign-in state.
     updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
     authorizeButton.onclick = handleAuthClick;
     signoutButton.onclick = handleSignoutClick;
   }, function(error) {
     appendPre(JSON.stringify(error, null, 2));
   });
 }

 /**
  *  Called when the signed in status changes, to update the UI
  *  appropriately. After a sign-in, the API is called.
  */
 function updateSigninStatus(isSignedIn) {
   if (isSignedIn) {
     mainElement.classList.remove('page-main--notauth');
     headerElement.classList.remove('page-header--notauth');
     authorizeButton.style.display = 'none';
     signoutButton.style.display = 'block';
     listMajors();
   } else {
     mainElement.classList.add('page-main--notauth');
     headerElement.classList.add('page-header--notauth');
     authorizeButton.style.display = 'block';
     signoutButton.style.display = 'none';
   }
 }

 /**
  *  Sign in the user upon button click.
  */
 function handleAuthClick(event) {
   gapi.auth2.getAuthInstance().signIn();
 }

 /**
  *  Sign out the user upon button click.
  */
 function handleSignoutClick(event) {
   gapi.auth2.getAuthInstance().signOut();
 }

 /**
  * Append a pre element to the body containing the given message
  * as its text node. Used to display the results of the API call.
  *
  * @param {string} message Text to be placed in pre element.
  */
 function appendPre(message) {
   var pre = document.getElementById('content');
   var textContent = document.createTextNode(message + '\n');
   pre.appendChild(textContent);
 }

 /**
  * Print the names and majors of students in a sample spreadsheet:
  * https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
  */
 function listMajors() {
   gapi.client.sheets.spreadsheets.values.get({
     spreadsheetId: '1N6iJvyMiP-eVbpcK2o4LyiO7JUYbLD5RfLYR22kw5gI',
     range: 'Sheet1',
   }).then(function(response) {
     mainElement.classList.remove('page-main--loading');
     var range = response.result;
     table.clearData();
     const tableData = dataAdapter(range.values);
     table.addData(tableData, false);
   }, function(response) {
      showInfo('Error: ' + response.result.error.message);
   });
 }

 const clearTheSpreadsheet = function() {
  const request = gapi.client.sheets.spreadsheets.values.clear({
    spreadsheetId: '1N6iJvyMiP-eVbpcK2o4LyiO7JUYbLD5RfLYR22kw5gI',
    range: 'Sheet1'
  })
  return request;
 }

 function changeDataInSpreedSheet() {
     const values = dataToRaw(table.getData());
      var body = {
        values: values
      };
      clearTheSpreadsheet().then((response) => {
        gapi.client.sheets.spreadsheets.values.update({
          spreadsheetId: '1N6iJvyMiP-eVbpcK2o4LyiO7JUYbLD5RfLYR22kw5gI',
          range: 'Sheet1',
          valueInputOption: 'RAW',
          resource: body
       }).then((response) => {
         var result = response.result;
         showInfo(`${result.updatedCells} cells updated.`);
       }).catch((err) => {
         showInfo(err.result.error.message);
       });
      });
 }

 updateBtn.addEventListener('click', changeDataInSpreedSheet );

 const addRowToTable = function() {
    table.addRow({employee:"", department:"", task:"" }, false)
    .then(()=>{
      showInfo('empty row has been added');
    })
 } 
 addRowBtn.addEventListener('click', addRowToTable)

const deleteSelectedRow = function() {
  if (selectedRow) {
    selectedRow.delete()
    .then(()=> {
      selectedRow = null;
      showInfo('row has been deleted');
    })
  }
}
 deleteRowBtn.addEventListener('click', deleteSelectedRow)