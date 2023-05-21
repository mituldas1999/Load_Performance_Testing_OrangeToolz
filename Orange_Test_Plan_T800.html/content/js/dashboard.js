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

    var data = {"OkPercent": 98.82694248234107, "KoPercent": 1.1730575176589304};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.41668768920282545, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4167725540025413, 500, 1500, "manage-0"], "isController": false}, {"data": [0.5489199491740788, 500, 1500, "manage-1"], "isController": false}, {"data": [0.240625, 500, 1500, "profile"], "isController": false}, {"data": [0.24, 500, 1500, "virtual_number_list"], "isController": false}, {"data": [0.49174078780177893, 500, 1500, "virtual_number_list-0"], "isController": false}, {"data": [0.40875, 500, 1500, "login"], "isController": false}, {"data": [0.5240506329113924, 500, 1500, "profile-0"], "isController": false}, {"data": [0.18875, 500, 1500, "manage"], "isController": false}, {"data": [0.5455696202531646, 500, 1500, "profile-1"], "isController": false}, {"data": [0.5705209656925032, 500, 1500, "virtual_number_list-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 7928, 93, 1.1730575176589304, 2202.60469223008, 259, 52053, 1047.0, 2426.2000000000007, 3316.0, 50255.0, 77.00750842633875, 459.7455077233344, 12.769044861147536], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["manage-0", 787, 0, 0.0, 1474.2236340533666, 302, 49666, 1030.0, 2075.6000000000004, 2401.3999999999983, 3022.800000000001, 7.951904617560877, 9.689272159492775, 1.0017536090481964], "isController": false}, {"data": ["manage-1", 787, 11, 1.3977128335451081, 1884.4815756035568, 262, 50267, 693.0, 1711.6000000000001, 2062.9999999999973, 50255.12, 7.962605097281382, 59.65258772018576, 0.933117784837662], "isController": false}, {"data": ["profile", 800, 13, 1.625, 3149.10625, 531, 51142, 1538.5, 3475.3999999999996, 3930.499999999999, 50261.99, 7.989453920824511, 69.33355782866616, 1.8764293632405225], "isController": false}, {"data": ["virtual_number_list", 800, 21, 2.625, 3732.5925000000016, 539, 51642, 1549.5, 3511.5, 4294.349999999998, 50621.13, 7.9506266087596025, 68.3675274979875, 2.3063805020820705], "isController": false}, {"data": ["virtual_number_list-0", 787, 0, 0.0, 1259.7496823379931, 269, 49423, 812.0, 1755.6000000000006, 2092.199999999998, 2539.84, 7.84161335963811, 9.554261230595246, 1.370750772827365], "isController": false}, {"data": ["login", 800, 13, 1.625, 2083.8649999999993, 516, 52053, 965.0, 1732.8999999999996, 2092.499999999999, 50510.98, 8.061996755046307, 60.26226447002449, 0.9447652447319891], "isController": false}, {"data": ["profile-0", 790, 0, 0.0, 1110.7101265822776, 266, 38397, 775.5, 1691.6999999999994, 1999.199999999999, 2429.4700000000025, 7.99757035837214, 9.744784812208948, 0.9528355309779307], "isController": false}, {"data": ["manage", 800, 24, 3.0, 4121.723749999998, 587, 51962, 1799.5, 3976.099999999999, 4766.399999999994, 50924.21, 8.059154191767576, 69.07767466327846, 1.944349651441581], "isController": false}, {"data": ["profile-1", 790, 3, 0.379746835443038, 1441.898734177216, 264, 50267, 727.5, 1700.9, 2030.849999999999, 39689.0000000001, 7.932364045304844, 60.02690194744558, 0.9295739115591614], "isController": false}, {"data": ["virtual_number_list-1", 787, 8, 1.0165184243964422, 1704.110546378652, 259, 50267, 713.0, 1646.2000000000005, 1943.5999999999995, 50243.84, 7.85460497425047, 59.06513078116891, 0.9204615204199769], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 93, 100.0, 1.1730575176589304], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 7928, 93, "504/Gateway Time-out", 93, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["manage-1", 787, 11, "504/Gateway Time-out", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["profile", 800, 13, "504/Gateway Time-out", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list", 800, 21, "504/Gateway Time-out", 21, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 800, 13, "504/Gateway Time-out", 13, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["manage", 800, 24, "504/Gateway Time-out", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["profile-1", 790, 3, "504/Gateway Time-out", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list-1", 787, 8, "504/Gateway Time-out", 8, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
