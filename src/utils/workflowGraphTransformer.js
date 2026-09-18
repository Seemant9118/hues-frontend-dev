/**
 * Bi-directional Transformer for No-Code Workflow Graphs
 * Converts between JDM/Visual Canvas format ({ nodes, edges }) and Backend API format ({ module, trigger, steps, transitions }).
 */
// export enum WorkflowStepType {
//   SYSTEM = 'SYSTEM',
//   FORM = 'FORM',
//   APPROVAL = 'APPROVAL',
//   STATUS_UPDATE = 'STATUS_UPDATE',
//   NOTIFICATION = 'NOTIFICATION',
//   DOCUMENT_UPLOAD = 'DOCUMENT_UPLOAD',
//   END = 'END',
// }

export const STEP_TYPES = [
  { type: 'SYSTEM', label: 'System Start', isStart: true, manualAction: false },
  { type: 'FORM', label: 'Custom Form', isStart: false, manualAction: true },
  { type: 'APPROVAL', label: 'Approval', isStart: false, manualAction: true },
  {
    type: 'DATA_UPDATE',
    label: 'Data Update',
    isStart: false,
    manualAction: false,
  },
  {
    type: 'DOCUMENT_UPLOAD',
    label: 'Document Upload',
    isStart: false,
    manualAction: true,
  },
  {
    type: 'NOTIFICATION',
    label: 'Notification',
    isStart: false,
    manualAction: false,
  },
  {
    type: 'DOCUMENT_GENERATION',
    label: 'Document Generation',
    isStart: false,
    manualAction: false,
  },
  {
    type: 'STATUS_UPDATE',
    label: 'Status Update',
    isStart: false,
    manualAction: false,
  },
  { type: 'END', label: 'Workflow End', isStart: false, manualAction: false },
];

export const ACTION_EVENTS = {
  SYSTEM: ['COMPLETED'],
  APPROVAL: ['APPROVED', 'REJECTED'],
  FORM: ['SUBMITTED'],
  DATA_UPDATE: ['COMPLETED', 'DATA_UPDATED'],
  DOCUMENT_UPLOAD: ['UPLOADED'],
  STATUS_UPDATE: ['STATUS_UPDATED'],
  NOTIFICATION: ['NOTIFIED'],
  DOCUMENT_GENERATION: ['DOCUMENT_GENERATED'],
  END: ['COMPLETED'],
};

/**
 * Sorts nodes topologically according to edge execution flow (from -> to) and visual position.
 * Ensures the `steps` array sent to backend is ordered in the exact execution sequence.
 */
export function sortNodesTopologically(nodes = [], edges = []) {
  if (nodes.length <= 1) return nodes;

  const inDegree = {};
  nodes.forEach((n) => {
    const id = n.id || n.content?.key;
    inDegree[id] = 0;
  });

  edges.forEach((e) => {
    const toId = e.targetId || e.to;
    if (inDegree[toId] !== undefined) {
      inDegree[toId] += 1;
    }
  });

  const getXPos = (n) => n.position?.x ?? 0;
  const roots = nodes
    .filter((n) => {
      const id = n.id || n.content?.key;
      return inDegree[id] === 0;
    })
    .sort((a, b) => getXPos(a) - getXPos(b));

  const orderedNodes = [];
  const visited = new Set();
  const queue = roots.map((n) => n.id || n.content?.key);

  while (queue.length > 0) {
    const currId = queue.shift();
    if (!visited.has(currId)) {
      visited.add(currId);
      const node = nodes.find((n) => (n.id || n.content?.key) === currId);
      if (node) {
        orderedNodes.push(node);
      }

      const outgoingEdges = edges.filter(
        (e) => (e.sourceId || e.from) === currId,
      );
      const targetNodes = outgoingEdges
        .map((e) => {
          const toId = e.targetId || e.to;
          return nodes.find((n) => (n.id || n.content?.key) === toId);
        })
        .filter(Boolean)
        .sort((a, b) => getXPos(a) - getXPos(b));

      targetNodes.forEach((tNode) => {
        const tId = tNode.id || tNode.content?.key;
        if (inDegree[tId] !== undefined) {
          inDegree[tId] -= 1;
          if (inDegree[tId] <= 0 && !visited.has(tId)) {
            queue.push(tId);
          }
        }
      });
    }
  }

  const remaining = nodes
    .filter((n) => !visited.has(n.id || n.content?.key))
    .sort((a, b) => getXPos(a) - getXPos(b));

  return [...orderedNodes, ...remaining];
}

/**
 * Transforms visual canvas ({ nodes, edges }) into the backend graph schema.
 */
export function transformCanvasToBackendGraph({
  nodes = [],
  edges = [],
  moduleName = 'ORDER',
  triggerType,
  graphConfig = {},
}) {
  const isCustom =
    moduleName === 'CUSTOM_WORKFLOW' ||
    moduleName === 'CUSTOM' ||
    String(moduleName).toUpperCase().includes('CUSTOM');

  const resolvedTriggerType =
    triggerType || (isCustom ? 'MANUAL_START' : 'RECORD_CREATED');

  const orderedNodes = sortNodesTopologically(nodes, edges);

  const steps = orderedNodes.map((node) => {
    const content = node.content || {};
    const stepKey =
      node.id ||
      content.key ||
      `STEP_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const step = {
      key: stepKey,
      label: node.name || content.label || stepKey,
      type: node.type || content.type || 'SYSTEM',
    };

    if (content.start || node.type === 'SYSTEM' || content.isStart) {
      step.start = true;
    }

    if (step.type === 'APPROVAL' && content.assignee) {
      step.assignee = content.assignee;
    }

    if (step.type === 'FORM') {
      if (content.formConfigurationId) {
        step.formConfigurationId = Number(content.formConfigurationId);
      }
      if (content.required !== undefined) {
        step.required = Boolean(content.required);
      }
    }

    if (content.config) {
      step.config = content.config;
    }

    if (step.type === 'STATUS_UPDATE' && content.statusConfig) {
      step.statusConfig = content.statusConfig;
    }

    if (step.type === 'DOCUMENT_UPLOAD' && content.documentConfig) {
      step.documentConfig = content.documentConfig;
    }

    // Preserve visual position in metadata for canvas reload
    if (node.position) {
      step._visualPosition = node.position;
    }

    return step;
  });

  const transitions = edges
    .map((edge) => {
      const fromKey = edge.sourceId || edge.from;
      const toKey = edge.targetId || edge.to;

      if (!fromKey || !toKey) return null;

      const transition = {
        from: fromKey,
        to: toKey,
      };

      if (edge.type && edge.type !== 'DEFAULT' && edge.type !== 'STANDARD') {
        transition.on = edge.type;
      } else if (edge.on) {
        transition.on = edge.on;
      } else {
        const sourceNode = orderedNodes.find(
          (n) => (n.id || n.content?.key) === fromKey,
        );
        const sourceType =
          sourceNode?.type || sourceNode?.content?.type || 'SYSTEM';
        const available = ACTION_EVENTS[sourceType] || ['COMPLETED'];
        transition.on = available[0] || 'COMPLETED';
      }

      if (edge.condition) {
        transition.condition = edge.condition;
      }

      return transition;
    })
    .filter(Boolean);

  return {
    module: isCustom ? 'CUSTOM_WORKFLOW' : moduleName,
    trigger: {
      type: resolvedTriggerType,
    },
    config: graphConfig,
    steps,
    transitions,
  };
}

/**
 * Transforms backend graph schema ({ module, trigger, steps, transitions }) into visual canvas ({ nodes, edges }).
 */
export function transformBackendGraphToCanvas(graphPayload = {}) {
  const { steps = [], transitions = [], config = {} } = graphPayload;

  const nodes = steps.map((step, index) => {
    // Determine position: use preserved visual position or calculate default grid position
    const visualPosition = step._visualPosition || {
      x: 100 + (index % 4) * 220,
      y: 100 + Math.floor(index / 4) * 160,
    };

    return {
      id: step.key,
      name: step.label || step.key,
      type: step.type,
      position: visualPosition,
      content: {
        key: step.key,
        label: step.label,
        type: step.type,
        start: Boolean(step.start),
        assignee: step.assignee || null,
        formConfigurationId: step.formConfigurationId || null,
        required: step.required,
        statusConfig: step.statusConfig || null,
        documentConfig: step.documentConfig || null,
        config: step.config || null,
      },
    };
  });

  const edges = transitions.map((trans, idx) => {
    const hasSiblingWithCondition = transitions.some(
      (other) =>
        other.from === trans.from &&
        other.on === trans.on &&
        Boolean(other.condition),
    );
    const isElse = !trans.condition && hasSiblingWithCondition;

    return {
      id: `edge_${trans.from}_${trans.to}_${idx}`,
      sourceId: trans.from,
      targetId: trans.to,
      type: trans.on || 'DEFAULT',
      on: trans.on || 'DEFAULT',
      label: trans.on || '',
      condition: trans.condition || null,
      isElse,
    };
  });

  return {
    nodes,
    edges,
    moduleName: graphPayload.module || 'ORDER',
    triggerType: graphPayload.trigger?.type || 'RECORD_CREATED',
    graphConfig: config,
  };
}
