# MapD Qlik Extension
![Qlik Image Example](https://user-images.githubusercontent.com/2932405/41377254-6347ca08-6f10-11e8-9df0-481bda43cb4c.png "Qlik Image Example")

# Requirements
* npm@5 or higher
* node 8.9.4 or higher

# Quick Start
```bash
npm install
```

Change `src/constants/connection.js`
to specify connection to MapD server.

Change `desktop` path in `deployment.config.json` to point to your Qlik extensions path.

eg: 
```
  "desktop": {
    "destination": "C:\Users\[user]\AppData\Local\Qlik\Sense\Extensions\"
  }
```

```bash
npm run watch-webpack-deploy-desktop
```

It will build the extension in the appropriate path and you should have access to MapD-Qlik within Qlik Sense.

# Examples Vega Specifications
To see examples of vega sepcifications to use in Qlik, check out http://vega-demo.mapd.com.  You can use the examples listed on that site as a base to build your vega specification.  To add the Qlik Filters to the SQL statement.  Add: `$qlikFilters` to the SQL statement in the vega spec.

eg:
```
{
  "width": $width,
  "height": $height,
  "data": [
    {
      "name": "fec_contributions_oct",
      "sql": "SELECT conv_4326_900913_x(lon) as x, conv_4326_900913_y(lat) as y, recipient_party as dim0, amount as val, rowid FROM fec_contributions_oct WHERE conv_4326_900913_x(lon) between $minXBounds and $maxXBounds and conv_4326_900913_y(lat) between $minYBounds and $maxYBounds $qlikFilters LIMIT 2000000"
    }
  ],
  "scales": ...
  "marks": ...
  ]
}
```


# Testing
```bash
npm run test
```
