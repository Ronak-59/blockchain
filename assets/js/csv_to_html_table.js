var CsvToHtmlTable = CsvToHtmlTable || {};

CsvToHtmlTable = {
    init: function (options) {
        options = options || {};
        var csv_path = options.csv_path || "";
        var el = options.element || "table-container";
        var allow_download = options.allow_download || false;
        var csv_options = options.csv_options || {};
        var datatables_options = options.datatables_options || {};
        var custom_formatting = options.custom_formatting || [];
        var customTemplates = {};
        $.each(custom_formatting, function (i, v) {
            var colIdx = v[0];
            var func = v[1];

            customTemplates[colIdx] = func;
        });



        // Use this to for columns using mutliple csv columns
        var custom_multi_cols = options.custom_multi_cols || [];
        var customMultiCol = {};

        $.each(custom_multi_cols, function (i, v) {
            var appliedColIdx = v[0];
            var contentArr = v[1];
           customMultiCol[appliedColIdx] = { contentArr:contentArr};   
           //customMultiCol[appliedColIdx].contentArr = contentArr;
           //customMultiCol[appliedColIdx].func = func;
         //   console.log("customMultiCol[appliedColIdx].contentArr: "+customMultiCol[appliedColIdx].contentArr);               
        });  

        var $table = $("<table class='table table-striped table-condensed' id='" + el + "-table'></table>");
        var $containerElement = $("#" + el);
        $containerElement.empty().append($table);

        $.when($.get(csv_path)).then(
            function (data) {
                var csvData = $.csv.toArrays(data, csv_options);
                // view data
                var $tableHead = $("<thead></thead>");
                var csvHeaderRow = csvData[0];
                var $tableHeadRow = $("<tr></tr>");
                var colsArr = [];

                // Set up columns and content display in columns
                // Start with headers because we don't need headers for all of the csv content
                for (var headerIdx = 0; headerIdx < csvHeaderRow.length; headerIdx++) {

                    // If this col has multicol content
                    if ( customMultiCol[headerIdx] ) {
                        //Loop through the columns and set aside the cols and headers for the columns
                        for (var headerIdx2 = 0; headerIdx2 < csvHeaderRow.length; headerIdx2++) {
                            if (! customMultiCol[headerIdx].contentArr.includes(headerIdx2)) {
                                colsArr.push(headerIdx2);
                                $tableHeadRow.append($("<th></th>").text(csvHeaderRow[headerIdx2]));
                            }
                        }

                    }                 
                }
                $tableHead.append($tableHeadRow);

                $table.append($tableHead);
                var $tableBody = $("<tbody></tbody>");

                for (var rowIdx = 1; rowIdx < csvData.length; rowIdx++) {
                    var $tableBodyRow = $("<tr></tr>");
                    $.each (colsArr, function(index, colIdx) {
                        var $tableBodyRowTd = $("<td></td>");
                        var cellTemplateFunc = customTemplates[colIdx];

                        if (cellTemplateFunc) {
                            console.log("ROW ID "+ rowIdx + "Col Id "+colIdx);
                            $tableBodyRowTd.html(cellTemplateFunc(csvData[rowIdx],rowIdx));
                        } else {
                            $tableBodyRowTd.text(csvData[rowIdx][colIdx]);
                        }
                        $tableBodyRow.append($tableBodyRowTd);
                        $tableBody.append($tableBodyRow);

                        //Add description row
                    });
                }
                $table.append($tableBody);

                $table.DataTable(datatables_options);

                if (allow_download) {
                    $containerElement.append("<p><a class='btn btn-info download' href='" + csv_path + "'><i class='glyphicon glyphicon-download'></i> Download as CSV</a></p>");
                }
            });
    }
};
