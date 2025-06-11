export type Chat = {
  url: string
  model?: string
  temperature?: number
  top_p?: number
  system_instructions?: string
  options?: string[]
}

export type InitializeChatsMessage = {
  action: 'initialize-chats'
  text: string
  chats: Chat[]
  client_id: number // Client ID to identify which editor sent this message
}

export type ApplyChatResponseMessage = {
  action: 'apply-chat-response'
  client_id: number
}

export type ChatResponseFinishedMessage = {
  action: 'chat-response-finished'
  content: string
  client_id: number
}

export type WebSocketMessage =
  | InitializeChatsMessage
  | ApplyChatResponseMessage
  | ChatResponseFinishedMessage
