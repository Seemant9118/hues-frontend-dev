'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Clock, Database, FileText, Globe } from 'lucide-react';
import { useState } from 'react';

const dataSourceItems = [
  {
    id: 'hues_books',
    label: 'Hues Books (Sales + Purchases + CN)',
    icon: Database,
  },
  { id: 'portal_gstr1', label: 'Portal GSTR-1 (Filed)', icon: FileText },
  { id: 'portal_gstr2a', label: 'Portal GSTR-2A', icon: Globe },
  { id: 'portal_gstr2b', label: 'Portal GSTR-2B', icon: Globe },
];

export default function FetchStep({ formData, setFormData }) {
  const [isFetching, setIsFetching] = useState(false);

  const handleFetch = () => {
    setIsFetching(true);
    // Simulate fetching
    setTimeout(() => {
      setFormData((prev) => ({
        ...prev,
        isFetched: true,
        fetchTime: new Date().toLocaleString(),
      }));
      setIsFetching(false);
    }, 2000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="mb-4">
          <h2 className="mb-2 text-2xl font-semibold">Fetch Data Sources</h2>
          <p className="text-muted-foreground">
            Pull all data needed for GSTR-3B preparation in one go.
          </p>
        </div>
        <Button size="sm" onClick={handleFetch} disabled={isFetching}>
          <Database size={18} className="mr-2" />
          {isFetching ? 'Fetching...' : 'Fetch now'}
        </Button>
      </div>

      <Card className="mb-4 w-full divide-y">
        {dataSourceItems.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between bg-muted/30 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-md border bg-background p-2 shadow-sm">
                <item.icon size={20} className="text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock size={14} />
              <span>
                {formData.isFetched
                  ? `Fetched at ${formData.fetchTime}`
                  : 'Not fetched'}
              </span>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
