## TS-Tool-line-symbology

Continuing from the line-symbology example, this example demonstrates how to utilize CSV water data from TSTool to create a highcharts graph, along with a separate .json configuration file.

## File Structure

```
├── TS-Tool-line-symbology
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
│   │   ├── testing1.csv
│   │   ├── config1.json
│   ├── data-prep
│   │   ├── data_prep.TSTool
│   │   ├── example-streamflow.csv
```

## Using an External .json File with TSTool data

When loading data from TSTool as a CSV file, always use the `highcharts.chart` constructor in index.html.  While the `highcharts.stockChart` option provides scaling functionality, it misrepresents data from TSTool at specific ranges and does not format the axis correctly.  The stockChart elements, such as a navigator, can be accessed by including them within the constructor itself.  The data must also be loaded directly into the constructor instead of the .json configuration file.  See the following example from index.html:

```
$.get('data-prep/example-streamflow.csv', function(csvData) {
  var myChart = Highcharts.chart('container', {
  	data: {
  			csv: csvData    // data to be plotted
  	},
  	navigator: { // update chart based on zoom
   	 	adapToUpdatedData: true,
   	 	enabled: true
  	}
  });
  myChart.update(data.Properties);
});
```
