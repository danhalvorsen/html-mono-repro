-- Daily DB summary (Postgres): database size and top table sizes
SELECT pg_database_size(current_database()) AS db_bytes;

SELECT SUM(n_live_tup) AS live_rows FROM pg_stat_all_tables;

SELECT relname AS table_name, pg_total_relation_size(relid) AS total_bytes
FROM pg_catalog.pg_statio_user_tables
ORDER BY total_bytes DESC
LIMIT 20;
