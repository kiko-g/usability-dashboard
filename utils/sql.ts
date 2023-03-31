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
