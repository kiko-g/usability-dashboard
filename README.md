# CMF MES Usability Dashboard

With the idea of delving into the behavior of CMF's MES users, we have created this a dashboard with the data collected from the analytics and usability study.

## Represented data and metrics

### General metrics

This table contains the tasks and main points of the development for the part of the analytics that concern general metrics.

| Metric              | Logic | Viz | Priority | Description                                                                 | Type                   |
| ------------------- | :---: | :-: | :------: | --------------------------------------------------------------------------- | ---------------------- |
| `Page Views`        |  ⏳   | ⏳  |    🟢    | Plotted Chart of page views (`x`: day, `y`: page views) with period toggler | Plotted Line Chart     |
| `Top Pages (URLs)`  |  ⏳   | ⏳  |    🟢    | Frequency of each URL that has been visited                                 | Histogram              |
| `Browsers`          |  ⏳   | ⏳  |    🟢    | Chart indicating what browser was being used on each page view              | Histogram or Pie Chart |
| `Operating Systems` |  ⏳   | ⏳  |    🟢    | Chart indicating what operating system was being used on each page view     | Histogram or Pie Chart |
| `Screen Sizes`      |  ⏳   | ⏳  |    🟢    | Chart indicating what screen size was being used on each page view          | Histogram or Pie Chart |
| `Pathways`          |  ⏳   | ⏳  |    🟡    | Frequent sequence of page navigation                                        | Multiple Lines Diagram |

### Events

#### Wizards

This table contains the tasks and main points of the development for the part of the analytics that concern Wizards inside MES.

| Metric                  | Logic | Viz | Priority | Description                                                      | Type      |
| ----------------------- | :---: | :-: | :------: | ---------------------------------------------------------------- | --------- |
| `Conversion rate`       |  ⏳   | ⏳  |    🟢    | Ratio of wizards submitted vs started                            | Ratio     |
| `Top Wizards`           |  ⏳   | ⏳  |    🟢    | Frequency of each title of opened wizards                        | Histogram |
| `Time spent on wizards` |  ⏳   | ⏳  |    🟢    | Total, average, max and min time spent per wizard                | Stat      |
| `Time spent on steps`   |  ⏳   | ⏳  |    🟢    | Total, average, max and min time spent per step per wizard       | Stat      |
| `Wizard scoring`        |  ⏳   | ⏳  |    🟢    | Average score of wizard interaction (multiple heuristic methods) | Score     |
| `Mouse clicks`          |  ⏳   | ⏳  |    🔴    | Mouse clicks heatmap                                             | Heatmap   |
| `Mouse movement`        |  ⏳   | ⏳  |    🔴    | Mouse movement heatmap                                           | Heatmap   |

#### Buttons

This table contains the tasks and main points of the development for the part of the analytics that concern general buttons inside MES.

| Metric                  | Logic | Viz | Priority | Description                                   | Type      |
| ----------------------- | :---: | :-: | :------: | --------------------------------------------- | --------- |
| `Top Buttons`           |  ⏳   | ⏳  |    🟢    | Frequency of each title of clicked buttons    | Histogram |
| `Top Buttons over time` |  ⏳   | ⏳  |    🟡    | Title of most clicked button in a time period | Start     |
| `Clicks per day`        |  ⏳   | ⏳  |    🟡    | Total clicks per day                          | Stat      |
