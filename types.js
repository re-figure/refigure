/**
 * Chrome
 * @typedef {Object} chrome
 * @property {Object} tabs
 * @property {ChromeEvent} tabs.onCreated
 * @property {ChromeEvent} tabs.onUpdated
 * @property {ChromeEvent} tabs.onReplaced
 * @property {ChromeEvent} tabs.onActivated
 * @property {Object} browserAction
 * @property {Function} browserAction.setBadgeText
 * @property {Object} runtime
 * @property {ChromeEvent} runtime.onInstalled
 * @property {ChromeEvent} runtime.onSuspend
 * @property {ChromeEvent} runtime.onMessage
 * @property {ChromeEvent} runtime.onMessageExternal
 * @property {Function} runtime.getManifest
 * @property {Object} identity
 * @property {Function} identity.getProfileUserInfo
 * @property {Object} storage
 * @property {Object} storage.local
 * @property {Function} storage.local.set
 * @property {Function} storage.local.remove
 */

/**
 * Chrome event
 * @typedef {Object} ChromeEvent
 * @property {Function} addListener
 */
