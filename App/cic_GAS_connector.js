const responseDiv = document.getElementById("responseDiv");

let responseDivTimeout=0;
let isShowingResponseDiv=false;
SubscribeFPSevent(UpdateResponseDiv, 0, cicFPSeventType.perTick);
function UpdateResponseDiv()
{
    if(isShowingResponseDiv && cicFPSevents.timerFPS>responseDivTimeout)
    {
        isShowingResponseDiv = false;
        responseDiv.innerHTML = '';
        responseDiv.style.visibility = "hidden";
    }
}

function ShowResponse(msg, duration=5, color="white")
{
    responseDiv.innerHTML = msg;
    responseDiv.style.color = color;
    responseDiv.style.visibility = "visible";
    responseDivTimeout = cicFPSevents.timerFPS+duration*1000;
    isShowingResponseDiv = true;
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

const cicConnectorDB = 
{
    //gAppScriptID: 'AKfycbwKPzf3HX7kOX9EbJk5Y97s3k3bJhsTIc0QQfFJvYs';
    gAppScriptID: 'AKfycbxcOROfMX11e6vB1TROVA_s5xUNN3yZrKcOBqIyiC49ZRmAK7y7SMepKLyXwhK_f3z4',
    gSpreadSheetID: '1yt7Qu5YWYyAb3RI7PoBXjnGdVZu3smUK_fz0KYr73nE',
    isFirstLoad: true,

    htmlTableContainerDiv: document.getElementById("htmlTableContainerDiv"),
    dataTable: null,
    htmlTable: null,
    htmlRowContainerDiv: document.getElementById("htmlRowContainerDiv"),
    dataRow: null,
    htmlRow:null,

    liveSessionLoginID: '',
    liveUpdateStamps: {SessionStamp:'', UsersStamp:'', TasksStamp:'', ActionsStamp:''},
    
    dataLiveSession: {Day:0},
    hmtlLiveSessionColumnsContainerDiv: document.getElementById("htmlLiveSessionColumnsContainerDiv"),
    dataLiveSessionColumns: null,
    htmlLiveSessionColumns: null,
    htmlLiveSessionUsersContainerDiv: document.getElementById("htmlLliveSessionUsersContainerDiv"),
    dataLiveSessionUsers: null,
    htmlLiveSessionUsers: null,
    dataLiveSessionTasks: null,
    htmlLiveSessionTasks: null,
}

GetHashID();
SubscribeFPSevent(GetHashID, 5, cicFPSeventType.repeatInterval);
function GetHashID() 
{
    if(window.location.hash)
    {
        const currAppScriptID = cicConnectorDB.gAppScriptID;
        cicConnectorDB.gAppScriptID = window.location.hash.substring(1);
        if(currAppScriptID != cicConnectorDB.gAppScriptID || cicConnectorDB.isFirstLoad)
        {
            console.log(`gAppScriptID: ${cicConnectorDB.gAppScriptID}`);
            console.log(`gSpreadSheetID: ${cicConnectorDB.gSpreadSheetID}`);
            cicConnectorDB.isFirstLoad = false;
            GoogleAppsScriptGet(cicConnectorDB.gAppScriptID, 'GetSpreadsheetURL', '', cicClientRPC_RecieveSheetID);
        }
    }
    else if(cicConnectorDB.isFirstLoad)
    {
        console.log(`gAppScriptID: ${cicConnectorDB.gAppScriptID}`);
        console.log(`gSpreadSheetID: ${cicConnectorDB.gSpreadSheetID}`);
        cicConnectorDB.isFirstLoad = false;
        GoogleAppsScriptGet(cicConnectorDB.gAppScriptID, 'GetSpreadsheetURL', '', cicClientRPC_RecieveSheetID);
    }
}
function cicClientRPC_RecieveSheetID(resultData)
{
    console.log(resultData);
    if(resultData.status == "Ok")
        cicConnectorDB.gSpreadSheetID = resultData.response.data;
    ShowResponse(resultData.response.msg, 5);
}

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

function WashAndTrimString(str, removeNewLine=true, removeTabs=true, arrRemove=['"', ',', ';', ':', '|'])
{
  for (let removeStr of arrRemove)
    str = str.split(removeStr).join(' ');
  if (removeTabs)
    str = str.replace(/\t/g, '');
  if (removeNewLine)
    str = str.replace(/[\r\n]/g, '');
  str = str.trim();
  return str;
}

function AppendDataStringVar(dataString, varName, varValue)
{
    return `${dataString}&${varName}=${varValue}`;
}

function GoogleAppsScriptGet(appsScriptID, rpcID, dataString, responseCallback, callbackTempDataHolder=null)
{
    const url = `https://script.google.com/macros/s/${appsScriptID}/exec?rpcID=${rpcID}${dataString}`;
    fetch(url,{method:'Get'})
    .then(response => response.json())
    .then(responseJson => 
    {
        responseJson.url = url;
        if(callbackTempDataHolder)
            responseJson.response.tempDataHolder = callbackTempDataHolder;
        responseCallback(responseJson);
    })
    .catch(error => 
    {
        error.status = 'Failed Get';
        error.url = url;
        error.method = 'Get';
        error.rpcID = rpcID;
        error.dataString = dataString;
        console.log('Error in fetch(): ', error);
    });
}

function GoogleAppsScriptPost(appsScriptID, rpcID, formData, responseCallback, callbackTempDataHolder=null)
{
    const url = `https://script.google.com/macros/s/${appsScriptID}/exec`;
    formData.append("rpcID",rpcID);
    fetch(url,
    {
        method:'Post',
        body:formData,
        //mode: 'no-cors'
    })
    .then(response => response.json())
    .then(responseJson => 
    {
        responseJson.url = url;
        if(callbackTempDataHolder)
            responseJson.response.tempDataHolder = callbackTempDataHolder;
        console.log(responseJson);
        responseCallback(responseJson);
    })
    .catch(error => 
    {
        error.status = 'Failed Post';
        error.url = url;
        error.method = 'Post';
        error.rpcID = rpcID;
        error.formData = [...formData.entries()];
        console.log('Error in fetch(): ', error);
    });
}

function GoogleSheetQueryTableSQL(spreadsheetID, sheetName, querySQL, responseCallback, callbackTempDataHolder=null)
{
    const url = `https://docs.google.com/spreadsheets/d/${spreadsheetID}/gviz/tq?&sheet=${sheetName}&tq=${encodeURIComponent(querySQL)}`;
    fetch(url)
    .then(response => response.text())
    .then(responseText => 
    {
        console.log(`GoogleSheetQueryTableSQL(spreadsheetID:${spreadsheetID}, sheetName:${sheetName}, querySQL:${querySQL}, responseCallback(callbackTempDataHolder:${callbackTempDataHolder})`);
        console.log('responseText=>',responseText);
        const cutString = responseText.split('setResponse(');
        const sheetJsonObjs = JSON.parse(cutString[1].slice(0,-2));
        const jsTable = JsonSheetObjectsToJsTableObject(sheetJsonObjs, sheetName);
        if(callbackTempDataHolder)
            responseCallback({status: 'Ok', response:{msg:'Query successful!', data:jsTable, tempDataHolder:callbackTempDataHolder}, request:{url:url, spreadSheetID:spreadsheetID, sheetName:sheetName, querySQL:querySQL, responseCallback:responseCallback}});
        else
            responseCallback({status: 'Ok', response:{msg:'Query successful!', data:jsTable}, request:{url:url, spreadSheetID:spreadsheetID, sheetName:sheetName, querySQL:querySQL, responseCallback:responseCallback}});
    })
    .catch(error => 
    {
        error.status = 'Failed Query';
        error.url = url;
        error.sheetTableName = sheetName;
        error.querySQL = querySQL;
        console.log('sqlqueryerror',error);
    });
}

function JsonSheetObjectsToJsTableObject(sheetJsonObjs, sheetName)
{
    const dataTable = {};
    const cols = [];
    const rows = [];
    let rowIndex,colIndex;

    //const parsedHeaders = sheetJsonObjs.table.parsedNumHeaders>0;
    const parsedHeaders = sheetJsonObjs.table.parsedNumHeaders>0 || (sheetJsonObjs.table.cols && sheetJsonObjs.table.cols.length>0 && sheetJsonObjs.table.cols[0].label!=null && sheetJsonObjs.table.cols[0].label!='');
    if(parsedHeaders)
    {
        for(colIndex=0; colIndex<sheetJsonObjs.table.cols.length; colIndex++)
        {
            if(sheetJsonObjs.table.cols[colIndex].label)
                cols.push(sheetJsonObjs.table.cols[colIndex].label);//.toLowerCase().replace(/\s/g,'');
        }
    }
    for(rowIndex=0; rowIndex<sheetJsonObjs.table.rows.length; rowIndex++)
    {
        if(!parsedHeaders && rowIndex==0)
        {
            for(colIndex=0; colIndex<sheetJsonObjs.table.rows[0].c.length; colIndex++)
            {
                if(sheetJsonObjs.table.rows[0].c[colIndex].v)
                    cols.push(sheetJsonObjs.table.rows[0].c[colIndex].v);//.toLowerCase().replace(/\s/g,'');   
            }
        }
        else
        {
            const newRow = {};
            for(colIndex=0; colIndex<cols.length; colIndex++)
            {
                newRow[cols[colIndex]] = (sheetJsonObjs.table.rows[rowIndex].c[colIndex]!=null)?sheetJsonObjs.table.rows[rowIndex].c[colIndex].v:'';
            }
            rows.push(newRow);
        }
    }
    dataTable.label = sheetName;
    dataTable.cols = cols;
    dataTable.rows = rows;
    return dataTable;
}

function RowTableObjFromTableObject(dataTable, rowIndex)
{
    if(!dataTable || dataTable.rows.length<=rowIndex)
        return null;
    const dataRow = {};
    const colHeaders = [];
    const rowContent = {};
    for(let colIndex=0; colIndex<dataTable.cols.length; colIndex++)
    {
        colHeaders.push(dataTable.cols[colIndex]);
        rowContent[dataTable.cols[colIndex]] = dataTable.rows[rowIndex][dataTable.cols[colIndex]];
    }
    dataRow.label = dataTable.label;
    dataRow.cols = colHeaders;
    dataRow.row = rowContent;
    return dataRow;
}

function TableObjectToArrays(dataTable)
{
    const TableArray = [];
    for(let rowIndex=0; rowIndex<dataTable.rows.length; rowIndex++)
    {
        const RowArray = [];
        for(let colIndex=0; colIndex<dataTable.cols.length; colIndex++)
        {
            RowArray.push(dataTable.rows[rowIndex][dataTable.cols[colIndex]]);
        }
        TableArray.push(RowArray);
    }
    return TableArray;
}