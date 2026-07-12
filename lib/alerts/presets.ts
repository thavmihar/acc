// lib/alerts/presets.ts
// Shared alert preset definitions — imported by both the client (button
// grid + preview) and the server (authoritative notification title/body).
//
// IMPORTANT: for preset alerts (everything except 'custom'), the SERVER
// always uses this file's title/body, never anything the client sends —
// a client could otherwise submit alertType: 'rally_now' with a forged
// custom title/body and have it treated as authoritative. Only when
// alertType === 'custom' does user-supplied text get used, and even then
// it's capped at 80 characters server-side, not just in the UI.

export type AlertPresetKey =
  | 'rally_now'
  | 'desert_storm'
  | 'marshal_guard'
  | 'winter_storm'
  | 'capitol_war'
  | 'alliance_meeting'
  | 'emergency'
  | 'afk_check'
  | 'custom'

export interface AlertPreset {
  key: AlertPresetKey
  icon: string
  title: string
  /** Short description shown on the button itself. */
  description: string
  /** Authoritative notification body sent via FCM for this preset. Not used for 'custom'. */
  notificationBody: string
}

export const ALERT_PRESETS: AlertPreset[] = [
  {
    key: 'rally_now',
    icon: '🚨',
    title: 'Rally Now',
    description: 'Call everyone to rally immediately',
    notificationBody: 'Everyone rally immediately!',
  },
  {
    key: 'desert_storm',
    icon: '⚔️',
    title: 'Desert Storm',
    description: 'Desert Storm registration/start',
    notificationBody: 'Desert Storm registration starts now!',
  },
  {
    key: 'marshal_guard',
    icon: '🛡️',
    title: 'Marshal Guard',
    description: 'Marshal Guard event notice',
    notificationBody: 'Marshal Guard is starting — get ready!',
  },
  {
    key: 'winter_storm',
    icon: '❄️',
    title: 'Winter Storm',
    description: 'Winter Storm event notice',
    notificationBody: 'Winter Storm is starting — get ready!',
  },
  {
    key: 'capitol_war',
    icon: '🏰',
    title: 'Capitol War',
    description: 'Prepare for Capitol battle',
    notificationBody: 'Prepare for Capitol battle!',
  },
  {
    key: 'alliance_meeting',
    icon: '📢',
    title: 'Alliance Meeting',
    description: 'Call members to a meeting',
    notificationBody: 'Alliance meeting — join voice chat now.',
  },
  {
    key: 'emergency',
    icon: '⚠️',
    title: 'Emergency',
    description: 'Urgent, non-routine notice',
    notificationBody: 'Emergency — check the alliance immediately.',
  },
  {
    key: 'afk_check',
    icon: '💤',
    title: 'AFK Check',
    description: 'Check who is active right now',
    notificationBody: 'AFK check — respond now if you\'re active.',
  },
  {
    key: 'custom',
    icon: '✏️',
    title: 'Custom Message',
    description: 'Write your own title and message',
    notificationBody: '', // not used — custom text comes from the request
  },
]

export const ALERT_PRESET_MAP: Record<AlertPresetKey, AlertPreset> =
  Object.fromEntries(ALERT_PRESETS.map(p => [p.key, p])) as Record<AlertPresetKey, AlertPreset>

export const ALERT_COOLDOWN_SECONDS = 60
export const CUSTOM_MESSAGE_MAX_LENGTH = 80