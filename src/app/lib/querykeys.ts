export const queryKeys = {
  users:            ["users"]                                    as const,
  conversations:    ["conversations"]                            as const,
  contacts:         () => ["contacts"]                           as const,
  messages:         (conversationId: string) => ["messages", conversationId] as const,
};