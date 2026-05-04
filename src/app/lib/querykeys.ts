export const queryKeys = {
  users:            ["users"]                                    as const,
  conversations:    ["conversations"]                            as const,
  messages:         (conversationId: string) => ["messages", conversationId] as const,
};