import { Chatbot } from '../types/chatbot'
import { Message } from '@/types/messages'
import { debounce } from '@/utils/debounce'
import browser from 'webextension-polyfill'
import {
  apply_chat_response_button_style,
  set_button_disabled_state
} from '../utils/apply-response-styles'
import { is_eligible_code_block } from '../utils/is-eligible-code-block'

export const ai_studio: Chatbot = {
  wait_until_ready: async () => {
    await new Promise((resolve) => {
      const check_for_element = () => {
        if (document.querySelector('.title-container')) {
          resolve(null)
        } else {
          setTimeout(check_for_element, 100)
        }
      }
      check_for_element()
    })
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 500)
    })
  },
  set_model: async (model: string) => {
    const model_selector_trigger = document.querySelector(
      'ms-model-selector mat-form-field > div'
    ) as HTMLElement
    model_selector_trigger.click()
    await new Promise((r) => requestAnimationFrame(r))
    const model_options = Array.from(document.querySelectorAll('mat-option'))
    for (const option of model_options) {
      const model_name_element = option.querySelector(
        'ms-model-option > div:last-child'
      ) as HTMLElement
      if (model_name_element?.textContent?.trim() == model) {
        ;(option as HTMLElement).click()
        break
      }
    }
    await new Promise((r) => requestAnimationFrame(r))
  },
  enter_system_instructions: async (system_instructions: string) => {
    const assignment_button = Array.from(
      document.querySelectorAll('ms-toolbar button')
    ).find(
      (button) => button.textContent?.trim() == 'assignment'
    ) as HTMLButtonElement
    assignment_button.click()
    await new Promise((r) => requestAnimationFrame(r))
    const system_instructions_selector =
      'textarea[aria-label="System instructions"]'
    const system_instructions_element = document.querySelector(
      system_instructions_selector
    ) as HTMLTextAreaElement
    system_instructions_element.value = system_instructions
    system_instructions_element.dispatchEvent(
      new Event('input', { bubbles: true })
    )
    system_instructions_element.dispatchEvent(
      new Event('change', { bubbles: true })
    )
    assignment_button.click()
    await new Promise((r) => requestAnimationFrame(r))
  },
  set_temperature: async (temperature: number) => {
    if (window.innerWidth <= 768) {
      const tune_button = Array.from(
        document.querySelectorAll('prompt-header button')
      ).find(
        (button) => button.textContent?.trim() == 'tune'
      ) as HTMLButtonElement
      tune_button.click()
      await new Promise((r) => requestAnimationFrame(r))
    }
    const temperature_element = document.querySelector(
      'ms-prompt-run-settings div[data-test-id="temperatureSliderContainer"] input[type=number]'
    ) as HTMLInputElement
    temperature_element.value = temperature.toString()
    temperature_element.dispatchEvent(new Event('change', { bubbles: true }))
    if (window.innerWidth <= 768) {
      const close_button = Array.from(
        document.querySelectorAll('ms-run-settings button')
      ).find(
        (button) => button.textContent?.trim() == 'close'
      ) as HTMLButtonElement
      close_button.click()
    }
  },
  set_top_p: async (top_p: number) => {
    if (window.innerWidth <= 768) {
      const tune_button = Array.from(
        document.querySelectorAll('prompt-header button')
      ).find(
        (button) => button.textContent?.trim() == 'tune'
      ) as HTMLButtonElement
      tune_button.click()
      await new Promise((r) => requestAnimationFrame(r))
    }
    const top_p_element = document.querySelector(
      'ms-prompt-run-settings div[mattooltip="Probability threshold for top-p sampling"] input[type=number]'
    ) as HTMLInputElement
    top_p_element.value = top_p.toString()
    top_p_element.dispatchEvent(new Event('change', { bubbles: true }))
    if (window.innerWidth <= 768) {
      const close_button = Array.from(
        document.querySelectorAll('ms-run-settings button')
      ).find(
        (button) => button.textContent?.trim() == 'close'
      ) as HTMLButtonElement
      close_button.click()
    }
  },
  inject_apply_response_button: (client_id: number) => {
    const debounced_process_response = debounce(
      (params: { footer: Element }) => {
        console.log('[CWC-Debug] Response finished. Processing footer:', params.footer)
        const turn_container = params.footer.closest('.chat-turn-container') as HTMLElement

        if (!turn_container) {
          console.error('[CWC-Debug] .chat-turn-container not found for footer:', params.footer)
          return
        }

        // --- Auto-copy response logic ---
        if (!turn_container.dataset.cwcResponseSent) {
          turn_container.dataset.cwcResponseSent = 'true'
          console.log('[CWC-Debug] Response not sent yet. Proceeding with copy.');

          ;(async () => {
            try {
              const options_button = turn_container.querySelector(
                'ms-chat-turn-options > div > button'
              ) as HTMLElement | null
              
              if (!options_button) {
                console.error('[CWC-Debug] Could not find options button (more_vert).')
                return
              }
              
              console.log('[CWC-Debug] Found options button. Clicking it.');
              options_button.click()
              await new Promise((resolve) => setTimeout(resolve, 200)) // Increased delay

              console.log('[CWC-Debug] Searching for "Copy markdown" button...');
              const markdown_copy_button = Array.from(
                document.querySelectorAll('button.mat-mdc-menu-item')
              ).find((button) =>
                button.querySelector('.copy-markdown-button')
              ) as HTMLElement | null

              if (markdown_copy_button) {
                console.log('[CWC-Debug] Found "Copy markdown" button:', markdown_copy_button);
                markdown_copy_button.click()
                console.log('[CWC-Debug] Successfully clicked "Copy markdown". The content should be in your clipboard.')
              } else {
                console.error('[CWC-Debug] "Copy markdown" button NOT FOUND.');
                const menuPanel = document.querySelector('.cdk-overlay-pane.gmat-mdc-menu');
                console.log('[CWC-Debug] Current menu panel HTML:', menuPanel?.innerHTML || 'Not found');
                options_button.click(); // Attempt to close the menu
              }
            } catch (error) {
              console.error(
                '[CWC-Debug] Error getting finished response via clipboard:',
                error
              )
            }
          })()
        } else {
            console.log('[CWC-Debug] Response already marked as sent. Skipping.')
        }

        const apply_response_button_text = 'Apply response with CWC'

        // Check if buttons already exist by text content to avoid duplicates
        const existing_apply_response_button = Array.from(
          params.footer.querySelectorAll('button')
        ).find((btn) => btn.textContent == apply_response_button_text)

        if (existing_apply_response_button) return

        const chat_turn = turn_container.closest('ms-chat-turn')
        if (!chat_turn) return
        
        const first_line_comments_of_code_blocks =
          chat_turn.querySelectorAll('ms-code-block code')
        let has_eligible_block = false
        for (const code_block of Array.from(
          first_line_comments_of_code_blocks
        )) {
          const first_line_text = code_block?.textContent?.split('\n')[0]
          if (first_line_text && is_eligible_code_block(first_line_text)) {
            has_eligible_block = true
            break
          }
        }
        if (!has_eligible_block) return

        const create_apply_response_button = () => {
          const apply_response_button = document.createElement('button')
          apply_response_button.textContent = apply_response_button_text
          apply_response_button.title =
            'Integrate changes with the codebase. You can fully revert this operation.'
          apply_chat_response_button_style(apply_response_button)

          apply_response_button.addEventListener('click', async () => {
            set_button_disabled_state(apply_response_button)
            const chat_turn_container = apply_response_button.closest(
              '.chat-turn-container'
            )!
            const options = chat_turn_container.querySelector(
              'ms-chat-turn-options > div > button'
            ) as HTMLElement
            options.click()
            await new Promise((resolve) => setTimeout(resolve, 100))
            const markdown_copy_button = Array.from(
              document.querySelectorAll('button.mat-mdc-menu-item')
            ).find((button) =>
              button.querySelector('.copy-markdown-button')
            ) as HTMLElement | null
            if (markdown_copy_button) {
              markdown_copy_button.click()
              await new Promise((resolve) => setTimeout(resolve, 100))
              browser.runtime.sendMessage<Message>({
                action: 'apply-chat-response',
                client_id
              })
            } else {
              console.error(
                "CWC: Could not find 'Copy markdown' button for apply action."
              )
              options.click() // close menu
            }
          })

          params.footer.insertBefore(
            apply_response_button,
            params.footer.children[2]
          )

          apply_response_button.focus()
        }

        create_apply_response_button()
      },
      100
    )

    const observer = new MutationObserver((mutations) => {
      mutations.forEach(() => {
        const all_footers = document.querySelectorAll(
          'ms-chat-turn .turn-footer'
        )
        all_footers.forEach((footer) => {
          if (
            footer.querySelector('mat-icon')?.textContent?.trim() == 'thumb_up'
          ) {
            debounced_process_response({
              footer
            })
          }
        })
      })
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    })
  }
}