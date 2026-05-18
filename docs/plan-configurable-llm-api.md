# Plan: Configurable LLM API Base URL and Model Selection

## Overview
Add support for configuring custom LLM API base URL and API key, while maintaining Claude-only model selection as specified.

## Current State
- API base URL is hardcoded to `https://api.anthropic.com/v1/messages` in `api-client.js`
- API key is already configurable via settings
- Model selection is limited to 3 Claude models
- Settings are persisted in localStorage

## Plan

### 1. Update State Management (`src/modules/state.js`)
- Add `baseUrl` to `PERSISTED_KEYS` array
- Add default `baseUrl` value in initial state: `"https://api.anthropic.com/v1/messages"`

### 2. Update API Client (`src/modules/api-client.js`)
- Modify `AnthropicClient` constructor to accept `baseUrl` parameter
- Update default base URL to use configurable value
- Ensure proper URL handling (append `/v1/messages` if needed)

### 3. Update Settings UI (`src/taskpane/taskpane.html`)
- Add base URL input field in settings view
- Add label and hint text for base URL configuration
- Maintain existing API key and model selection fields

### 4. Update Settings Logic (`src/modules/settings.js`)
- Load base URL from store on initialization
- Save base URL when settings are saved
- Update test connection to use configured base URL

### 5. Update Model Display (`src/modules/utils.js`)
- Ensure `getModelDisplayName` handles all Claude models correctly

### 6. Update Document Logic (`src/modules/document-logic.js`)
- Pass base URL when creating `AnthropicClient` instances

### 7. Update Taskpane JS (`src/taskpane/taskpane.js`)
- Pass base URL when creating `AnthropicClient` instances

## Acceptance Criteria
- [ ] User can configure custom API base URL in settings
- [ ] User can configure API key (already works)
- [ ] User can select from Claude models only
- [ ] Settings are persisted across sessions
- [ ] Test connection works with custom base URL
- [ ] All API calls use configured base URL

## Files to Modify
1. `src/modules/state.js` - Add baseUrl to state
2. `src/modules/api-client.js` - Accept configurable base URL
3. `src/taskpane/taskpane.html` - Add base URL input field
4. `src/modules/settings.js` - Handle base URL save/load
5. `src/modules/document-logic.js` - Use configured base URL
6. `src/taskpane/taskpane.js` - Use configured base URL

## Testing
- Verify settings UI shows base URL field
- Verify base URL is saved and loaded correctly
- Verify API calls use configured base URL
- Verify test connection works with custom URL
- Verify model selection still works correctly