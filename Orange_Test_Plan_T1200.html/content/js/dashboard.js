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

    var data = {"OkPercent": 88.33770778652668, "KoPercent": 11.662292213473316};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.17139107611548557, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.19254658385093168, 500, 1500, "manage-0"], "isController": false}, {"data": [0.24267968056787934, 500, 1500, "manage-1"], "isController": false}, {"data": [0.07458333333333333, 500, 1500, "profile"], "isController": false}, {"data": [0.06416666666666666, 500, 1500, "virtual_number_list"], "isController": false}, {"data": [0.25882899628252787, 500, 1500, "virtual_number_list-0"], "isController": false}, {"data": [0.17416666666666666, 500, 1500, "login"], "isController": false}, {"data": [0.24100719424460432, 500, 1500, "profile-0"], "isController": false}, {"data": [0.07, 500, 1500, "manage"], "isController": false}, {"data": [0.21717625899280577, 500, 1500, "profile-1"], "isController": false}, {"data": [0.2053903345724907, 500, 1500, "virtual_number_list-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11430, 1333, 11.662292213473316, 5458.9402449693625, 257, 69635, 2400.0, 20264.0, 20905.649999999958, 43803.9300000001, 79.15128767996012, 434.24594581201046, 11.952200691881279], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["manage-0", 1127, 0, 0.0, 3164.4303460514643, 285, 49364, 2308.0, 4125.6, 5822.0, 41741.52000000004, 13.351024131354176, 16.26843706686174, 1.6819161259225475], "isController": false}, {"data": ["manage-1", 1127, 98, 8.695652173913043, 3957.4880212954745, 267, 47342, 1989.0, 17276.60000000017, 20270.0, 30852.640000000083, 11.177894152185987, 79.9763658392347, 1.1960042995715305], "isController": false}, {"data": ["profile", 1200, 231, 19.25, 8668.835833333329, 574, 66827, 4640.0, 22547.7, 24095.200000000004, 50468.08000000001, 9.800478590037814, 75.47381421865684, 2.0172013712502963], "isController": false}, {"data": ["virtual_number_list", 1200, 388, 32.333333333333336, 10209.285833333337, 633, 68665, 5382.0, 22453.7, 23633.95, 46205.68, 8.41331828284174, 58.84497190302248, 1.989139041477659], "isController": false}, {"data": ["virtual_number_list-0", 1076, 0, 0.0, 2319.491635687732, 290, 49071, 1672.0, 3578.0, 5116.799999999999, 36351.69000000004, 8.792286321294329, 10.713556136623632, 1.53693286280438], "isController": false}, {"data": ["login", 1200, 38, 3.1666666666666665, 3211.3975, 505, 50508, 2114.0, 4332.8, 6490.900000000005, 33777.44, 14.527669156547741, 106.93721739143594, 1.7024612292829384], "isController": false}, {"data": ["profile-0", 1112, 0, 0.0, 2946.859712230216, 276, 49837, 1958.0, 3769.7, 5582.449999999999, 45248.839999999975, 10.880519760080626, 13.258110855079696, 1.2963119245408559], "isController": false}, {"data": ["manage", 1200, 171, 14.25, 7922.823333333339, 571, 69635, 4645.0, 22664.90000000001, 24258.9, 50690.340000000004, 11.77729141926176, 94.06216339642363, 2.5781226997477695], "isController": false}, {"data": ["profile-1", 1112, 143, 12.859712230215827, 4802.341726618703, 264, 48755, 2089.0, 20258.0, 20268.0, 39276.2399999998, 9.102890495174321, 63.20692639817778, 0.9295646452574103], "isController": false}, {"data": ["virtual_number_list-1", 1076, 264, 24.53531598513011, 6730.101301115241, 257, 50247, 2274.5, 20264.0, 20269.0, 20313.92, 7.56085221204115, 48.009803064745064, 0.6694687552701107], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 1282, 96.17404351087772, 11.216097987751532], "isController": false}, {"data": ["503/Service Unavailable", 48, 3.600900225056264, 0.4199475065616798], "isController": false}, {"data": ["504/Gateway Time-out", 3, 0.2250562640660165, 0.026246719160104987], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11430, 1333, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 1282, "503/Service Unavailable", 48, "504/Gateway Time-out", 3, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["manage-1", 1127, 98, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 98, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["profile", 1200, 231, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 223, "503/Service Unavailable", 8, "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list", 1200, 388, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 385, "503/Service Unavailable", 2, "504/Gateway Time-out", 1, "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 1200, 38, "503/Service Unavailable", 37, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["manage", 1200, 171, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 170, "503/Service Unavailable", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["profile-1", 1112, 143, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 143, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list-1", 1076, 264, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 263, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
