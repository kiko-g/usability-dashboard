import mysql from 'mysql2'

export const estabilishMySQLConnection = () => {
  return mysql.createConnection({
    user: process.env.NEXT_PUBLIC_MYSQL_USER!,
    password: process.env.NEXT_PUBLIC_MYSQL_PASSWORD!,
    database: process.env.NEXT_PUBLIC_MYSQL_DATABASE!,
  })
}

export const clicksQuery = `
SELECT
  SUBSTRING_INDEX(matomo_log_action.name, ',', 1) AS x,
  SUBSTRING_INDEX(SUBSTRING_INDEX(matomo_log_action.name, ',', -2), ',', 1) AS y,
  SUBSTRING_INDEX(matomo_log_action.name, ',', -1) AS dateString
FROM
  (
    SELECT DISTINCT idaction_event_action
    FROM matomo_log_link_visit_action
    WHERE
      idaction_event_category IN (
        SELECT idaction
        FROM matomo_log_action
        WHERE name = "Mouse Click"
      )
  ) AS distinct_actions
JOIN matomo_log_action ON distinct_actions.idaction_event_action = matomo_log_action.idaction
WHERE
  matomo_log_action.type = 11
ORDER BY
  dateString ASC;
`

export const pageVisitsQuery = `
SELECT
  matomo_log_visit.idvisit AS id,
  matomo_log_visit.visit_total_time AS duration,
  matomo_log_visit.visit_first_action_time AS startTime,
  matomo_log_visit.visit_total_events AS totalEvents,
  matomo_log_visit.visit_total_actions AS totalActions,
  matomo_log_visit.visit_total_interactions AS totalInteractions,
  matomo_log_visit.config_os AS operatingSystem,
  matomo_log_visit.config_resolution AS deviceScreenSize,
  IFNULL(matomo_log_visit.config_browser_name, 'Unknown') AS browserName,
  IFNULL(matomo_log_visit.config_device_brand, 'Unknown') AS deviceBrand,
  CASE
    WHEN matomo_log_visit.config_device_type = 0 THEN 'Desktop'
    WHEN matomo_log_visit.config_device_type = 1 THEN 'Smartphone'
    WHEN matomo_log_visit.config_device_type = 2 THEN 'Tablet'
    WHEN matomo_log_visit.config_device_type = 3 THEN 'Feature Phone'
    WHEN matomo_log_visit.config_device_type = 4 THEN 'Console'
    WHEN matomo_log_visit.config_device_type = 5 THEN 'TV'
    WHEN matomo_log_visit.config_device_type = 6 THEN 'Car Browser'
    WHEN matomo_log_visit.config_device_type = 7 THEN 'Smart Display'
    WHEN matomo_log_visit.config_device_type = 8 THEN 'Camera'
    WHEN matomo_log_visit.config_device_type = 9 THEN 'Portable Media Player'
    WHEN matomo_log_visit.config_device_type = 10 THEN 'Smart Watch'
    ELSE 'Unknown'
  END AS deviceType
FROM
  matomo_log_visit
WHERE
  matomo_log_visit.visit_total_time > 0
ORDER BY
  matomo_log_visit.visit_first_action_time ASC;
`
