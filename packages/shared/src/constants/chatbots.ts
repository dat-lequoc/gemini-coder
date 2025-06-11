type Chatbots = {
  [name: string]: {
    url: string
    supports_custom_temperature: boolean
    supports_custom_top_p: boolean
    supports_system_instructions: boolean
    supports_user_provided_model: boolean
    supports_user_provided_port: boolean
    default_system_instructions: string
    default_top_p: number
    supported_options: {
      [option: string]: string
    }
    models: {
      [model: string]: string
    }
  }
}

export const CHATBOTS = {
  'AI Studio': {
    url: 'https://aistudio.google.com/prompts/new_chat',
    supports_custom_temperature: true,
    supports_custom_top_p: true,
    supports_system_instructions: true,
    supports_user_provided_model: false,
    supports_user_provided_port: false,
    default_system_instructions: "You're a helpful coding assistant.",
    default_top_p: 0.95,
    supported_options: {
      // TODO
      // close sidebar
      // close settings
    },
    models: {
      'gemini-2.5-flash-preview-04-17': 'Gemini 2.5 Flash Preview 04-17',
      'gemini-2.5-flash-preview-05-20': 'Gemini 2.5 Flash Preview 05-20',
      'gemini-2.5-pro-preview-05-06': 'Gemini 2.5 Pro Preview 05-06',
      'gemini-2.5-pro-preview-06-05': 'Gemini 2.5 Pro Preview 06-05',
      'gemini-2.0-flash': 'Gemini 2.0 Flash',
      'gemini-2.0-flash-lite': 'Gemini 2.0 Flash-Lite'
    }
  },
  Gemini: {
    url: 'https://gemini.google.com/app',
    supports_custom_temperature: false,
    supports_custom_top_p: false,
    supports_system_instructions: false,
    supports_user_provided_model: false,
    supports_user_provided_port: false,
    supported_options: { canvas: 'Canvas' },
    default_system_instructions: '',
    default_top_p: 0,
    models: {
      '2.5-flash': '2.5 Flash',
      '2.5-pro-preview': '2.5 Pro (preview)'
    }
  },
  ChatGPT: {
    url: 'https://chatgpt.com/',
    supports_custom_temperature: false,
    supports_custom_top_p: false,
    supports_system_instructions: false,
    supports_user_provided_model: false,
    supports_user_provided_port: false,
    default_system_instructions: '',
    supported_options: {
      temporary: 'Temporary'
    },
    default_top_p: 0,
    models: {}
  },
  Claude: {
    url: 'https://claude.ai/new',
    supports_custom_temperature: false,
    supports_custom_top_p: false,
    supports_system_instructions: false,
    supports_user_provided_model: false,
    supports_user_provided_port: false,
    default_system_instructions: '',
    supported_options: {},
    default_top_p: 0,
    models: {}
  },
  DeepSeek: {
    url: 'https://chat.deepseek.com/',
    supports_custom_temperature: false,
    supports_custom_top_p: false,
    supports_system_instructions: false,
    supports_user_provided_model: false,
    supports_user_provided_port: false,
    default_system_instructions: '',
    supported_options: { 'deep-think': 'DeepThink (R1)', search: 'Search' },
    default_top_p: 0,
    models: {}
  },
  Grok: {
    url: 'https://grok.com/',
    supports_custom_temperature: false,
    supports_custom_top_p: false,
    supports_system_instructions: false,
    supports_user_provided_model: false,
    supports_user_provided_port: false,
    default_system_instructions: '',
    supported_options: { think: 'Think' },
    default_top_p: 0,
    models: {}
  }
} satisfies Chatbots
