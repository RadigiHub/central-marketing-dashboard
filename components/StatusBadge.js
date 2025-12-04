// components/StatusBadge.js
export default function StatusBadge({ status }) {
  const normalized = status?.toLowerCase() || "";

  let cls = "status-pill status-default";
  if (normalized.includes("track")) cls = "status-pill status-on-track";
  else if (normalized.includes("progress")) cls = "status-pill status-progress";
  else if (normalized.includes("delay") || normalized.includes("risk"))
    cls = "status-pill status-risk";

  return <span className={cls}>{status}</span>;
}
