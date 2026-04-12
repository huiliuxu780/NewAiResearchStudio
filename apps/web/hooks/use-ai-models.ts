import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  AIModelsFilter,
  getAIModels,
  testAIModel,
  TestAIModelResponse,
  UpdateAIModelData,
  updateAIModel,
} from "@/lib/api/ai-models";
import { AIModel, PaginatedResponse } from "@/types/entities";

export function useAIModels(filter?: AIModelsFilter) {
  const key = ["ai-models", filter];
  return useSWR<PaginatedResponse<AIModel>>(key, () => getAIModels(filter));
}

export function useUpdateAIModel() {
  return useSWRMutation(
    "ai-model-update",
    async (_key: string, { arg }: { arg: { id: string; data: UpdateAIModelData } }) => {
      return updateAIModel(arg.id, arg.data);
    },
  );
}

export function useTestAIModel() {
  return useSWRMutation(
    "ai-model-test",
    async (_key: string, { arg }: { arg: string }) => {
      return testAIModel(arg) as Promise<TestAIModelResponse>;
    },
  );
}
