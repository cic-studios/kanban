function UserSessionTableToHtmlGrid(dataTable, outputDivContainer=null, idPrefix='', skipCols=[], showTitle=true, showHeaders=true, editableRow=-1, editButtons=false, joinButtons=false, subscribeButtons=false, unsubscribeButtons=false)
{
    if(!dataTable)
        return null;

    const editWidth = '50px';
    const joinWidth = '50px';
    const subscribeWidth = '100px';
    const unsubscribeWidth = '100px';

    const rowCount = dataTable.rows.length + (showTitle?1:0);
    const colCount = dataTable.cols.length - skipCols.length + (editButtons?1:0) + (joinButtons?1:0) + (subscribeButtons?1:0) + (unsubscribeButtons?1:0);
    const colOffset = editButtons?1:0 + joinButtons?1:0;
    const colTrailing = subscribeButtons?1:0 + unsubscribeButtons?1:0;

    const htmlTableGrid = {idPrefix:idPrefix, colOffset:colOffset, colTrailing:colTrailing, mainDiv:null, labelDiv:null, colDivs:null, rowDivs:null, rowButtons:null, colButtons:{editButtons:editButtons, joinButtons:joinButtons, subscribeButtons:subscribeButtons, unsubscribeButtons:unsubscribeButtons}};
    htmlTableGrid.mainDiv = document.createElement('div');
    htmlTableGrid.mainDiv.id = `${idPrefix}_htmlTableMainDiv`;
    htmlTableGrid.mainDiv.className = 'selfCrossStretch';
    htmlTableGrid.mainDiv.style.display = 'grid';
    //htmlTableGrid.mainDiv.style.gridTemplateColumns = `repeat(${colCount}, min-content)`; //`${editButtons?'1fr ':''}repeat(${dataTable.cols.length}, 1fr)`;
    htmlTableGrid.mainDiv.style.gridTemplateColumns = `repeat(${colCount}, 1fr)`; //`${editButtons?'1fr ':''}repeat(${dataTable.cols.length}, 1fr)`;
    htmlTableGrid.mainDiv.style.gridTemplateRows = `repeat(${rowCount}, 1fr)`;

    htmlTableGrid.labelDiv = document.createElement('div');
    htmlTableGrid.labelDiv.id = `${idPrefix}_htmlTableTitleDiv`;
    htmlTableGrid.labelDiv.textContent = dataTable.label.toUpperCase();
    htmlTableGrid.labelDiv.className = 'mbaTitle mbaTableCell-title';
    htmlTableGrid.labelDiv.style.textAlign = 'center';
    htmlTableGrid.labelDiv.style.verticalAlign = 'middle';
    htmlTableGrid.labelDiv.style.gridColumn = `span ${dataTable.cols.length}`;
    if(showTitle)
        htmlTableGrid.mainDiv.append(htmlTableGrid.labelDiv);

    htmlTableGrid.colDivs = [];
    let gridColIndex=0;
    if(editButtons)
    {
        htmlTableGrid.colDivs.push(document.createElement('div'));
        htmlTableGrid.colDivs[gridColIndex].id = `${idPrefix}_htmlTableEditDiv${gridColIndex}`;
        htmlTableGrid.colDivs[gridColIndex].style.width = editWidth;
        htmlTableGrid.mainDiv.append(htmlTableGrid.colDivs[gridColIndex]);
        gridColIndex++;
    }
    if(joinButtons)
    {
        htmlTableGrid.colDivs.push(document.createElement('div'));
        htmlTableGrid.colDivs[gridColIndex].id = `${idPrefix}_htmlTableJoinDiv${gridColIndex}`;
        htmlTableGrid.colDivs[gridColIndex].style.width = joinWidth;
        htmlTableGrid.mainDiv.append(htmlTableGrid.colDivs[gridColIndex]);
        gridColIndex++;
    }

    for(let colIndex=0; colIndex<dataTable.cols.length; colIndex++)
    {
        let skipCol=false;
        for(let skipIndex=0; skipIndex<skipCols.length; skipIndex++)
            skipCol = skipCol || (colIndex==skipCols[skipIndex]);
        if(skipCol)
            continue;
        htmlTableGrid.colDivs.push(document.createElement('div'));
        htmlTableGrid.colDivs[gridColIndex].id = `${idPrefix}_htmlTableColDiv${gridColIndex}`;
        htmlTableGrid.colDivs[gridColIndex].textContent = dataTable.cols[colIndex];
        htmlTableGrid.colDivs[gridColIndex].className = (colIndex<dataTable.cols.length-1)?'mbaTableCell-headerNrml':'mbaTableCell-headerRight';
        htmlTableGrid.colDivs[gridColIndex].style.textAlign = 'center';
        htmlTableGrid.colDivs[gridColIndex].style.verticalAlign = 'middle';
        htmlTableGrid.colDivs[gridColIndex].style.fontWeight = 'bold';
        htmlTableGrid.colDivs[gridColIndex].style.fontStyle = 'italic';
        htmlTableGrid.mainDiv.append(htmlTableGrid.colDivs[gridColIndex]);
        gridColIndex++;
    }

    if(subscribeButtons)
    {
        htmlTableGrid.colDivs.push(document.createElement('div'));
        htmlTableGrid.colDivs[gridColIndex].id = `${idPrefix}_htmlTableSubscribeDiv${gridColIndex}`;
        htmlTableGrid.colDivs[gridColIndex].style.width = subscribeWidth;
        htmlTableGrid.mainDiv.append(htmlTableGrid.colDivs[gridColIndex]);
        gridColIndex++;
    }
    if(unsubscribeButtons)
    {
        htmlTableGrid.colDivs.push(document.createElement('div'));
        htmlTableGrid.colDivs[gridColIndex].id = `${idPrefix}_htmlTableUnsubscribeDiv${gridColIndex}`;
        htmlTableGrid.colDivs[gridColIndex].style.width = unsubscribeWidth;
        htmlTableGrid.mainDiv.append(htmlTableGrid.colDivs[gridColIndex]);
        gridColIndex++;
    }

    htmlTableGrid.rowDivs = [];
    for(let rowIndex=0; rowIndex<dataTable.rows.length; rowIndex++)
    {
        const newRow = {};
        if(editButtons)
        {
            newRow['editButton'] = document.createElement('button');
            newRow['editButton'].id = `${idPrefix}_htmlTableRow${rowIndex}:edit`;
            newRow['editButton'].style.width = editWidth;
            newRow['editButton'].textContent = 'Edit';
            newRow['editButton'].className = 'mbaButton selfCrossEnd';
            newRow['editButton'].style.textAlign = 'center';
            newRow['editButton'].style.verticalAlign = 'middle';
            newRow['editButton'].style.cursor = 'pointer';
            /*newRow['editButton'].style.width = '100%';
            newRow['editButton'].style.height = '100%';*/
            htmlTableGrid.mainDiv.append(newRow['editButton']);
        }
        if(joinButtons)
        {
            newRow['joinButton'] = document.createElement('button');
            newRow['joinButton'].id = `${idPrefix}_htmlTableRow${rowIndex}:join`;
            newRow['joinButton'].style.width = joinWidth;
            newRow['joinButton'].textContent = 'Join';
            newRow['joinButton'].className = 'mbaButton selfCrossEnd';
            newRow['joinButton'].style.textAlign = 'center';
            newRow['joinButton'].style.verticalAlign = 'middle';
            newRow['joinButton'].style.cursor = 'pointer';
            newRow['joinButton'].addEventListener('click',()=>{ShowLoginLiveSession(dataTable.rows[rowIndex][dataTable.cols[1]]);});
            htmlTableGrid.mainDiv.append(newRow['joinButton']);
        }
            
        for(let colIndex=0; colIndex<dataTable.cols.length; colIndex++)
        {
            let skipCol=false;
            for(let skipIndex=0; skipIndex<skipCols.length; skipIndex++)
                skipCol = skipCol || (colIndex==skipCols[skipIndex]);
            if(skipCol)
                continue;

            if(editButtons)
                newRow[dataTable.cols[colIndex]] = document.createElement('button');
            else
                newRow[dataTable.cols[colIndex]] = document.createElement('div');
            newRow[dataTable.cols[colIndex]].id = `${idPrefix}_htmlTableRow${rowIndex}:${dataTable.cols[colIndex]}`;
            newRow[dataTable.cols[colIndex]].textContent = dataTable.rows[rowIndex][dataTable.cols[colIndex]];
            if(!(rowIndex==dataTable.rows.length-1&&colIndex==dataTable.cols.length-1))
                newRow[dataTable.cols[colIndex]].className = (rowIndex==dataTable.rows.length-1)?('mbaTableCell mbaTableCell-bottom'):((colIndex==dataTable.cols.length-1)?('mbaTableCell mbaTableCell-right'):('mbaTableCell mbaTableCell-nrml'));
            else
                newRow[dataTable.cols[colIndex]].className = 'mbaTableCell mbaTableCell-botRight';
            newRow[dataTable.cols[colIndex]].style.textAlign = 'center';
            newRow[dataTable.cols[colIndex]].style.verticalAlign = 'middle';
            if(editButtons)
            {
                newRow[dataTable.cols[colIndex]].className += ' mbaTableButton';
                newRow[dataTable.cols[colIndex]].dataset.rowIndex = rowIndex;
                newRow[dataTable.cols[colIndex]].dataset.colIndex = colIndex;
                newRow[dataTable.cols[colIndex]].setAttribute("onclick", `EditTableRow(this);`);//'${newRow[dataTable.cols[colIndex]].id}'
            }
            htmlTableGrid.mainDiv.append(newRow[dataTable.cols[colIndex]]);
        }

        if(subscribeButtons)
        {
            newRow['subscribeButton'] = document.createElement('button');
            newRow['subscribeButton'].id = `${idPrefix}_htmlTableRow${rowIndex}:subscribe`;
            newRow['subscribeButton'].style.width = subscribeWidth;
            newRow['subscribeButton'].textContent = 'Subscribe';
            newRow['subscribeButton'].className = 'mbaButton';
            newRow['subscribeButton'].style.textAlign = 'center';
            newRow['subscribeButton'].style.verticalAlign = 'middle';
            newRow['subscribeButton'].style.cursor = 'pointer';
            newRow['subscribeButton'].addEventListener('click',()=>{cicServerRPC_SubscribeToSession(dataTable.rows[rowIndex][dataTable.cols[0]]);});
            /*newRow['subscribeButton'].style.width = '100%';
            newRow['subscribeButton'].style.height = '100%';*/
            htmlTableGrid.mainDiv.append(newRow['subscribeButton']);
        }
        if(unsubscribeButtons)
        {
            newRow['unsubscribeButton'] = document.createElement('button');
            newRow['unsubscribeButton'].id = `${idPrefix}_htmlTableRow${rowIndex}:unsubscribe`;
            newRow['unsubscribeButton'].style.width = unsubscribeWidth;
            newRow['unsubscribeButton'].textContent = 'Unsubscribe';
            newRow['unsubscribeButton'].className = 'mbaButton';
            newRow['unsubscribeButton'].style.textAlign = 'center';
            newRow['unsubscribeButton'].style.verticalAlign = 'middle';
            newRow['unsubscribeButton'].style.cursor = 'pointer';
            newRow['unsubscribeButton'].addEventListener('click',()=>{cicServerRPC_UnsubscribeFromSession(dataTable.rows[rowIndex][dataTable.cols[0]]);});
            /*newRow['unsubscribeButton'].style.width = '100%';
            newRow['unsubscribeButton'].style.height = '100%';*/
            htmlTableGrid.mainDiv.append(newRow['unsubscribeButton']);
        }

        htmlTableGrid.rowDivs.push(newRow);
    }

    if(outputDivContainer!=null)
        outputDivContainer.append(htmlTableGrid.mainDiv);
    return htmlTableGrid;
}

function LiveSessionUsersToHtmlList(sessionUsersString, outputDivContainer=null, userLogin=null)
{
    if(!sessionUsersString)
        return null;
    const userStrings = sessionUsersString.split(',');
    if(userStrings.length<1)
        return null;

    const userData = [];
    for(let userIndex=0; userIndex<userStrings.length; userIndex++)
    {
        const userDetails = userStrings[userIndex].split(':');
        if(userDetails[0]==null || userDetails[0]==undefined || userDetails[0].length<1)
            userDetails[0] = -1;
        else
            userDetails[0] = parseInt(userDetails[0]);
        if(userDetails[0]==NaN)
            userDetails[0] = -1;
        userData.push(userDetails);
    }
    let myUserIndex = -1;
    if(userLogin!=null)
    {
        for(let userIndex=0; userIndex<userStrings.length; userIndex++)
        {
            if(userData[userIndex][1]==userLogin)
            {
                myUserIndex = userIndex;
                break;
            }
        }
    }
    if(myUserIndex>0)
    {
        const myUser = userData.splice(myUserIndex, 1)[0];
        userData.unshift(myUser);
    }

    const htmlUserList = document.createElement('div');
    htmlUserList.className = 'selfCrossStretch flexRow flexStart crossCenter flowWrap pad5 gap5';
    htmlUserList.dataset.userData = userData;
    for(let userIndex=0; userIndex<userData.length; userIndex++)
    {
        const cardID = userData[userIndex][0];
        const cardNumber = (cardID==-1)?-1:(Math.floor(cardID/4)+1);
        const cardSuit = (cardID==-1)?-1:(cardID%4);
        const cardColor = (cardID%2==0)?'black':'red';

        const htmlUser = document.createElement('div');
        htmlUser.id = `htmlUser${userIndex}`;
        htmlUser.style.position = 'relative';
        htmlUser.className = 'mbaBox flexRow flexStart crossCenter';
        htmlUser.style.height = '40px';
        htmlUser.style.width = '150px';

        const cardImage = document.createElement('img');
        cardImage.id = `htmlUserCard${userIndex}`;
        cardImage.style.height = '100%';
        cardImage.style.zIndex = '1';
        switch(cardSuit)
        {
            case -1: cardImage.src = 'Icons/CardBack.png'; break;
            case 0: cardImage.src = 'Icons/CardSpades.png'; break;
            case 1: cardImage.src = 'Icons/CardDiamonds.png'; break;
            case 2: cardImage.src = 'Icons/CardClubs.png'; break;
            case 3: cardImage.src = 'Icons/CardHearts.png'; break;
        }
        htmlUser.append(cardImage);

        const cardNumberDiv = document.createElement('div');
        cardNumberDiv.id = `htmlUserCardNumber${userIndex}`;
        cardNumberDiv.style.position = 'absolute';
        cardNumberDiv.style.top = '-4px';
        cardNumberDiv.style.left = '2px';
        //cardNumberDiv.style.height = '18px';
        cardNumberDiv.style.zIndex = '2';
        cardNumberDiv.style.fontSize = '16px'
        cardNumberDiv.style.fontWeight = 'bold';  
        cardNumberDiv.style.textAlign = 'left';
        cardNumberDiv.style.color = cardColor;
        switch(cardNumber)
        {
            case -1: cardNumberDiv.textContent = ''; break;
            case 1: cardNumberDiv.textContent = 'A'; break;
            case 11: cardNumberDiv.textContent = 'J'; break;
            case 12: cardNumberDiv.textContent = 'Q'; break;
            case 13: cardNumberDiv.textContent = 'K'; break;
            default: cardNumberDiv.textContent = `${cardNumber}`;
        }
        htmlUser.append(cardNumberDiv);

        const detailsHolder = document.createElement('div');
        detailsHolder.id = `htmlUserDetails${userIndex}`;
        detailsHolder.className = 'selfFlexGrow selfCrossStretch flexCol flexBetween crossCenter';
        htmlUser.append(detailsHolder);

        const userNameDiv = document.createElement('div');
        userNameDiv.id = `htmlUserName${userIndex}`;
        userNameDiv.className = 'selfCrossStart';
        userNameDiv.style.marginLeft = '5px';
        userNameDiv.style.textAlign = 'center';
        userNameDiv.style.verticalAlign = 'middle';
        userNameDiv.style.fontWeight = 'bold';
        userNameDiv.style.fontSize = '15px';
        userNameDiv.textContent = userData[userIndex][1];
        detailsHolder.append(userNameDiv);

        const userStatusDiv = document.createElement('div');
        userStatusDiv.id = `htmlUserStatus${userIndex}`;
        userStatusDiv.className = 'selfCrossEnd';
        userStatusDiv.style.marginRight = '5px';
        userStatusDiv.style.textAlign = 'center';
        userStatusDiv.style.verticalAlign = 'middle';
        userStatusDiv.style.fontWeight = 'bold';
        userStatusDiv.style.fontSize = '12px';
        userStatusDiv.textContent = userData[userIndex][2];
        userStatusDiv.style.color = (userData[userIndex][2]=='Ready')?'green':'red';
        detailsHolder.append(userStatusDiv);

        htmlUserList.append(htmlUser);
    }
    if(outputDivContainer!=null)
        outputDivContainer.append(htmlUserList);
    return htmlUserList;
}

function LiveSessionColumnsToHtmlArray(sessionColumnsString, outputDivContainer=null, showWips=false, minWidth='20vw')
{
    if(!sessionColumnsString)
        return null;
    const columnStrings = sessionColumnsString.split(',');
    if(columnStrings.length<3)
        return null;

    const columnData = [];
    for(let colIndex=0; colIndex<columnStrings.length; colIndex++)
    {
        const colDetails = columnStrings[colIndex].split(':');
        if(colIndex==0 || colIndex==columnStrings.length-1)
            columnData.push([colDetails[0], 0]);
        else
            columnData.push([colDetails[0], colDetails[1]]);
    }

    const htmlColumnsInfo = {columnData:columnData, showWips:showWips, htmlColumns:[]};
    for(let colIndex=0; colIndex<columnData.length; colIndex++)
    {
        const htmlColumn = document.createElement('div');
        htmlColumn.id = `htmlColumn${colIndex}`;
        htmlColumn.className = 'selfFlexGrow selfCrossStretch flexCol flexStart crossCenter';
        htmlColumn.textContent = columnData[colIndex][0];
        htmlColumn.style.textAlign = 'center';
        htmlColumn.style.verticalAlign = 'middle';
        htmlColumn.style.fontWeight = 'bold';
        htmlColumnsInfo.htmlColumns.push(htmlColumn);
    }

    htmlColumnsInfo.outputDivContainer = outputDivContainer;
    return htmlColumnsInfo;
}

function LiveSessionTasksToHtmlColumns(dataTasks, htmlColumnsInfo=null, showPriority=false)
{
    if(!dataTasks || !htmlColumnsInfo)
        return null;

    const htmlTaskList = [];
    for(let taskIndex=0; taskIndex<dataTasks.rows.length; taskIndex++)
    {
        const htmlTask = TaskdataToHtmlCard(dataTasks.rows[taskIndex], htmlColumnsInfo.htmlColumns.length-1);
        /*const htmlTask = document.createElement('div');
        htmlTask.id = `htmlTask${taskIndex}`;
        htmlTask.className = 'mbaBox';
        htmlTask.textContent = `${dataTasks.rows[taskIndex].TaskNum}: ${dataTasks.rows[taskIndex].Name}\n${dataTasks.rows[taskIndex].Description}`;*/
        htmlTaskList.push(htmlTask);
        htmlColumnsInfo.htmlColumns[Math.min(dataTasks.rows[taskIndex].Column, htmlColumnsInfo.htmlColumns.length-1)].append(htmlTask);
    }

    if(htmlColumnsInfo.showWips)
    {

    }

    htmlColumnsInfo.htmlTaskList = htmlTaskList;
    if(htmlColumnsInfo.outputDivContainer!=null)
        for(let colIndex=0; colIndex<htmlColumnsInfo.htmlColumns.length; colIndex++)
            htmlColumnsInfo.outputDivContainer.append(htmlColumnsInfo.htmlColumns[colIndex]);

    return htmlColumnsInfo;
}

function TaskdataToHtmlCard(taskDataRow, maxColumn)
{
    if(!taskDataRow)
        return null;
    const rowIndex = taskDataRow.TaskNum;
    const taskMainDiv = document.createElement('div');
    taskMainDiv.id = `htmlTask${rowIndex}`;
    taskMainDiv.className = 'flexCol flexStart crossStretch mbaBox margin5';
    taskMainDiv.style.textAlign = 'center';
    taskMainDiv.style.verticalAlign = 'middle';
    taskMainDiv.style.minHeight = '125px';
    taskMainDiv.style.width = '200px';

    const ID = taskDataRow.ID;
    const TaskNum = taskDataRow.TaskNum;
    const Name = taskDataRow.Name;
    const Description = taskDataRow.Description;
    const DayStart = taskDataRow.DayStart;
    const DayEnd = taskDataRow.DayEnd;
    const DaysLocked = taskDataRow.DaysLocked;
    const Locked = (taskDataRow.Locked==true || taskDataRow.Locked==1 || taskDataRow.Locked=='true' || taskDataRow.Locked=='True' || taskDataRow.Locked=='TRUE')?true:false;
    const Owner = taskDataRow.Owner;
    const Helpers = taskDataRow.Helpers;
    const Column = taskDataRow.Column;
    const Priority = taskDataRow.Priority;
    const DaysStale = Math.max(0,(DayEnd>0)?(DayEnd-DayStart-Column):(cicConnectorDB.dataLiveSession.Day-DayStart-Column));
    const DaysLive = (DayEnd>0)?(DayEnd-DayStart):(cicConnectorDB.dataLiveSession.Day-DayStart);
    taskMainDiv.dataset.ID = ID;
    taskMainDiv.dataset.TaskNum = TaskNum;
    taskMainDiv.dataset.Name = Name;
    taskMainDiv.dataset.Description = Description;
    taskMainDiv.dataset.DayStart = DayStart;
    taskMainDiv.dataset.DayEnd = DayEnd;
    taskMainDiv.dataset.DaysLocked = DaysLocked;
    taskMainDiv.dataset.Locked = Locked;
    taskMainDiv.dataset.Owner = Owner;
    taskMainDiv.dataset.Helpers = Helpers;
    taskMainDiv.dataset.Column = Column;
    taskMainDiv.dataset.Priority = Priority;
    taskMainDiv.dataset.DaysStale = DaysStale;
    taskMainDiv.dataset.DaysLive = DaysLive;

    const taskTitleContainerDiv = document.createElement('div');
    taskTitleContainerDiv.id = `htmlTaskTitleContainer${rowIndex}`;
    taskTitleContainerDiv.className = 'flexRow flexBetween crossCenter selfCrossStretch mbaTableCell-title';
    taskMainDiv.append(taskTitleContainerDiv);
    {
        const taskRegressButton = document.createElement('button');
        taskRegressButton.id = `htmlTaskRegressButton${rowIndex}`;
        taskRegressButton.className = 'mbaIcon selfCrossCenter';
        taskRegressButton.style.backgroundImage = `url('./Icons/TriPrev.png')`;
        taskRegressButton.style.height = '16px';
        taskRegressButton.style.width = '16px';
        taskRegressButton.style.backgroundSize = '16px 16px';
        taskRegressButton.style.backgroundColor = 'transparent';
        taskRegressButton.style.border = 'none';
        taskRegressButton.style.margin = '0px 0px 0px 5px';
        taskRegressButton.addEventListener('click',()=>{cicServerRPC_MoveTask(ID, Column, -1, maxColumn);});
        taskTitleContainerDiv.append(taskRegressButton);
        const taskTitleDiv = document.createElement('div');
        taskTitleDiv.id = `htmlTaskTitle${rowIndex}`;
        taskTitleDiv.className = 'selfFlexGrow selfCrossStretch';
        taskTitleDiv.style.fontSize = '14px';
        taskTitleDiv.style.textAlign = 'center';
        taskTitleDiv.style.verticalAlign = 'middle';
        taskTitleDiv.textContent = taskDataRow.Name;
        taskTitleContainerDiv.append(taskTitleDiv);
        const taskAdvanceButton = document.createElement('button');
        taskAdvanceButton.id = `htmlTaskAdvanceButton${rowIndex}`;
        taskAdvanceButton.className = 'mbaIcon selfCrossCenter';
        taskAdvanceButton.style.backgroundImage = `url('./Icons/TriNext.png')`;
        taskAdvanceButton.style.height = '16px';
        taskAdvanceButton.style.width = '16px';
        taskAdvanceButton.style.backgroundSize = '16px 16px';
        taskAdvanceButton.style.backgroundColor = 'transparent';
        taskAdvanceButton.style.border = 'none';
        taskAdvanceButton.style.margin = '0px 5px 0px 0px';
        taskAdvanceButton.addEventListener('click',()=>{cicServerRPC_MoveTask(ID, Column, 1, maxColumn);});
        taskTitleContainerDiv.append(taskAdvanceButton);
    }

    const taskInfoPanelDiv = document.createElement('div');
    taskInfoPanelDiv.id = `htmlTaskInfoPanel${rowIndex}`;
    taskInfoPanelDiv.className = 'flexRow flexStart crossStretch crossCenter selfCrossStretch';
    taskInfoPanelDiv.style.borderStyle = 'hidden hidden solid hidden';
    taskInfoPanelDiv.style.borderWidth = '0px 0px 1px 0px';
    taskMainDiv.append(taskInfoPanelDiv);
    {
        const taskNumDiv = document.createElement('div');
        taskNumDiv.id = `htmlTaskNum${rowIndex}`;
        taskNumDiv.className = 'selfCrossStretch';
        taskNumDiv.style.fontSize = '20px';
        taskNumDiv.style.textAlign = 'center';
        taskNumDiv.style.verticalAlign = 'middle';
        taskNumDiv.style.fontWeight = 'bold';
        taskNumDiv.style.minHeight = '30px';
        taskNumDiv.style.minWidth = '30px';
        taskNumDiv.style.borderStyle = 'hidden solid hidden hidden';
        taskNumDiv.style.borderWidth = '0px 1px 0px 0px';
        taskNumDiv.textContent = taskDataRow.TaskNum;
        taskInfoPanelDiv.append(taskNumDiv);
        const taskDetailsDiv = document.createElement('div');
        taskDetailsDiv.id = `htmlTaskDetails${rowIndex}`;
        taskDetailsDiv.className = 'flexCol flexEvenly crossStretch selfFlexGrow selfCrossStretch';
        taskInfoPanelDiv.append(taskDetailsDiv);
        {
            const taskOwnerDiv = document.createElement('div');
            taskOwnerDiv.id = `htmlTaskOwner${rowIndex}`;
            taskOwnerDiv.className = 'selfCrossStretch';
            taskOwnerDiv.style.padding = '0px 3px 0px 3px';
            taskOwnerDiv.style.fontSize = '14px';
            taskOwnerDiv.style.textAlign = 'start';
            taskOwnerDiv.style.verticalAlign = 'middle';
            taskOwnerDiv.style.fontWeight = 'bold';
            taskOwnerDiv.style.overflow = 'clip';
            taskOwnerDiv.textContent = `${(taskDataRow.Owner=='')?'Unassigned':taskDataRow.Owner}`;
            taskDetailsDiv.append(taskOwnerDiv);
            const taskPriorityDiv = document.createElement('div');
            taskPriorityDiv.id = `htmlTaskPriority${rowIndex}`;
            taskPriorityDiv.className = 'flexRow flexStart crossCenter selfCrossStretch';
            taskPriorityDiv.style.padding = '0px 3px 0px 3px';
            taskPriorityDiv.style.fontSize = '12px';
            taskPriorityDiv.style.textAlign = 'start';
            taskPriorityDiv.style.verticalAlign = 'middle';
            taskPriorityDiv.style.fontWeight = 'normal';
            taskPriorityDiv.style.gap = '0px 2px';
            taskPriorityDiv.textContent = 'Priority: ';//`Priority: ${taskDataTable.rows[rowIndex].Priority}`;
            taskDetailsDiv.append(taskPriorityDiv);
            {
                for(let buttonPriority=1; buttonPriority<=5; buttonPriority++)
                {
                    const taskPriorityButton = document.createElement('button');
                    taskPriorityButton.id = `htmlTaskPriority${buttonPriority}Button${rowIndex}`;
                    taskPriorityButton.className = 'mbaIcon selfCrossCenter';
                    taskPriorityButton.style.backgroundImage = (Priority>=buttonPriority)?`url('./Icons/StarFull.png')`:`url('./Icons/StarEmpty.png')`;
                    taskPriorityButton.style.height = '10px';
                    taskPriorityButton.style.width = '10px';
                    taskPriorityButton.style.backgroundSize = '12px 10px';
                    taskPriorityButton.style.backgroundColor = 'transparent';
                    taskPriorityButton.style.border = 'none';
                    taskPriorityButton.addEventListener('click',()=>{cicServerRPC_PrioritizeTask(ID, Priority, buttonPriority);});
                    taskPriorityDiv.append(taskPriorityButton);
                }
                const taskLockButton = document.createElement('button');
                taskLockButton.id = `htmlTaskLockButton${rowIndex}`;
                taskLockButton.className = 'mbaIcon selfCrossCenter';
                taskLockButton.style.backgroundImage = Locked?`url('./Icons/LockClosed.png')`:`url('./Icons/LockOpen.png')`;
                taskLockButton.style.height = '16px';
                taskLockButton.style.width = '16px';
                taskLockButton.style.backgroundSize = '16px 16px';
                taskLockButton.style.backgroundColor = 'transparent';
                taskLockButton.style.border = 'none';
                taskLockButton.style.margin = '0px 0px 0px 10px';
                taskLockButton.addEventListener('click',()=>{cicServerRPC_LockTask(ID, !Locked);});
                taskPriorityDiv.append(taskLockButton);
            }
        }
    }
    const taskDescriptionDiv = document.createElement('div');
    taskDescriptionDiv.id = `htmlTaskDescription${rowIndex}`;
    taskDescriptionDiv.className = 'selfFlexGrow selfCrossStretch';
    taskDescriptionDiv.style.padding = '0px 3px 0px 3px';
    taskDescriptionDiv.style.fontSize = '12px';
    taskDescriptionDiv.style.textAlign = 'start';
    taskDescriptionDiv.style.verticalAlign = 'middle';
    taskDescriptionDiv.style.fontWeight = 'normal';
    taskDescriptionDiv.style.fontStyle = 'italic';
    taskDescriptionDiv.textContent = taskDataRow.Description;
    taskMainDiv.append(taskDescriptionDiv);

    const taskHelpersDiv = document.createElement('div');
    taskHelpersDiv.id = `htmlTaskHelpers${rowIndex}`;
    taskHelpersDiv.className = 'selfCrossStretch';
    taskHelpersDiv.style.padding = '0px 3px 0px 3px';
    taskHelpersDiv.style.fontSize = '12px';
    taskHelpersDiv.style.textAlign = 'start';
    taskHelpersDiv.style.verticalAlign = 'middle';
    taskHelpersDiv.style.fontWeight = 'normal';
    taskHelpersDiv.style.borderStyle = 'solid hidden hidden hidden';
    taskHelpersDiv.style.borderWidth = '1px 0px 0px 0px';
    taskHelpersDiv.textContent = (Helpers==''||Helpers=='none'||Helpers=='empty')?'':`Colab: ${taskDataRow.Helpers}`;
    taskMainDiv.append(taskHelpersDiv);

    const taskStatusPanelDiv = document.createElement('div');
    taskStatusPanelDiv.id = `htmlTaskStatusPanel${rowIndex}`;
    taskStatusPanelDiv.className = 'flexRow flexEvenly crossStretch crossCenter selfCrossStretch';
    taskStatusPanelDiv.style.borderStyle = 'solid hidden hidden hidden';
    taskStatusPanelDiv.style.borderWidth = '1px 0px 0px 0px';
    taskMainDiv.append(taskStatusPanelDiv);
    {
        const taskDayStartDiv = document.createElement('div');
        taskDayStartDiv.id = `htmlTaskDayStart${rowIndex}`;
        taskDayStartDiv.className = 'selfFlexGrow selfCrossStretch';
        taskDayStartDiv.style.fontSize = '12px';
        taskDayStartDiv.style.textAlign = 'center';
        taskDayStartDiv.style.verticalAlign = 'middle';
        taskDayStartDiv.style.fontWeight = 'normal';
        taskDayStartDiv.style.borderStyle = 'hidden solid hidden hidden';
        taskDayStartDiv.style.borderWidth = '0px 1px 0px 0px';
        taskDayStartDiv.textContent = `Start: ${DayStart}`;
        taskStatusPanelDiv.append(taskDayStartDiv);
        const taskDaysLockedDiv = document.createElement('div');
        taskDaysLockedDiv.id = `htmlTaskDaysLocked${rowIndex}`;
        taskDaysLockedDiv.className = 'selfFlexGrow selfCrossStretch';
        taskDaysLockedDiv.style.fontSize = '12px';
        taskDaysLockedDiv.style.textAlign = 'center';
        taskDaysLockedDiv.style.verticalAlign = 'middle';
        taskDaysLockedDiv.style.fontWeight = 'normal';
        taskDaysLockedDiv.style.borderStyle = 'hidden solid hidden hidden';
        taskDaysLockedDiv.style.borderWidth = '0px 1px 0px 0px';
        taskDaysLockedDiv.textContent = `Lock: ${DaysLocked}`;
        taskStatusPanelDiv.append(taskDaysLockedDiv);
        const taskDaysStaleDiv = document.createElement('div');
        taskDaysStaleDiv.id = `htmlTaskDaysStale${rowIndex}`;
        taskDaysStaleDiv.className = 'selfFlexGrow selfCrossStretch';
        taskDaysStaleDiv.style.fontSize = '12px';
        taskDaysStaleDiv.style.textAlign = 'center';
        taskDaysStaleDiv.style.verticalAlign = 'middle';
        taskDaysStaleDiv.style.fontWeight = 'normal';
        taskDaysStaleDiv.style.borderStyle = 'hidden solid hidden hidden';
        taskDaysStaleDiv.style.borderWidth = '0px 1px 0px 0px';
        taskDaysStaleDiv.textContent = `Stale: ${DaysStale}`;
        taskStatusPanelDiv.append(taskDaysStaleDiv);
        const taskDaysLiveDiv = document.createElement('div');
        taskDaysLiveDiv.id = `htmlTaskDaysLive${rowIndex}`;
        taskDaysLiveDiv.className = 'selfFlexGrow selfCrossStretch';
        taskDaysLiveDiv.style.fontSize = '12px';
        taskDaysLiveDiv.style.textAlign = 'center';
        taskDaysLiveDiv.style.verticalAlign = 'middle';
        taskDaysLiveDiv.style.fontWeight = 'normal';
        taskDaysLiveDiv.textContent = `Live: ${DaysLive}`;
        taskStatusPanelDiv.append(taskDaysLiveDiv);
    }
    
    return taskMainDiv;
}