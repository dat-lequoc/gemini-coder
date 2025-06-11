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

export type Website = {
  url: string
  title: string
  content: string
  favicon?: string
}

export type UpdateSavedWebsitesMessage = {
  action: 'update-saved-websites'
  websites: Array<Website>
}

export type BrowserConnectionStatusMessage = {
  action: 'browser-connection-status'
  has_connected_browsers: boolean
}

export type ApplyChatResponseMessage = {
  action: 'apply-chat-response'
  client_id: number
}

export type ClientIdAssignmentMessage = {
  action: 'client-id-assignment'
  client_id: number
}

export type ChatResponseFinishedMessage = {
  action: 'chat-response-finished'
  content: string
  client_id: number
}

export type WebSocketMessage =
  | InitializeChatsMessage
  | UpdateSavedWebsitesMessage
  | BrowserConnectionStatusMessage
  | ClientIdAssignmentMessage
  | ApplyChatResponseMessage
  | ChatResponseFinishedMessage
