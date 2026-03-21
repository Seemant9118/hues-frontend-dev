'use client';

import { useEffect, useState } from 'react';
import { PlayCircleOutlined } from '@ant-design/icons';
import { toast } from 'sonner';
import { Button } from '../ui/button';

export default function JdmEditorClient({ onCancel }) {
  const [Editor, setEditor] = useState(null);
  const [value, setValue] = useState({ nodes: [], edges: [] });
  const [simulation, setSimulation] = useState();

  useEffect(() => {
    // Load EVERYTHING dynamically (critical)
    Promise.all([
      import('@gorules/jdm-editor'),
      import('@gorules/jdm-editor/dist/style.css'),
    ]).then(([mod]) => {
      setEditor({
        DecisionGraph: mod.DecisionGraph,
        JdmConfigProvider: mod.JdmConfigProvider,
        GraphSimulator: mod.GraphSimulator,
      });
    });
  }, []);

  if (!Editor) return <div className="p-4 text-center">Loading editor...</div>;

  const { DecisionGraph, JdmConfigProvider, GraphSimulator } = Editor;

  const handleSubmit = () => {
    // console.log('payload-', value);
  };

  return (
    <div
      className="border"
      style={{ height: 'calc(100vh - 150px)', width: '100%' }}
    >
      <JdmConfigProvider>
        <DecisionGraph
          value={value}
          onChange={setValue}
          simulate={simulation}
          panels={[
            {
              id: 'simulator',
              title: 'Simulator',
              icon: <PlayCircleOutlined />,
              renderPanel: () => (
                <GraphSimulator
                  onClear={() => setSimulation(undefined)}
                  onRun={async ({ graph, context }) => {
                    try {
                      const response = await fetch('/api/evaluate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ context, content: graph }),
                      });
                      const data = await response.json();
                      setSimulation({ result: { ...data, snapshot: graph } });
                    } catch (err) {
                      toast.error('Simulation failed:', err);
                    }
                  }}
                />
              ),
            },
          ]}
        />
      </JdmConfigProvider>

      <div className="flex items-center justify-end border border-t bg-white p-4">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            debounceTime={0}
            size="sm"
            onClick={handleSubmit}
            className="min-w-[100px]"
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
}
