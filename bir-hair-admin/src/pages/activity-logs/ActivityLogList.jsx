import { useEffect, useState } from 'react';
import { getActivityLogs } from '../../api/activityLog.api.js';
import { PageHeader, Card, Badge } from '../../components/ui/index.js';
import { PageLoader, EmptyState } from '../../components/ui/Feedback.jsx';
import { formatDateTime } from '../../lib/format.js';

export default function ActivityLogList() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs().then((data) => setLogs(Array.isArray(data) ? data : data?.items || [])).catch(() => setLogs([])).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Activity Logs" subtitle="Audit trail of admin actions across the panel." />
      <Card padded={false}>
        {loading ? <PageLoader /> : logs.length === 0 ? <div className="p-6"><EmptyState title="No activity recorded yet" /></div> : (
          <div className="divide-y divide-border-soft">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <Badge tone="brand">{log.action || 'update'}</Badge>
                <span className="flex-1 text-[13px]"><span className="font-semibold">{log.userName}</span> {log.message}</span>
                <span className="text-[11.5px] text-ink-faint whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
