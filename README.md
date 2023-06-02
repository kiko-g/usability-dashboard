# CMF MES Usability Dashboard

With the idea of delving into the behavior of CMF's MES users, we have created this a dashboard with the data collected from the analytics and usability study.

## Running the project

1. We have 3 services: **Matomo**, **MySQL** and **NextJS** and we should be able to run them with:

```bash
docker compose up -d --build
```

2. The target website should be running in parellel to this, which for this project we expect it to be MES, whether it is locally or in a custom development environment. You should provide the information of the domain of the targetted website the **configuration of the Matomo Dashboard setup** which should be available at `http://localhost:8081`.

3. After doing this you should see a complaint about the trusted host setup on the Matomo Dashboard. To fix this open a bash shell on the root of this project and run `bash hosts.sh`.

4. You may need to troubleshoot a few things in the setup:

- You will probably need to replace the Matomo API Token once you are setting up the containers for the first time. Go to the Matomo Dashboard: click the `gear icon`, then `personal`, `security`. Scroll down to **create auth token** and copy it into your `.env`.
- Remember to change the content of the `matomoTrackerConfig` variable in `src/app/app.module.ts` on the `CoreHTML` that is being used in CMF's MES. This should match the ports that we have chosen on this side.

## Environment Variables

### Matomo

Here are all the possible environment variables for the Matomo instance:

- `MATOMO_DATABASE_HOST`: The hostname of your MySQL service. In this case, it would be the name of your MySQL service in docker-compose.yml.
- `MATOMO_DATABASE_DBNAME`: The name of your Matomo database.
- `MATOMO_DATABASE_USERNAME`: The username for your Matomo database.
- `MATOMO_DATABASE_PASSWORD`: The password for your Matomo database.
- `MATOMO_DATABASE_TABLES_PREFIX`: The prefix for the Matomo database tables.
- `MATOMO_DATABASE_ADAPTER`: The database adapter to use (PDO\MYSQL, MYSQLI).
- `MATOMO_DATABASE_CHARSET`: The character set to use for the Matomo database.
- `MATOMO_TRUSTED_HOSTS`: The list of trusted hosts.
- `MATOMO_PROXY_CLIENT_HEADERS`: The list of client headers used by a proxy.
- `MATOMO_PROXY_HOST_HEADERS`: The list of host headers used by a proxy.
- `MATOMO_SALT`: Salt used to hash passwords, tokens, etc. Needs to be a long, random and secure string.
- `MATOMO_SESSION_SAVE_HANDLER`: How sessions should be saved. "dbtable" by default.
- `MATOMO_SESSION_SAVE_PATH`: If the session save handler is set to "files", this is the path where the files will be saved.
- `MATOMO_MAIL_TRANSPORT`: The transport to use for sending mails ("smtp" or "sendmail" or "mail").
- `MATOMO_MAIL_HOST`: If the mail transport is set to "smtp", this is the host of your SMTP server.
- `MATOMO_MAIL_PORT`: If the mail transport is set to "smtp", this is the port of your SMTP server.
- `MATOMO_MAIL_USERNAME`: If the mail transport is set to "smtp", this is the username of your SMTP server.
- `MATOMO_MAIL_PASSWORD`: If the mail transport is set to "smtp", this is the password of your SMTP server.
- `MATOMO_MAIL_ENCRYPTION`: If the mail transport is set to "smtp", this is the encryption to use (ssl, tls).
- `MATOMO_GENERAL_FORCE_SSL`: If set to 1, Matomo will force the usage of SSL (https) for all connections.
- `MATOMO_GENERAL_FORCE_SSL_FOR_BACKEND`: If set to 1, Matomo will force the usage of SSL (https) for all connections for backend users.

### MySQL

- `MYSQL_ROOT_PASSWORD`: This is the one which is mandatory and allows you to set the root password.
- `MYSQL_DATABASE`: This variable will create the specified database on the MySQL server.
- `MYSQL_USER` && `MYSQL_PASSWORD`: These variables are used in conjunction to create a new user, and to set that user's password.

## Dashboard represented data and metrics

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
