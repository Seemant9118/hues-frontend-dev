import { ruleEngineAPI } from '@/api/rule-engine-apis/ruleEngineAPI';
import { APIinstance } from '@/services';

export const getRulesEngine = () => {
  return APIinstance.get(ruleEngineAPI.getRulesEngine.endpoint);
};

export const getRulesEngineContexts = () => {
  return APIinstance.get(ruleEngineAPI.getRulesEngineContexts.endpoint);
};

export const createRulesEngine = ({ data }) => {
  return APIinstance.post(ruleEngineAPI.createRulesEngine.endpoint, data);
};

export const updateRulesEngine = ({ data }) => {
  return APIinstance.put(ruleEngineAPI.updateRulesEngine.endpoint, data);
};
