## TSTool-Combined-Example

![](README-docs/TS-Tool-Combined-Example.png)

This example demonstrates two charts that share a crosshairs and will synchronize the zoom function.

This file includes the following sections:

* [File Structure](#file-structure)
* [Combined Charts](#combined-charts)
* [Using External .json File with External .csv File](#using-external-.json-file-with-external-.csv-file)

## File Structure

```
├── TSTool-line-symbology
│   ├── README.md
│   ├── README-docs                            //contains images for README
│   ├── index.html
│   ├── css
│   │   ├── highcharts.css
│   ├── javascript
│   │   ├── highstock.js
│   │   ├── data.js
│   ├── build-util                             //contains script to run example on local python server
│   │   ├── run-http-server-8000.sh
│   ├── data-files                             //contains external .json file to set highcharts configuration properties
│   │   ├── config1.json
│   ├── data-prep                              //contains TSTool commands and example csv data set
│   │   ├── data_prep_new.TSTool
│   │   ├── data_prep_new2.TSTool
│   │   ├── example-streamflow-combined.csv
│   │   ├── example-precipitation-combined.csv
```

## Combined Charts

This combined chart example is actually two seperate charts, each showing data from different csv data files.  They are synchronized through functions that coordinate the crosshairs and tooltip and the syncExtremes function, which coordinates the zoom feature.  When a zoom interval is set by a user on one chart (by clicking and dragging), the syncExtremes function adjusts the interval on the other chart as well through the setExtremes command.  Note that syncExtremes is capable of synchronizing any number of charts, not just two at a time as demonstrated in this example.

```
function syncExtremes(e) {
    var thisChart = this.chart;

    if (e.trigger !== 'syncExtremes') { // Prevent feedback loop
        Highcharts.each(Highcharts.charts, function (chart) {
            if (chart !== thisChart) {
                if (chart.xAxis[0].setExtremes) { // It is null while updating
                    chart.xAxis[0].setExtremes(e.min,e.max,undefined,false,{ trigger: 'syncExtremes' });
                }
            }
        });
    }
}
```

The configuration properties are defined in the external .json file called config1.json. Properties that are shared between the two charts are listed under the 'properties' section, which is applied to all charts with the `Highcharts.setOptions(data.Properties);` command. Properties specific to each chart are listed under properties_1 or properties_2 in config1.json, which are applied with `.update( );` at the end of the jQuery `$.get` command:

```
$.get('data-prep/example-precipitation-combined.csv', function(csvData) {
Highcharts.chart(chartA, {
    data: {
        csv: csvData    // data to be plotted
    },
    //Use the setExtremes function to sync the zoom feature between the two charts
    xAxis: {
        events: {
            setExtremes: syncExtremes
        }
    }
}).update(data.Properties_1);
```

Another useful example can be found [here.](https://www.highcharts.com/demo/synchronized-charts)


## Using External .json File with External .csv File

When loading data from TSTool as a CSV file, always use the `highcharts.chart` constructor in index.html.  The `highcharts.stockChart` option applies default configuration values that may misrepresent data.  The stockChart elements, such as a navigator, can be instead accessed by including them within the constructor itself.  The data must also be loaded directly into the constructor instead of the .json configuration file.  See the following example from [index.html:](index.html)

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
