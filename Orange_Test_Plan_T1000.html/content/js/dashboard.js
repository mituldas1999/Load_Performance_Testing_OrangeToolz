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

    var data = {"OkPercent": 99.23756019261637, "KoPercent": 0.7624398073836276};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.30883828250401285, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.3187311178247734, 500, 1500, "manage-0"], "isController": false}, {"data": [0.4164149043303122, 500, 1500, "manage-1"], "isController": false}, {"data": [0.145, 500, 1500, "profile"], "isController": false}, {"data": [0.1515, 500, 1500, "virtual_number_list"], "isController": false}, {"data": [0.3879396984924623, 500, 1500, "virtual_number_list-0"], "isController": false}, {"data": [0.3, 500, 1500, "login"], "isController": false}, {"data": [0.40160642570281124, 500, 1500, "profile-0"], "isController": false}, {"data": [0.1245, 500, 1500, "manage"], "isController": false}, {"data": [0.41214859437751006, 500, 1500, "profile-1"], "isController": false}, {"data": [0.43316582914572865, 500, 1500, "virtual_number_list-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9968, 76, 0.7624398073836276, 2743.9390048154105, 255, 70285, 1456.5, 3872.300000000001, 5276.849999999995, 46124.079999999965, 80.86380192911439, 485.31386071822595, 13.388204544025667], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["manage-0", 993, 0, 0.0, 2569.6424974823753, 267, 49930, 1463.0, 3111.6000000000004, 3511.0999999999985, 43887.779999999984, 10.977470207167968, 13.375186032468108, 1.3829039616451835], "isController": false}, {"data": ["manage-1", 993, 9, 0.9063444108761329, 1943.4189325276936, 255, 50270, 1084.0, 2508.8, 2927.399999999999, 38671.13999999998, 9.753270734294581, 73.53980252818921, 1.1372063214552313], "isController": false}, {"data": ["profile", 1000, 13, 1.3, 4216.999, 526, 51807, 2396.0, 5342.8, 7662.249999999985, 50815.87, 8.24347940778844, 71.86158180519834, 1.9423698354601509], "isController": false}, {"data": ["virtual_number_list", 1000, 15, 1.5, 4007.640999999998, 540, 70285, 2352.0, 5059.6, 6312.949999999994, 48620.520000000004, 8.222264247128376, 71.66451645891746, 2.3859260402192057], "isController": false}, {"data": ["virtual_number_list-0", 995, 0, 0.0, 1687.037185929648, 271, 50019, 1191.0, 2501.6, 2867.9999999999995, 21947.239999999998, 8.200436807186716, 9.990290311946264, 1.4334747934437715], "isController": false}, {"data": ["login", 1000, 4, 0.4, 2009.9499999999975, 508, 50539, 1265.5, 2674.9, 3138.1499999999974, 29124.10000000001, 11.245178629662531, 85.07568444482553, 1.317794370663578], "isController": false}, {"data": ["profile-0", 996, 0, 0.0, 1927.2279116465875, 256, 49520, 1176.5, 2486.9, 3075.499999999999, 37697.74999999992, 9.664929696369828, 11.77837496239799, 1.1514857646065617], "isController": false}, {"data": ["manage", 1000, 16, 1.6, 4773.455000000003, 537, 70186, 2626.0, 5823.5, 20278.55, 50264.96, 9.704686393059209, 84.45088230762885, 2.343738627320633], "isController": false}, {"data": ["profile-1", 996, 9, 0.9036144578313253, 2104.750000000002, 263, 50276, 1156.5, 2509.7000000000007, 3076.0999999999995, 47846.48999999997, 8.227936985237628, 61.9813168881298, 0.9622751980570172], "isController": false}, {"data": ["virtual_number_list-1", 995, 10, 1.0050251256281406, 2178.509547738692, 262, 50273, 1054.0, 2339.0, 2858.5999999999995, 43281.99999999991, 8.203952738636083, 61.816294328141616, 0.955603320333435], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 31, 40.78947368421053, 0.3109951845906902], "isController": false}, {"data": ["503/Service Unavailable", 2, 2.6315789473684212, 0.020064205457463884], "isController": false}, {"data": ["504/Gateway Time-out", 43, 56.578947368421055, 0.4313804173354735], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9968, 76, "504/Gateway Time-out", 43, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 31, "503/Service Unavailable", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["manage-1", 993, 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 5, "504/Gateway Time-out", 4, "", "", "", "", "", ""], "isController": false}, {"data": ["profile", 1000, 13, "504/Gateway Time-out", 11, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list", 1000, 15, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 9, "504/Gateway Time-out", 6, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 1000, 4, "503/Service Unavailable", 2, "504/Gateway Time-out", 2, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["manage", 1000, 16, "504/Gateway Time-out", 9, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 7, "", "", "", "", "", ""], "isController": false}, {"data": ["profile-1", 996, 9, "504/Gateway Time-out", 7, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 2, "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list-1", 995, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: 159.89.38.11:80 failed to respond", 6, "504/Gateway Time-out", 4, "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
