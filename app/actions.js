/*
 * action types
 */
export const SUBMIT_RESPONSE = 'SUBMIT_RESPONSE'
export const NEXT_QUESTION = 'NEXT_QUESTION'
export const LOAD_DATA = 'LOAD_DATA'
export const EXIT = 'EXIT'

export const SubmitActions = {
  SUBMIT_RESPONSE,
  NEXT_QUESTION,
  LOAD_DATA,
  EXIT
}

/*
 * action creators
 */

export function submitResponse(response) {
  return { type: SUBMIT_RESPONSE, response}
}

export function nextQuestion() {
  return { type: NEXT_QUESTION}
}

export function loadData(data) {
  return { type: LOAD_DATA, data}
}

export function exitToHome() {
  return { type: EXIT}
}
