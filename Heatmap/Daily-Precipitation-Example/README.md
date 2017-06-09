# Daily-Precipitation-Example

This example is meant to show how to load data from a CSV (Comma Seperated Value) file for daily precipitation levels of a river basin and or Time Series. It shows some of the options that can be used to configure and customize a Heatmap when using a set of data. Note, in this example the data used is specified using **JQuery**. Feel free to start with this example as a template and customize the chart to meet the needs of your visualization project.

## File Structure 
```
├── Daily-Precip-Example
│   ├── index.html
│   ├── javascript
│   │   ├── highcharts.js
│   │   ├── exporting.js
│   │   ├── heatmap.js
│   ├── data-files
│   │   ├── mock-data.csv
```

## What is a Heat Map

Heat maps visualize data through variations in coloring. When applied to a tabular format, Heat maps are useful for cross-examining multivariate data, through placing variables in the rows and columns, and coloring the cells within the table. Heat maps are good for showing variance across multiple variables, revealing any patterns, displaying whether any variables are similar to each other, and for detecting if any correlations exists in-between them.

Typically, all the rows would be one category (labels displayed on the left or right side) and all the columns would assigned be another (labels displayed on the top or bottom). The individual rows and columns are divided into subcategories, which all match up with each other in a matrix. The cells contained within the table either contain color-coded categorical data or numerical data that is based on a color scale. The data contained within a cell is based on the relationship between the two variables in the connecting row and column.

A legend is required alongside a Heat map in order for it to be successfully read. Categorical data is color-coded, while numerical data requires a color scale that blends from one color to another in-order to represent the difference in high and low values. A selection of solid colors can be used to represent a multiple range of values (0-10, 11-20, 21-30, etc.) or you can use a gradient scale for a single range (for example 0 - 100) by blending two or more colors together.

Because of their reliance on color to communicate values, Heat maps are a chart better suited to displaying a more generalized view of numerical data, as it's harder to accurately tell the differences between color shades and to extract specific data points from (unless of course you include the raw data in the cells).

Heat maps can also be used to show the changes in data over time, if one of the rows or columns are set to time intervals. An example of this would be to use a Heat map to compare the temperature changes across the year, over multiple cities, to see where the hottest or coldest places to live is. So the rows could list the cities to compare, the columns contain each month and the cells would contain the temperature values.

For more information refer to the link below:

* [Heat Map](http://www.datavizcatalogue.com/methods/heatmap.html)
* [Heat Map Documenation](https://developers.google.com/maps/documentation/javascript/examples/layer-fusiontables-heatmap)

## Additional Documentation

See also:
* [Highchart Documentation](https://www.highcharts.com/docs)
* [Highchart API Reference](http://api.highcharts.com/highcharts)
* [Highstock API Reference](http://api.highcharts.com/highstock/)
* [Highmaps API Reference](http://api.highcharts.com/highmaps/)
* [Highchart Heatmap Reference](https://www.highcharts.com/demo/heatmap)
* [TSTool](http://openwaterfoundation.org/software-tools/tstool)