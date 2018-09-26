## line-symbology

This example is meant to show how to load a simple dataset from a CSV (Comma Separated Value) file. It also demonstrates how the configuration properties of a Highcharts element can be set through a JSON (Javascript Object Notation) file.  This allows for easier access to the configuration properties without modifying index.html.

## File Structure

```
├── line-symbology
│   ├── README.md
│   ├── index.html
│   ├── css
│   │   ├── highcharts.css
│   ├── javascript
│   │   ├── highstock.js
│   │   ├── data.js
│   ├── build-util
│   │   ├── run-http-server-8000.sh
│   ├── data-files
│   │   ├── testing.csv
│   │   ├── config.json
```
## config.JSON

Here are some things to note when creating a separate file for configuration properties:

 - The jQuery command to read the data file and set properties is preceded by a `$` and is similar to the following:
```
$.get('data-files/testing.csv', function(csvData) {
                    var myChart = Highcharts.stockChart('container', {data: {csv: csvData}});
                    myChart.update(data.Properties)
                });
```
 - Whereas the chart properties are specified in the file config.json in an earlier section of the script, the data itself must be read directly into index.html as `{data: {csv: csvData}}`  Only after the data has been loaded can the properties be specified through the `mychart.update` line.
 - In config.json, the specification are condensed under the "Properties" tag for organizational purposes.  This is not essential.
 - In the script of index.html, the line `async: false` overrides the Javascript functionality of running everything at once, preventing the elements from loading in the wrong order.  Especially with more complicated and larger data sets, this line is essential.
