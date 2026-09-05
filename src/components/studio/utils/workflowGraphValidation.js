export function findUnconnectedNodes(nodes = [], edges = []) {
  if (nodes.length === 0) return [];

  // Check if any node is explicitly marked as a start node or system node
  const hasExplicitStart = nodes.some(
    (n) => n.content?.start || n.type === 'SYSTEM' || n.type === 'START',
  );

  // If no node is explicitly marked start, find the first non-END node with no incoming edges as root start
  const rootStartNodeId = !hasExplicitStart
    ? nodes.find(
        (n) => n.type !== 'END' && !edges.some((e) => e.targetId === n.id),
      )?.id
    : null;

  return nodes.filter((node) => {
    const isEnd = node.type === 'END';
    const isStart =
      Boolean(node.content?.start) ||
      node.type === 'SYSTEM' ||
      node.type === 'START' ||
      node.id === rootStartNodeId;

    const hasOutgoing = edges.some((e) => e.sourceId === node.id);
    const hasIncoming = edges.some((e) => e.targetId === node.id);

    if (isEnd) return !hasIncoming;
    if (isStart) return !hasOutgoing;
    return !hasOutgoing || !hasIncoming;
  });
}
