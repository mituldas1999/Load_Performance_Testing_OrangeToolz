/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 89.88636363636364, "KoPercent": 10.113636363636363};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.24015151515151514, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.2852283770651118, 500, 1500, "manage-0"], "isController": false}, {"data": [0.3488824101068999, 500, 1500, "manage-1"], "isController": false}, {"data": [0.11545454545454545, 500, 1500, "profile"], "isController": false}, {"data": [0.1009090909090909, 500, 1500, "virtual_number_list"], "isController": false}, {"data": [0.31145935357492655, 500, 1500, "virtual_number_list-0"], "isController": false}, {"data": [0.24863636363636363, 500, 1500, "login"], "isController": false}, {"data": [0.3354368932038835, 500, 1500, "profile-0"], "isController": false}, {"data": [0.11272727272727273, 500, 1500, "manage"], "isController": false}, {"data": [0.29854368932038833, 500, 1500, "profile-1"], "isController": false}, {"data": [0.2713026444662096, 500, 1500, "virtual_number_list-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10560, 1068, 10.113636363636363, 4764.738257575766, 264, 91435, 1968.0, 20263.0, 20813.0, 50262.0, 64.690819539568, 358.4576876439616, 9.979563246992122], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["manage-0", 1029, 0, 0.0, 2256.3265306122457, 285, 51788, 1614.0, 3401.0, 3904.0, 25623.80000000123, 10.20762447052288, 12.436880468370251, 1.285921442087355], "isController": false}, {"data": ["manage-1", 1029, 88, 8.551992225461614, 3908.4616132167125, 275, 50848, 1452.0, 5963.0, 20271.0, 50259.7, 8.520116251148849, 60.76765334035753, 0.9256777177018043], "isController": false}, {"data": ["profile", 1100, 195, 17.727272727272727, 7861.488181818184, 530, 91435, 3562.0, 21147.4, 23470.45, 51491.83, 7.78733496159428, 60.317112668578105, 1.6472176869845316], "isController": false}, {"data": ["virtual_number_list", 1100, 278, 25.272727272727273, 8894.349999999995, 547, 62887, 4135.0, 21346.8, 22982.6, 51756.69, 6.814901091003711, 50.27312119759496, 1.7195040920383369], "isController": false}, {"data": ["virtual_number_list-0", 1021, 0, 0.0, 1957.8119490695399, 272, 50069, 1387.0, 2981.8, 3560.6, 20877.739999999525, 7.233644594958411, 8.813015423745625, 1.2644749829077693], "isController": false}, {"data": ["login", 1100, 24, 2.1818181818181817, 2544.4827272727293, 513, 50572, 1509.0, 3149.8, 4103.600000000004, 46467.39000000001, 10.971255311084958, 81.55768605004887, 1.2856939817677684], "isController": false}, {"data": ["profile-0", 1030, 0, 0.0, 1947.646601941747, 264, 50014, 1381.0, 3021.7, 3512.1499999999983, 6084.559999999992, 8.512255995768665, 10.370147549214064, 1.0141554994958761], "isController": false}, {"data": ["manage", 1100, 159, 14.454545454545455, 7347.980000000012, 566, 72060, 3550.5, 20303.2, 23595.250000000004, 52457.11, 9.085052610713756, 72.01272113843969, 2.0043816666735492], "isController": false}, {"data": ["profile-1", 1030, 125, 12.135922330097088, 4631.866019417473, 266, 50275, 1671.5, 20263.0, 20273.0, 50251.69, 7.308281773287166, 50.81359513360674, 0.7624803989044673], "isController": false}, {"data": ["virtual_number_list-1", 1021, 199, 19.49069539666993, 5762.1096963761, 275, 50282, 1856.0, 20269.0, 20275.0, 45953.11999999972, 6.33756044269815, 41.77378951664463, 0.6030206606953316], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 938, 87.82771535580524, 8.882575757575758], "isController": false}, {"data": ["503/Service Unavailable", 21, 1.9662921348314606, 0.19886363636363635], "isController": false}, {"data": ["504/Gateway Time-out", 109, 10.205992509363297, 1.0321969696969697], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10560, 1068, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 938, "504/Gateway Time-out", 109, "503/Service Unavailable", 21, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["manage-1", 1029, 88, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 75, "504/Gateway Time-out", 13, "", "", "", "", "", ""], "isController": false}, {"data": ["profile", 1100, 195, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 162, "504/Gateway Time-out", 27, "503/Service Unavailable", 6, "", "", "", ""], "isController": false}, {"data": ["virtual_number_list", 1100, 278, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 260, "504/Gateway Time-out", 17, "503/Service Unavailable", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 1100, 24, "503/Service Unavailable", 14, "504/Gateway Time-out", 10, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["manage", 1100, 159, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 136, "504/Gateway Time-out", 23, "", "", "", "", "", ""], "isController": false}, {"data": ["profile-1", 1030, 125, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 113, "504/Gateway Time-out", 12, "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list-1", 1021, 199, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 192, "504/Gateway Time-out", 7, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
