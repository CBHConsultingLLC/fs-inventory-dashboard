function initialLoad(){
  $('#reportsBtn').on('click',function(){
    showSection('reportsDiv');
    $('#inventoryFilterOptionsBtn').show();
    $('#changesFilterOptionsBtn').hide();

    if(typeof(refTable) != "undefined"){
      refTable.redraw();
      $("#downloadCurrentTableBtn").show();
    } else {
      $("#downloadCurrentTableBtn").hide();
    };
  });

  $('#dashboardBtn').on('click',function(){
    showSection('dashboardDiv');
    $('#inventoryFilterOptionsBtn').hide();
    $('#changesFilterOptionsBtn').show();

    if(typeof(rpttable) != "undefined"){
      rpttable.redraw();
      $("#downloadCurrentTableBtn").show();
    } else {
      $("#downloadCurrentTableBtn").hide();
    };
  });

  $('#settingsBtn').on('click',function(){
    showSection('settingsDiv');
    $('#inventoryFilterOptionsBtn,#changesFilterOptionsBtn').hide();
  });

  $('#adminBtn').on('click',function(){
    showSection('adminDiv');
    $('#inventoryFilterOptionsBtn,#changesFilterOptionsBtn').hide();
  });

  $('#inventoryFilterOptionsBtn').on('click',function(){
    toggleLocationFilter();
  });

  $('#changesFilterOptionsBtn').on('click',function(){
    toggleChangesFilter();
  });

  $('#submitInventoryBtn').on('click',function(){
    submitInventoryRequest();
  });

  $('#submitFilterButton').on('click',function(){
    refreshChanges();
  });

  $('#downloadCurrentTableBtn').on('click',function(){
    const visibleChangeDiv = $('#dashboardDiv').is(':visible');
    const visibleRefDiv = $('#reportsDiv').is(':visible');
    let submitTableId = "";

    if(visibleChangeDiv){
      downloadTableDataToExcel(rpttable);
    } else if(visibleRefDiv){
      downloadTableDataToExcel(refTable);
    }
  });

  $("#locationCabinetTree").fancytree({
    extensions: ["glyph","filter"],
    quicksearch: true,
    glyph: {
      preset: "awesome5",
      map: {}
    },
    checkbox: true,
    autoScroll: true,
    selectMode: 1,
    tooltip: true,
    activate: function(event, data) {
      const node = data.node;
      const nodeLevel = node.getLevel();

      if(nodeLevel === 2){
        $("#submitInventoryBtn").attr("disabled", false);
      } else {
        $("#submitInventoryBtn").attr("disabled", true);
      }
    },
    filter: {
      autoApply: true,   // Re-apply last filter if lazy data is loaded
      autoExpand: true, // Expand all branches that contain matches while filtered
      counter: true,     // Show a badge with number of matching child nodes near parent icons
      fuzzy: false,      // Match single characters in order, e.g. 'fb' will match 'FooBar'
      hideExpandedCounter: true,  // Hide counter badge if parent is expanded
      hideExpanders: false,       // Hide expanders if all child nodes are hidden by filter
      highlight: true,   // Highlight matches by wrapping inside <mark> tags
      leavesOnly: false, // Match end nodes only
      nodata: true,      // Display a 'no data' status node if result is empty
      mode: "hide"       // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
    },
  });

  var mainLocationTree = $("#locationCabinetTree").fancytree("getTree");

  $("#btnradio1,#btnradio2,#btnradio3,#btnradio4,#btnradio5").on("click", function(e){
    const mainLocationTree = $("#locationCabinetTree").fancytree("getTree");
    const getActiveLocation = mainLocationTree.getActiveNode();

    if(getActiveLocation) {
      getActiveLocation.setActive(false);
    }

    $("#submitInventoryBtn").attr("disabled", true);
    mainLocationTree.clearFilter();

    let match = $(this).attr("locType");

    if(match){
      mainLocationTree.filterNodes(function(node) {
        return String(node.icon) === match;
      });
    } else {
      mainLocationTree.clearFilter();
    }

    $("#btnResetLocTypeSearchLabel").attr("disabled",false);
    $("#submitInventoryBtn").attr("disabled", true);
  });

  $("#btnResetLocTypeSearchLabel").on("click",function(){
    $("#btnradio1,#btnradio2,#btnradio3,#btnradio4,#btnradio5").prop("checked",false);
    mainLocationTree.clearFilter();
    mainLocationTree.reload();
  }).attr("disabled", true);

  const today = new Date();
  const cutoffDate = new Date(2025,6,3);
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysDiff = Math.floor((cutoffDate - today) / msPerDay);

  let dateMinus30 = new Date();
  let datePlus30 = new Date();
  datePlus30.setDate(today.getDate() + 30);

  if(daysDiff < 30) {
    dateMinus30 = cutoffDate;
  } else {
    dateMinus30.setDate(today.getDate() - 30);
  }

  $('#changesFilterStartDate').datepicker({
    format:"dd-M-yyyy",
    todayBtn:"linked",
    todayHighlight:true,
    autoclose:true,
    clearBtn:true,
    startDate: new Date(2025,6,3),
  }).datepicker("setDate", dateMinus30);

  $('#changesFilterStopDate').datepicker({
    format:"dd-M-yyyy",
    todayBtn:"linked",
    todayHighlight:true,
    autoclose:true,
    clearBtn:true,
    startDate: new Date(2025,6,4),
  }).datepicker("setDate", datePlus30);

  $("#changesFilterStartDate,#changesFilterStopDate").on('change',function(){
    changeFormValidation();
  });

  document.getElementById('reportsBtn').click();
}

function showSection(sectionId) {
  var sections = ['reportsDiv','dashboardDiv','settingsDiv','adminDiv'];
  var i;

  for (i = 0; i < sections.length; i++) {
    document.getElementById(sections[i]).style.display = sections[i] === sectionId ? 'block' : 'none';
  }

  var links = document.getElementsByClassName('nav-link');
  for (i = 0; i < links.length; i++) {
    links[i].className = links[i].className.replace(' active','');
  }

  event.currentTarget.className += ' active';
}

function changeFormValidation(){
  const startDateObj = $('#changesFilterStartDate').datepicker('getDate');
  const stopDateObj = $('#changesFilterStopDate').datepicker('getDate');

  if(startDateObj !== null && stopDateObj !== null){
    $("#submitFilterButton").attr("disabled",false);
  } else {
    $("#submitFilterButton").attr("disabled",true);
  }
}

function formatDateFields(dateObj,dateFormat){
  let finalDate = "";
  var inputDateMonth = dateObj.getMonth() + 1;
  var inputDateDay = dateObj.getDate();
				  
  if(inputDateMonth < 10){
    inputDateMonth = "0" + inputDateMonth.toString();
  } else {
    inputDateMonth = inputDateMonth.toString();
  }
				  
  if(inputDateDay < 10){
    inputDateDay = "0" + inputDateDay.toString();
  } else {
    inputDateDay = inputDateDay.toString();
  }
 
  if(dateFormat === 1){			    
    finalDate = dateObj.getFullYear().toString() + inputDateMonth + inputDateDay;
  } else if(dateFormat === 2){			    
    finalDate = inputDateMonth + '/' + inputDateDay + '/' + dateObj.getFullYear().toString();
  } else {
    finalDate = inputDateMonth + inputDateDay + dateObj.getFullYear().toString();
  }

  return finalDate;
}

function toggleLocationFilter(){
  $('#locationFilterDiv').toggle("fast");
}

function toggleChangesFilter(){
  $('#changeReportFilterDiv').toggle("fast");
}

function loadFormularyManager(){
  APPLINK(0,"phadbproductmgr.exe");
}

function downloadTableDataToExcel(tblObj){
  const today = new Date();
  const createDate = formatDateFields(today,1);

  let spreadsheetDocTitle = "";
  let inventoryLocationName = "";

  if(tblObj.element.id === "mainTable"){
    inventoryLocationName = $("#inventoryHeaderTitleLocation").attr("location");
    inventoryLocationName = inventoryLocationName.replace(/ /g,"_");
    spreadsheetDocTitle = "FSinventory_" + inventoryLocationName + "_" + createDate + ".xlsx";
  } else if(tblObj.element.id === "dashboardTableDiv"){
    const startDateStr = $('#changeHeaderTitleLocation').attr('sDate');
    const stopDateStr = $('#changeHeaderTitleLocation').attr('eDate');  
    spreadsheetDocTitle = "FSchanges_" + startDateStr + "_" +  stopDateStr + ".xlsx";
  }

  tblObj.download("xlsx",spreadsheetDocTitle,{sheetName:"Data"});
}

function refreshChanges(){
  const startDateObj = $('#changesFilterStartDate').datepicker('getDate');
  const stopDateObj = $('#changesFilterStopDate').datepicker('getDate');
  const startDateStr = formatDateFields(startDateObj,0);
  const stopDateStr = formatDateFields(stopDateObj,0);
  const startDateFDisp = formatDateFields(startDateObj,1);
  const stopDateFDisp = formatDateFields(stopDateObj,1);
  const startDateDisp = formatDateFields(startDateObj,2);
  const stopDateDisp = formatDateFields(stopDateObj,2);

  const reportName = "1_STJO_PHA_FS_ANALYSIS_RPT";
  const reportParam = '^MINE^,' + 1 + ',0.0,^' + startDateStr + '^,^' + stopDateStr + '^';

  console.log(reportName + "|" + reportParam);

  var initsync = new XMLCclRequest();
  initsync.onreadystatechange = function() {
    if(initsync.readyState == 4 && initsync.status == 200){
      var initjson = JSON.parse(initsync.responseText);
      $('#changeReportFilterDiv').hide();
      $('#changeHeaderTitleLocation').html([]).html("<b><u>Date Range</u></b>: " + startDateDisp + " to " + stopDateDisp);
      $('#changeHeaderTitleLocation').attr('sDate',"").attr('eDate',"");
      $('#changeHeaderTitleLocation').attr('sDate',startDateFDisp).attr('eDate',stopDateFDisp);
      $("#dashboardDiv,#downloadCurrentTableBtn,#refreshChangesTblBtn").show();

      initiateDetailTabulator01(initjson.MREC.QUAL);
    }
  }
  initsync.open("GET",reportName,1);
  initsync.send(reportParam);
}

function submitInventoryRequest(){
  const mainLocationTree = $("#locationCabinetTree").fancytree("getTree");
  let selectedLocationStr = "";
  let selectedLocationVal = 0;

  if(mainLocationTree?.activeNode?.key) {
    selectedLocationStr = mainLocationTree.activeNode.key;
    selectedLocationVal = parseFloat(selectedLocationStr);

    if(!isNaN(selectedLocationVal)){
      let fetchURL = "";
      if(selectedLocationVal === 2609228293.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/clinic_inventory_1.json";
      } else if(selectedLocationVal === 2609230529.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/clinic_inventory_2.json";
      } else if(selectedLocationVal === 2554275287.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/nurse_inventory_1.json";
      } else if(selectedLocationVal === 2554275551.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/nurse_inventory_2.json";
      } else if(selectedLocationVal === 6065135823.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/carousel_inventory_1.json";
      } else if(selectedLocationVal === 2554376983.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/pharmacy_inventory_1.json";
      } else if(selectedLocationVal === 2555556309.0){
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/cabinet_inventory_1.json";
      } else if(selectedLocationVal === 2554440165.0){    
        fetchURL = "https://ehrtechsolutions.com/fs-inventory-dashboard/data/ambulatory_inventory_1.json";
      }

      fetch(fetchURL)
      .then(response => {
        console.log("Fetch response:", response);
        return response.json();
      })
      .then(data => {
        console.log("Parsed data:", data);

        $("#reportFrame").attr("src","").hide();
        $("#locationFilterDiv").hide();
       $("#inventoryHeaderTitleLocation").text([]).text(data.IREC.LOCATION_VC).attr("location","").attr("location",data.IREC.LOCATION_VC);
        $("#tableDetailDiv,#downloadCurrentTableBtn,#refreshChangesTblBtn").show();
        initiateDetailTabulator02(data.IREC.QUAL);
      })
      .catch(error => {
        console.error("Fetch error:", error);
      });

    } else {
      console.log("Level 1 Location Selected");
    };
  } else {
    console.log("No Location Selected");
  };
}

function initiateDetailTabulator01(data){
  if(typeof(rpttable) != "undefined"){
    rpttable.destroy();
  };

  rpttable = new Tabulator("#dashboardTableDiv",{
    data:data,
    placeholder:"No Data Found!",
    layoutColumnsOnNewData:true,
    layout:"fitDataFill",
    height:"75vh",
    maxHeight:"75vh",
    pagination:true,
    paginationCounter:"rows",
    virtualDom:true,
    movableColumns:true,
    columnDefaults:{
      tooltip:true,
    },
    columns: [
    {
      title:"Change",
      field:"CHANGE_VC",
      headerFilter:"list",
      headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
     },
     {
       title:"Change Date/Time",
       field:"CHANGE_DT_TM",
      },
    {
      title:"Change Prsnl",
      field:"CHANGE_PRSNL_VC",
      headerFilter:"list",
      headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
     },
     {
       title:"Location",
       field:"LOCATION_VC",
       headerFilter:"list",
       headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
     {
       title:"Item ID",
       field:"ITEM_ID",
       headerFilter:"list",
       headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
     {
       title:"Description",
       field:"ITEM_DESC",
       headerFilter:"list",
       headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },

     {
       title:"Short Description",
       field:"ITEM_SDESC",
       headerFilter:"list",
       headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
     {
       title:"Omnicell ID",
       field:"ITEM_OMNI_ID",
       headerFilter:"list",
       headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
    ]
  });
}

function initiateDetailTabulator02(data){

  if(typeof(refTable) != "undefined"){
    refTable.destroy();
  };
  console.log(data);
  refTable = new Tabulator("#mainTable",{
    data:data,
    placeholder:"No Data Found!",
    layoutColumnsOnNewData:true,
    layout:"fitDataFill",
    height:"75vh",
    maxHeight:"75vh",
    pagination:true,
    paginationCounter:"rows",
    virtualDom:true,
    movableColumns:true,
    columnDefaults:{
      tooltip:true,
    },
    columns: [
      {
        title:"Item ID",
        field:"ITEM_ID",
        headerFilter:"list",
        headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
      {
        title:"Description",
        field:"ITEM_DESC",
        headerFilter:"list",
        headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
      {
        title:"Short Description",
        field:"ITEM_SDESC",
        headerFilter:"list",
        headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
      {
        title:"Omnicell ID",
        field:"ITEM_OMNI_ID",
        headerFilter:"list",
        headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },

/*
      {
        title:"Last Personnel",
        field:"UPDT_PRSNL",
        headerFilter:"list",
        headerFilterParams:{valuesLookup:"active",sort:"asc",clearable:true}
      },
      {
        title:"Change Date/Time",
        field:"UPDT_DT_TM",
      },
*/

    ]
  });
}
