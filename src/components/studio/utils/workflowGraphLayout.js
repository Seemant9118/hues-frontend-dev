export function mapStudioModuleToWorkflowModule(moduleName = '') {
  const upper = String(moduleName || '').toUpperCase();
  if (
    !moduleName ||
    upper === 'CUSTOM' ||
    upper === 'CUSTOM_WORKFLOW' ||
    upper.includes('CUSTOM') ||
    !Number.isNaN(Number(moduleName))
  ) {
    return 'CUSTOM_WORKFLOW';
  }
  if (
    upper.includes('INVOICE') ||
    upper.includes('B2C') ||
    upper.includes('B2B')
  ) {
    return 'INVOICE';
  }
  if (upper.includes('PAYMENT')) {
    return 'PAYMENT';
  }
  if (
    upper.includes('PURCHASE') ||
    upper.includes('SALES') ||
    upper.includes('ORDER')
  ) {
    return 'ORDER';
  }
  return upper || 'CUSTOM_WORKFLOW';
}

export const NODE_WIDTH = 220;

export function sortAndPositionNodes(nodes = [], edges = []) {
  if (nodes.length === 0) return [];

  // Check if nodes already have preserved visual coordinates
  const hasSavedPositions = nodes.some(
    (n) => n.position && typeof n.position.x === 'number' && n.position.x > 0,
  );

  if (hasSavedPositions) {
    // Preserve existing visual position coordinates and sort by x position ascending
    return [...nodes].sort(
      (a, b) => (a.position?.x || 0) - (b.position?.x || 0),
    );
  }

  // Topological sorting when no visual coordinates exist
  const inDegree = {};
  nodes.forEach((n) => {
    inDegree[n.id] = 0;
  });

  edges.forEach((e) => {
    if (inDegree[e.targetId] !== undefined) {
      inDegree[e.targetId] += 1;
    }
  });

  const queue = nodes.filter((n) => inDegree[n.id] === 0).map((n) => n.id);
  const orderedIds = [];
  const visited = new Set();

  while (queue.length > 0) {
    const currId = queue.shift();
    if (!visited.has(currId)) {
      visited.add(currId);
      orderedIds.push(currId);

      const outgoing = edges.filter((e) => e.sourceId === currId);
      outgoing.forEach((e) => {
        if (inDegree[e.targetId] !== undefined) {
          inDegree[e.targetId] -= 1;
          if (inDegree[e.targetId] <= 0 && !visited.has(e.targetId)) {
            queue.push(e.targetId);
          }
        }
      });
    }
  }

  nodes.forEach((n) => {
    if (!visited.has(n.id)) {
      orderedIds.push(n.id);
    }
  });

  return orderedIds
    .map((id, idx) => {
      const node = nodes.find((n) => n.id === id);
      if (!node) return null;
      return {
        ...node,
        position: {
          x: 60 + idx * 300,
          y: node.position?.y || 80,
        },
      };
    })
    .filter(Boolean);
}

export function computeSvgEdges(nodes = [], edges = []) {
  return edges
    .map((edge) => {
      const sourceNode = nodes.find((n) => n.id === edge.sourceId);
      const targetNode = nodes.find((n) => n.id === edge.targetId);

      if (!sourceNode || !targetNode) return null;

      const x1 = sourceNode.position.x + NODE_WIDTH;
      const y1 = sourceNode.position.y + 40;
      const x2 = targetNode.position.x;
      const y2 = targetNode.position.y + 40;

      const slotDistance = Math.round((x2 - x1) / 300);
      let pathD = '';
      const midX = (x1 + x2) / 2;
      let midY = (y1 + y2) / 2 - 20;

      if (slotDistance > 1) {
        const arcHeight = Math.min(100, 30 + (slotDistance - 1) * 35);
        const controlY = y1 - arcHeight;
        pathD = `M ${x1} ${y1} Q ${midX} ${controlY}, ${x2} ${y2}`;
        midY = controlY + 15;
      } else {
        const dx = Math.abs(x2 - x1) / 2;
        pathD = `M ${x1} ${y1} C ${x1 + Math.max(dx, 30)} ${y1}, ${x2 - Math.max(dx, 30)} ${y2}, ${x2} ${y2}`;
      }

      return {
        ...edge,
        pathD,
        midX,
        midY,
        x1,
        y1,
        x2,
        y2,
        sourceName: sourceNode.name,
        targetName: targetNode.name,
      };
    })
    .filter(Boolean);
}

export function computeCanvasWidth(nodes = []) {
  if (nodes.length === 0) return '100%';
  const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH + 100));
  return `${Math.max(1000, maxX)}px`;
}
