## TS-Tool-line-symbology

Building on the line-symbology example, this example demonstrates how to utilize CSV water data from TSTool to create a highcharts graph, along with a separate .json configuration file.

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

## Using an External .json File with External .csv file

When loading data from TSTool as a CSV file, always use the `highcharts.chart` constructor in index.html.  The `highcharts.stockChart` option applies default configuration values that misrepresent data.  The stockChart elements, such as a navigator, can be instead accessed by including them within the constructor itself.  The data must also be loaded directly into the constructor instead of the .json configuration file.  See the following example from [index.html:](https://github.com/OpenWaterFoundation/owf-lib-viz-highcharts-js/blob/master/Timeseries/TS-Tool-line-symbology/index.html)

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

For more information about highStock elements, see the online [documentation](https://www.highcharts.com/docs/chart-concepts/understanding-highstock)