import { Website } from '@/views/popup/hooks/use-websites-store'

type UpdateSavedWebsitesMessage = {
  action: 'update-saved-websites'
  websites: Website[]
}

type ChatInitializedMessage = {
  action: 'chat-initialized'
}

type ApplyChatResponseMessage = {
  action: 'apply-chat-response'
  client_id: number
}

type ChatResponseFinishedMessage = {
  action: 'chat-response-finished'
  content: string
  client_id: number
}

type GetTabDataMessage = {
  action: 'get-tab-data'
  url: string
}

type ContinueChatMessage = {
  action: 'continue_chat'
  prompt: string
}

export type Message =
  | UpdateSavedWebsitesMessage
  | ChatInitializedMessage
  | ApplyChatResponseMessage
  | GetTabDataMessage
  | ChatResponseFinishedMessage
  | ContinueChatMessage