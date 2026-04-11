import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import {
  getPromptTemplates,
  getPromptTemplate,
  createPromptTemplate,
  updatePromptTemplate,
  deletePromptTemplate,
  testPromptTemplate,
  PromptTemplatesFilter,
  CreatePromptTemplateData,
  UpdatePromptTemplateData,
} from '@/lib/api/prompt-templates';
import { PromptTemplate, PaginatedResponse } from '@/types/entities';

export function usePromptTemplates(filter?: PromptTemplatesFilter) {
  const key = ['prompt-templates', filter];
  return useSWR<PaginatedResponse<PromptTemplate>>(key, () => getPromptTemplates(filter));
}

export function usePromptTemplate(id: string | null) {
  return useSWR<PromptTemplate>(id ? `prompt-template-${id}` : null, () => getPromptTemplate(id!));
}

export function useCreatePromptTemplate() {
  return useSWRMutation('prompt-template-create', async (_key: string, { arg }: { arg: CreatePromptTemplateData }) => {
    return createPromptTemplate(arg);
  });
}

export function useUpdatePromptTemplate() {
  return useSWRMutation('prompt-template-update', async (_key: string, { arg }: { arg: { id: string; data: UpdatePromptTemplateData } }) => {
    return updatePromptTemplate(arg.id, arg.data);
  });
}

export function useDeletePromptTemplate() {
  return useSWRMutation('prompt-template-delete', async (_key: string, { arg }: { arg: string }) => {
    return deletePromptTemplate(arg);
  });
}

export function useTestPromptTemplate() {
  return useSWRMutation('prompt-template-test', async (_key: string, { arg }: { arg: string }) => {
    return testPromptTemplate(arg);
  });
}
