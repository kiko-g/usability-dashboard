import mysql from 'mysql2'

export const estabilishMySQLConnection = () => {
  return mysql.createConnection({
    user: process.env.NEXT_PUBLIC_MYSQL_USER,
    password: process.env.NEXT_PUBLIC_MYSQL_PASSWORD,
    database: process.env.NEXT_PUBLIC_MYSQL_DATABASE,
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
  matomo_log_visit.idvisitor AS visitorId,
  GROUP_CONCAT(DISTINCT matomo_log_action.name SEPARATOR ', ') AS pageTitles,
  GROUP_CONCAT(DISTINCT matomo_log_action_url.name SEPARATOR ', ') AS pageUrls,
  matomo_log_visit.visit_total_time AS duration,
  matomo_log_visit.visit_first_action_time AS startTime,
  matomo_log_visit.visit_total_events AS totalEvents,
  matomo_log_visit.visit_total_actions AS totalActions,
  matomo_log_visit.visit_total_interactions AS totalInteractions,
  matomo_log_visit.config_os AS operatingSystem,
  matomo_log_visit.config_resolution AS deviceScreenSize,
  CASE
    WHEN matomo_log_visit.config_browser_name = 'CH' THEN 'Chrome'
    WHEN matomo_log_visit.config_browser_name = 'FF' THEN 'Firefox'
    WHEN matomo_log_visit.config_browser_name = 'BR' THEN 'Brave'
    WHEN matomo_log_visit.config_browser_name = 'SF' THEN 'Safari'
    WHEN matomo_log_visit.config_browser_name = 'OP' THEN 'Opera'
    WHEN matomo_log_visit.config_browser_name = 'ED' THEN 'Edge'
    WHEN matomo_log_visit.config_browser_name = 'IE' THEN 'IE'
    ELSE IFNULL(matomo_log_visit.config_browser_name, matomo_log_visit.config_browser_name)
  END AS browserName,
  IFNULL(matomo_log_visit.config_device_brand, matomo_log_visit.config_device_brand) AS deviceBrand,
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
    ELSE matomo_log_visit.config_device_type
  END AS deviceType
FROM
  matomo_log_visit
JOIN matomo_log_link_visit_action ON matomo_log_visit.idvisit = matomo_log_link_visit_action.idvisit
JOIN matomo_log_action ON matomo_log_link_visit_action.idaction_name = matomo_log_action.idaction
JOIN matomo_log_action AS matomo_log_action_url ON matomo_log_link_visit_action.idaction_url = matomo_log_action_url.idaction
WHERE
  matomo_log_action.type = 4
GROUP BY
  matomo_log_visit.idvisit
ORDER BY
  matomo_log_visit.visit_first_action_time ASC;
`
