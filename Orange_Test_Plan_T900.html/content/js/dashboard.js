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

    var data = {"OkPercent": 98.80179171332587, "KoPercent": 1.1982082866741322};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3984322508398656, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.45828635851183763, 500, 1500, "manage-0"], "isController": false}, {"data": [0.5310033821871477, 500, 1500, "manage-1"], "isController": false}, {"data": [0.22111111111111112, 500, 1500, "profile"], "isController": false}, {"data": [0.21777777777777776, 500, 1500, "virtual_number_list"], "isController": false}, {"data": [0.5033898305084745, 500, 1500, "virtual_number_list-0"], "isController": false}, {"data": [0.3372222222222222, 500, 1500, "login"], "isController": false}, {"data": [0.5240761478163494, 500, 1500, "profile-0"], "isController": false}, {"data": [0.2, 500, 1500, "manage"], "isController": false}, {"data": [0.48824188129899215, 500, 1500, "profile-1"], "isController": false}, {"data": [0.5112994350282486, 500, 1500, "virtual_number_list-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8930, 107, 1.1982082866741322, 2493.340985442339, 264, 52507, 1065.0, 3409.800000000001, 4602.449999999999, 50259.0, 85.6323657739037, 510.97027964169615, 14.200241170660606], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["manage-0", 887, 0, 0.0, 1590.6832018038344, 282, 47727, 979.0, 2452.8, 2758.399999999999, 19022.48000000008, 8.802572296211025, 10.725072507095646, 1.1089177990343964], "isController": false}, {"data": ["manage-1", 887, 9, 1.0146561443066517, 1688.7891770011279, 273, 50278, 763.0, 2386.2, 2803.7999999999997, 50251.08, 8.80021430059627, 66.17687751753594, 1.0312751133511255], "isController": false}, {"data": ["profile", 900, 15, 1.6666666666666667, 3763.8522222222196, 540, 51586, 1749.0, 4706.099999999999, 5772.499999999996, 50466.05, 8.84938349294999, 76.82134830804704, 2.0832923639653105], "isController": false}, {"data": ["virtual_number_list", 900, 28, 3.111111111111111, 4514.82111111111, 561, 52507, 1751.0, 4793.099999999999, 34045.099999999955, 50845.9, 8.777833045615472, 75.16185272624864, 2.5459144673318312], "isController": false}, {"data": ["virtual_number_list-0", 885, 0, 0.0, 1497.8293785310725, 279, 49899, 806.0, 2177.6, 2555.2999999999993, 32046.479999999992, 8.726089528692565, 10.633361732153421, 1.5253613531601262], "isController": false}, {"data": ["login", 900, 12, 1.3333333333333333, 2220.688888888888, 510, 51516, 990.0, 2812.8999999999996, 3516.4499999999994, 50528.88, 9.535009376092553, 71.47733134290013, 1.1173839112608461], "isController": false}, {"data": ["profile-0", 893, 0, 0.0, 1388.5587905935054, 264, 45831, 757.0, 2189.0000000000005, 2660.7999999999997, 18181.61999999936, 8.804708991057256, 10.730430967334826, 1.0489985321376807], "isController": false}, {"data": ["manage", 900, 22, 2.4444444444444446, 3958.2255555555566, 566, 52478, 1884.5, 4931.299999999999, 5866.95, 50627.47, 8.902781624658726, 76.6937348838187, 2.1497667347564593], "isController": false}, {"data": ["profile-1", 893, 8, 0.8958566629339306, 2010.6438969764843, 267, 50271, 856.0, 2492.0, 2972.7999999999993, 49526.61999999996, 8.805056251787141, 66.29299382388902, 1.0318425295063056], "isController": false}, {"data": ["virtual_number_list-1", 885, 13, 1.4689265536723164, 2241.522033898302, 268, 50284, 792.0, 2295.7999999999997, 2903.799999999997, 50255.56, 8.656526629823446, 64.80565608646745, 1.014436714432435], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 107, 100.0, 1.1982082866741322], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8930, 107, "504/Gateway Time-out", 107, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["manage-1", 887, 9, "504/Gateway Time-out", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["profile", 900, 15, "504/Gateway Time-out", 15, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list", 900, 28, "504/Gateway Time-out", 28, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["login", 900, 12, "504/Gateway Time-out", 12, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["manage", 900, 22, "504/Gateway Time-out", 22, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["profile-1", 893, 8, "504/Gateway Time-out", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["virtual_number_list-1", 885, 13, "504/Gateway Time-out", 13, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
