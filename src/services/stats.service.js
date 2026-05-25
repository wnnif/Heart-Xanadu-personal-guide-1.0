import { getDb } from '../db/index.js';
import { shDate } from '../utils/time.js';
export function bumpPv() {
  const today = shDate();
  const d = getDb();
  d.prepare('INSERT INTO stats_daily (date,pv) VALUES (?,1) ON CONFLICT(date) DO UPDATE SET pv=pv+1').run(today);
  return getStats();
}
export function getStats() {
  const d = getDb();
  const today = shDate();
  const total = d.prepare('SELECT COALESCE(SUM(pv),0) total FROM stats_daily').get().total || 0;
  const todayPv = d.prepare('SELECT COALESCE(pv,0) pv FROM stats_daily WHERE date=?').get(today)?.pv || 0;
  const todayVisitors = d.prepare("SELECT COUNT(DISTINCT visit_key) c FROM visits WHERE substr(created_at,1,10)=?").get(today)?.c || 0;
  const dailyRows = d.prepare('SELECT date,pv FROM stats_daily ORDER BY date DESC LIMIT 30').all();
  const daily = {}; dailyRows.reverse().forEach(r => daily[r.date] = r.pv);
  return { total, today: todayPv, todayPv, todayVisitors, date: today, daily };
}
