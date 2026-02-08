/**
 * Google Calendar Integration Module
 * Handles OAuth2 authentication and calendar operations
 */

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(process.cwd(), '../_OPS/GOOGLE_AI/calendar-tokens.json');

class GoogleCalendarService {
  constructor() {
    this.oauth2Clients = new Map();
    this.calendars = new Map();
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      console.warn('Google Calendar credentials not configured.');
      return;
    }
    this.initialized = true;
  }

  getAuthUrl(email) {
    const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';
    const oauth2Client = new OAuth2Client(clientId, clientSecret, redirectUri);
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      login_hint: email,
      state: email,
      prompt: 'consent'
    });
  }

  async createEventFromTask(task, email = 'ai@infinityxonesystems.com') {
    await this.initialize();
    if (!this.calendars.has(email)) {
      throw new Error(`Calendar not authenticated for ${email}`);
    }
    const calendar = this.calendars.get(email);
    const event = {
      summary: task.title,
      description: `Task ID: ${task.id}\n\n${task.description || ''}`,
      start: { dateTime: task.due_date || new Date().toISOString() },
      end: { dateTime: task.due_date || new Date(Date.now() + 3600000).toISOString() }
    };
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });
    return response.data;
  }

  isAuthenticated(email) {
    return this.oauth2Clients.has(email);
  }
}

const calendarService = new GoogleCalendarService();
export default calendarService;
