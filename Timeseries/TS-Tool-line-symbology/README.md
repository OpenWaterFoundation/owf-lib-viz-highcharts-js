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

## TSTool Compatibility

When loading data from TSTool that spans multiple years, it better to utilize the `highcharts.chart` option in index.html.  While the `highcharts.stockChart` option provides scaling functionality, it misrepresents data from TSTool at specific ranges and does not format the axis correctly.
