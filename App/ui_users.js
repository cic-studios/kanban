const loginMainDiv = document.getElementById("LOGIN_MainDiv");
const subscriptionsMainDiv = document.getElementById("SUBSCRIPTIONS_MainDiv");
const livesessionMainDiv = document.getElementById("LIVESESSION_MainDiv");

const currentSubscriptionsTableHolderDiv = document.getElementById("currentSubscriptionsTableHolderDiv");
const availableSessionsTableHolderDiv = document.getElementById("availableSessionsTableHolderDiv");
let currentSubscriptionsGrid = null;
let availableSessionsGrid = null;

const liveSessionUsersListHolderDiv = document.getElementById("liveSessionUsersListHolderDiv");
const liveSessionColumnsContainerDiv = document.getElementById("liveSessionColumnsContainerDiv");
let live_htmlUsersList = null;
let live_htmlColumnsList = null;
let live_htmlTasksList = null;

let login_userData = null;
let live_sessionData = null;
let live_taskData=null;

const enumPageState = Object.freeze({login:0, subscriptions:1, livesession:2});
let currPage=null;
SwapPageMainDiv(enumPageState.login);
function SwapPageMainDiv(pageState)
{
    if(currPage==pageState) 
        return;

    switch(pageState)
    {
        case enumPageState.login:
            loginMainDiv.style.display = 'flex';
            subscriptionsMainDiv.style.display = 'none';
            livesessionMainDiv.style.display = 'none';
            break;
        case enumPageState.subscriptions:
            loginMainDiv.style.display = 'none';
            subscriptionsMainDiv.style.display = 'flex';
            livesessionMainDiv.style.display = 'none';
            break;
        case enumPageState.livesession:
            loginMainDiv.style.display = 'none';
            subscriptionsMainDiv.style.display = 'none';
            livesessionMainDiv.style.display = 'flex';
            break;
    }
    currPage = pageState;
}

//SubscribeFPSevent(LiveSessionRefresh, 5, cicFPSeventType.repeatInterval);
function LiveSessionRefresh()
{
    if(currPage != enumPageState.livesession || login_userData == null || live_sessionData == null || live_taskData == null)
        return;
    GoogleSheetQueryTableSQL(cicConnectorDB.gSpreadSheetID, 'Sessions', `Select * WHERE A = '${live_sessionData[0]}'`, cicClientRPC_RefreshLiveSession);
}

function ProfileLogout()
{
    login_userData = null;
    document.getElementById('profileNameDiv').innerHTML = 'Welcome!';
    document.getElementById('profileAccountDiv').innerHTML = 'Account';
    if(currentSubscriptionsTableHolderDiv && currentSubscriptionsGrid && currentSubscriptionsGrid.mainDiv)
        currentSubscriptionsTableHolderDiv.removeChild(currentSubscriptionsGrid.mainDiv);
    currentSubscriptionsGrid = null;
    if(availableSessionsTableHolderDiv && availableSessionsGrid && availableSessionsGrid.mainDiv)
        availableSessionsTableHolderDiv.removeChild(availableSessionsGrid.mainDiv);
    availableSessionsGrid = null;
    document.getElementById('loginOldUserForm').reset();
    document.getElementById('loginNewUserForm').reset();
    SwapPageMainDiv(enumPageState.login);
    ShowResponse('Logged out profile!', 5, 'green');
}

function LiveSessionLogout()
{
    live_sessionData = null;
    document.getElementById('liveProfileNameDiv').innerHTML = 'Welcome!';
    document.getElementById('liveSessionNameDiv').innerHTML = 'Live Session';
    if(liveSessionUsersListHolderDiv && live_htmlUsersList)
        liveSessionUsersListHolderDiv.removeChild(live_htmlUsersList);
    live_htmlUsersList = null;
    if(liveSessionColumnsContainerDiv && live_htmlColumnsList)
        for(let i=0; i<live_htmlColumnsList.htmlColumns.length; i++)
            liveSessionColumnsContainerDiv.removeChild(live_htmlColumnsList.htmlColumns[i]);
    live_htmlColumnsList = null;
    live_htmlTasksList = null;
    SwapPageMainDiv(enumPageState.subscriptions);
    ShowResponse('Left live session!', 5, 'green');
}

function cicServerRPC_LoginOldUser(htmlForm)
{
    const oldUserLoginInput = WashAndTrimString(document.getElementById('oldUserLoginInput').value);
    if(oldUserLoginInput == '')
    {
        ShowResponse('Please enter user login!', 5, 'red');
        return;
    }
    const oldUserPasswordInput = document.getElementById('oldUserPasswordInput').value;
    if(oldUserPasswordInput == '')
    {
        ShowResponse('Please enter login password!', 5, 'red');
        return;
    }
    const formData = new FormData();
    formData.append('userLogin', oldUserLoginInput);
    formData.append('userPassword', oldUserPasswordInput);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'LoginOldUser', formData, cicClientRPC_RecieveUserLogin);
    ShowResponse('Logging in user...', 5, 'green');
}

function cicServerRPC_LoginNewUser(htmlForm)
{
    const newUserLoginInput = document.getElementById('newUserLoginInput').value;
    if(newUserLoginInput == '')
    {
        ShowResponse('Please enter new login!', 5, 'red');
        return;
    }
    const newUserPasswordInput = document.getElementById('newUserPasswordInput').value;
    if(newUserPasswordInput == '')
    {
        ShowResponse('Please enter new password!', 5, 'red');
        return;
    }
    const newUserNameInput = document.getElementById('newUserNameInput').value;
    if(newUserNameInput == '')
    {
        ShowResponse('Please enter new user\'s full name!', 5, 'red');
        return;
    }
    const newUserEmailInput = document.getElementById('newUserEmailInput').value;
    if(newUserEmailInput == '')
    {
        ShowResponse('Please enter new user\'s email!', 5, 'red');
        return;
    }
    const newUserConfirmationInput = document.getElementById('newUserConfirmationInput').value;
    if(newUserPasswordInput != newUserConfirmationInput)
    {
        ShowResponse('Passwords do not match!', 5, 'red');
        return;
    }
    const formData = new FormData();
    formData.append('userLogin', newUserLoginInput);
    formData.append('userPassword', newUserPasswordInput);
    formData.append('userName', newUserNameInput);
    formData.append('userEmail', newUserEmailInput);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'LoginNewUser', formData, cicClientRPC_RecieveUserLogin);
    ShowResponse('Creating new user...', 5, 'green');
}

function cicClientRPC_RecieveUserLogin(resultData)
{
    if(resultData.status != 'Ok')
    {
        ShowResponse(resultData.response.msg, 5, 'red');
        return;
    }
    login_userData = resultData.response.data;
    document.getElementById('profileNameDiv').innerHTML = `Welcome, ${login_userData[3]}!`;
    document.getElementById('profileAccountDiv').innerHTML = `Account: ${login_userData[1]}`;
    cicServerRPC_RefreshSubscriptions();
    cicServerRPC_RefreshSessions();
    SwapPageMainDiv(enumPageState.subscriptions);
    ShowResponse(resultData.response.msg, 5, 'green');
}

function cicServerRPC_SubscribeToSession(sessionID)
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('sessionID', sessionID);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'SubscribeToSession', formData, cicClientRPC_RecieveSubscriptionConfirmation);
    ShowResponse('Subscribing to session...', 5, 'green');
}

function cicClientRPC_RecieveSubscriptionConfirmation(resultData)
{
    if(resultData.status != 'Ok')
        ShowResponse(resultData.response.msg, 5, 'red');
    else
        ShowResponse(resultData.response.msg, 5, 'green');
    cicServerRPC_RefreshSubscriptions();
    cicServerRPC_RefreshSessions();
}

function cicServerRPC_UnsubscribeFromSession(sessionID)
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('sessionID', sessionID);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'UnsubscribeFromSession', formData, cicClientRPC_RecieveUnsubscriptionConfirmation);
    ShowResponse('Unsubscribing from session...', 5, 'green');
}

function cicClientRPC_RecieveUnsubscriptionConfirmation(resultData)
{
    if(resultData.status != 'Ok')
        ShowResponse(resultData.response.msg, 5, 'red');
    else
        ShowResponse(resultData.response.msg, 5, 'green');
    cicServerRPC_RefreshSubscriptions();
    cicServerRPC_RefreshSessions();
}

function cicServerRPC_RefreshSubscriptions()
{
    //const query =  `SELECT A,B,D,J WHERE F CONTAINS ":${login_userData[1]}:" AND D > "${new Date().toISOString()}" ORDER BY D ASC`;
    const query =  `SELECT A,B,D,J WHERE F CONTAINS ":${login_userData[1]}:" ORDER BY D ASC`;
    GoogleSheetQueryTableSQL(cicConnectorDB.gSpreadSheetID, 'Sessions', query, cicClientRPC_RecieveSubscriptions);
}

function cicClientRPC_RecieveSubscriptions(resultData)
{
    if(currentSubscriptionsTableHolderDiv && currentSubscriptionsGrid && currentSubscriptionsGrid.mainDiv)
        currentSubscriptionsTableHolderDiv.removeChild(currentSubscriptionsGrid.mainDiv);
    currentSubscriptionsGrid = UserSessionTableToHtmlGrid(resultData.response.data, currentSubscriptionsTableHolderDiv, 'Subscriptions', [0], false, true, -1, false, true, false, true);
}

function cicServerRPC_RefreshSessions()
{
    const query =  `SELECT A,B,D,J ORDER BY D ASC`;
    //const query =  `SELECT A,B,D,J WHERE WHERE F NOT LIKE '%:${login_userData[1]}:%' AND D > "${new Date().toISOString()}" ORDER BY D ASC`;
    //const query =  `SELECT A,B,D,J WHERE F NOT LIKE '%:${login_userData[1]}:%' ORDER BY D ASC`;
    //const query =  `SELECT A,B,D,J WHERE CHARINDEX('$:${login_userData[1]}:', F, 0)<1 ORDER BY D ASC`;
    //const query =  `SELECT A,B,D,J WHERE DOES NOT CONTAIN "%:${login_userData[1]}:%" ORDER BY D ASC`;
    GoogleSheetQueryTableSQL(cicConnectorDB.gSpreadSheetID, 'Sessions', query, cicClientRPC_RecieveSessions);
}

function cicClientRPC_RecieveSessions(resultData)
{
    if(availableSessionsTableHolderDiv && availableSessionsGrid && availableSessionsGrid.mainDiv)
        availableSessionsTableHolderDiv.removeChild(availableSessionsGrid.mainDiv);
    availableSessionsGrid = UserSessionTableToHtmlGrid(resultData.response.data, availableSessionsTableHolderDiv, 'Sessions', [0], false, true, -1, false, false, true, false);
}

function ShowLoginLiveSession(liveSessionName)
{
    document.getElementById('loginLiveSessionNameInput').value = liveSessionName;
    document.getElementById('loginLiveSessionPasswordInput').value = '';
    document.getElementById('LOGINLIVESESSION_MainDiv').style.display = 'flex';
}

function CancelLoginLiveSession()
{
    document.getElementById('loginLiveSessionForm').reset();
    document.getElementById('LOGINLIVESESSION_MainDiv').style.display = 'none';
}

function cicServerRPC_LoginLiveSession(htmlForm)
{
    const sessionName = document.getElementById('loginLiveSessionNameInput').value;
    if(sessionName == '')
    {
        ShowResponse('Please enter session name!', 5, 'red');
        return;
    }
    const sessionPassword = document.getElementById('loginLiveSessionPasswordInput').value;
    if(sessionPassword == '')
    {
        ShowResponse('Please enter session password!', 5, 'red');
        return;
    }
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('sessionName', sessionName);
    formData.append('sessionPassword', sessionPassword);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'LoginLiveSession', formData, cicClientRPC_RecieveLiveSessionLogin);
    ShowResponse('Joining live session...', 5, 'green');
    document.getElementById('loginLiveSessionForm').reset();
    document.getElementById('LOGINLIVESESSION_MainDiv').style.display = 'none';
}

function cicClientRPC_RecieveLiveSessionLogin(resultData)
{
    if(resultData.status != 'Ok')
    {
        ShowResponse(resultData.response.msg, 5, 'red');
        return;
    }
    live_sessionData = resultData.response.data;
    document.getElementById('liveProfileNameDiv').innerHTML = `Welcome, ${login_userData[3]}!`;
    document.getElementById('liveSessionNameDiv').innerHTML = `Live Session: ${live_sessionData[1]}`;
    if(liveSessionUsersListHolderDiv && live_htmlUsersList)
        liveSessionUsersListHolderDiv.removeChild(live_htmlUsersList);
    live_htmlUsersList = LiveSessionUsersToHtmlList(live_sessionData[5], liveSessionUsersListHolderDiv, login_userData[1]);
    const columnInfoArray = LiveSessionColumnsToHtmlArray(live_sessionData[4], liveSessionColumnsContainerDiv, false, '20vw');
    GoogleSheetQueryTableSQL(cicConnectorDB.gSpreadSheetID, 'Tasks', `Select * WHERE B = '${live_sessionData[0]}' ORDER BY M ASC, N DESC`, cicClientRPC_RecieveTasks, columnInfoArray);
    SwapPageMainDiv(enumPageState.livesession);
    ShowResponse(resultData.response.msg, 5, 'green');
}

function cicClientRPC_RefreshLiveSession(resultData)
{
    if(resultData.status != 'Ok')
    {
        ShowResponse(resultData.response.msg, 5, 'red');
        return;
    }
    live_sessionData = TableObjectToArrays(resultData.response.data)[0];
    if(liveSessionUsersListHolderDiv && live_htmlUsersList)
        liveSessionUsersListHolderDiv.removeChild(live_htmlUsersList);
    live_htmlUsersList = LiveSessionUsersToHtmlList(live_sessionData[5], liveSessionUsersListHolderDiv, login_userData[1]);
    const columnInfoArray = LiveSessionColumnsToHtmlArray(live_sessionData[4], liveSessionColumnsContainerDiv, false, '20vw');
    GoogleSheetQueryTableSQL(cicConnectorDB.gSpreadSheetID, 'Tasks', `Select * WHERE B = '${live_sessionData[0]}' ORDER BY M ASC, N DESC`, cicClientRPC_RecieveTasks, columnInfoArray);
}

function cicClientRPC_RecieveTasks(resultData)
{
    if(resultData.status != 'Ok')
    {
        ShowResponse(resultData.response.msg, 5, 'red');
        return;
    }
    if(liveSessionColumnsContainerDiv && live_htmlColumnsList)
        for(let i = 0; i<live_htmlColumnsList.htmlColumns.length; i++)
            liveSessionColumnsContainerDiv.removeChild(live_htmlColumnsList.htmlColumns[i]);
    live_htmlColumnsList = resultData.response.tempDataHolder;
    live_taskData = resultData.response.data;
    live_htmlTasksList = LiveSessionTasksToHtmlColumns(live_taskData, live_htmlColumnsList, false);
    LoadSessionDetails();
}

function LoadSessionDetails()
{
    console.log('userData',login_userData);
    console.log('sessionData',live_sessionData);
    console.log('taskData',live_taskData);
    if(live_htmlUsersList)
    {
        if(live_htmlUsersList.dataset.userData[0][0]%2==0)
        {
            document.getElementById('blackInstructionsDiv').style.display = 'block';
            document.getElementById('redInstructionsDiv').style.display = 'none';
        }
        else
        {
            document.getElementById('blackInstructionsDiv').style.display = 'none';
            document.getElementById('redInstructionsDiv').style.display = 'block';
        }
    }
    document.getElementById('sessionDayCountDiv').innerHTML = live_sessionData[6];
    //document.getElementById('sessionTaskCountDiv').innerHTML = taskData.length;
}

function cicServerRPC_MoveTask(taskID, currColumn, posOffset, maxColumn)
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('taskID', taskID);
    formData.append('taskColumn', Math.min(Math.max(0, currColumn+posOffset), maxColumn));
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'MoveTaskCol', formData, cicClientRPC_RecieveOperationConfirmationLiveSession, null);
    ShowResponse('Moving task...', 5, 'green');
}

function cicServerRPC_PrioritizeTask(taskID, currPriority, newPriority)
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('taskID', taskID);
    formData.append('taskRow', ((currPriority==newPriority)?(currPriority-1):newPriority));
    console.log('Prioritize Task: ', taskID, currPriority, newPriority);
    console.log(...formData);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'MoveTaskRow', formData, cicClientRPC_RecieveOperationConfirmationLiveSession, null);
    ShowResponse('Prioritizing task...', 5, 'green');
}

function cicServerRPC_LockTask(taskID, lockState)
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('taskID', taskID);
    formData.append('taskLocked', lockState);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'LockTask', formData, cicClientRPC_RecieveOperationConfirmationLiveSession, null);
    ShowResponse('Locking task...', 5, 'green');
}

function cicServerRPC_AdvanceDay()
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('sessionID', live_sessionData[0]);
    formData.append('sessionDay', live_sessionData[6]+1);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'AdvanceDay', formData, cicClientRPC_RecieveOperationConfirmationLiveSession, null);
    ShowResponse('Advancing day...', 5, 'green');
}

function cicServerRPC_SetUserState(newState)
{
    const formData = new FormData();
    formData.append('userLogin', login_userData[1]);
    formData.append('userPassword', login_userData[2]);
    formData.append('sessionID', live_sessionData[0]);
    formData.append('userState', newState);
    GoogleAppsScriptPost(cicConnectorDB.gAppScriptID, 'SetUserState', formData, cicClientRPC_RecieveOperationConfirmationLiveSession, null);
    //ShowResponse('Setting user state...', 5, 'green');
}

function cicClientRPC_RecieveOperationConfirmationLiveSession(resultData)
{
    if(resultData.status != 'Ok')
        ShowResponse(resultData.response.msg, 5, 'red');
    else
        ShowResponse(resultData.response.msg, 5, 'green');
    LiveSessionRefresh();
}