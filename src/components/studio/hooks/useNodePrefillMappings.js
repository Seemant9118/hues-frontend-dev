import { usePreviousNodesFields } from '@/components/studio/hooks/usePreviousNodesFields';

export function checkIsNumeric(key = '', type = '', label = '') {
  const lowerType = String(type || '').toLowerCase();
  if (
    ['number', 'numeric', 'currency', 'decimal', 'integer', 'float'].includes(
      lowerType,
    )
  ) {
    return true;
  }
  const lowerKey = String(key || '').toLowerCase();
  const lowerLabel = String(label || '').toLowerCase();
  const numericKeywords = [
    'amount',
    'price',
    'total',
    'tax',
    'tds',
    'fee',
    'rate',
    'qty',
    'quantity',
    'cost',
    'val',
    'value',
    'num',
    'count',
    'percentage',
    'discount',
  ];
  return numericKeywords.some(
    (kw) => lowerKey.includes(kw) || lowerLabel.includes(kw),
  );
}

export function useNodePrefillMappings({
  node,
  nodes = [],
  edges = [],
  moduleName = 'ORDER',
  activeFields = [],
  onUpdateNodeDataConfig,
}) {
  const nodeContent = node?.content || {};
  const nodeId = node?.id || nodeContent.key;
  const nodeType = node?.type || nodeContent.type || 'SYSTEM';
  const isSystemStart = nodeType === 'SYSTEM' || Boolean(nodeContent.start);
  const config = nodeContent.config || {};
  const prefillMappings = Array.isArray(config.prefillMappings)
    ? config.prefillMappings
    : [];

  const { precedingNodes, sourceOptions, isLoading } = usePreviousNodesFields({
    nodes,
    edges,
    currentNodeId: nodeId,
    moduleName,
    isOpen: true,
  });

  const shouldHideCard =
    isSystemStart || (!isLoading && precedingNodes.length === 0);

  const handleUpdateMappings = (newMappings) => {
    onUpdateNodeDataConfig?.(nodeId, {
      ...config,
      prefillMappings: newMappings,
    });
  };

  const handleAddRow = () => {
    const defaultSource =
      sourceOptions[0]?.sourcePath ||
      (precedingNodes[0]
        ? `forms.${precedingNodes[0].id || precedingNodes[0].content?.key}.values.amount`
        : '');
    const defaultTarget =
      activeFields[0]?.mappingKey || activeFields[0]?.key || '';

    const newMappings = [
      ...prefillMappings,
      {
        sourcePath: defaultSource,
        targetFieldKey: defaultTarget,
      },
    ];
    handleUpdateMappings(newMappings);
  };

  const handleRemoveRow = (index) => {
    const newMappings = prefillMappings.filter((_, i) => i !== index);
    handleUpdateMappings(newMappings);
  };

  const handleSourceChange = (index, val) => {
    const newMappings = [...prefillMappings];
    newMappings[index] = {
      ...newMappings[index],
      sourcePath: val,
    };
    handleUpdateMappings(newMappings);
  };

  const handleTargetChange = (index, val) => {
    const newMappings = [...prefillMappings];
    newMappings[index] = {
      ...newMappings[index],
      targetFieldKey: val,
    };
    handleUpdateMappings(newMappings);
  };

  const handleEnableCondition = (index) => {
    const newMappings = [...prefillMappings];
    newMappings[index] = {
      ...newMappings[index],
      operation: 'PERCENTAGE',
      percentage: newMappings[index].percentage ?? 10,
    };
    handleUpdateMappings(newMappings);
  };

  const handleRemoveCondition = (index) => {
    const newMappings = [...prefillMappings];
    const { operation, percentage, ...rest } = newMappings[index];
    newMappings[index] = rest;
    handleUpdateMappings(newMappings);
  };

  const handlePercentageChange = (index, percentageVal) => {
    const newMappings = [...prefillMappings];
    newMappings[index] = {
      ...newMappings[index],
      operation: 'PERCENTAGE',
      percentage: percentageVal,
    };
    handleUpdateMappings(newMappings);
  };

  return {
    prefillMappings,
    precedingNodes,
    sourceOptions,
    isLoading,
    shouldHideCard,
    handleAddRow,
    handleRemoveRow,
    handleSourceChange,
    handleTargetChange,
    handleEnableCondition,
    handleRemoveCondition,
    handlePercentageChange,
  };
}
