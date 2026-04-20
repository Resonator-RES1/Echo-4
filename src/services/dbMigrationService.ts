import { db } from './dbService';
import { calculateAbsoluteDay } from '../utils/calendar';
import { CalendarConfig } from '../types';

const CURRENT_MIGRATION_VERSION = 1;

export const runMigrations = async () => {
  const version = await db.settings.get('db_migration_version') || 0;

  if (version < CURRENT_MIGRATION_VERSION) {
    console.log(`Starting DB Migration from version ${version} to ${CURRENT_MIGRATION_VERSION}`);
    
    if (version < 1) {
      await migrateToVersion1();
    }

    await db.settings.put(CURRENT_MIGRATION_VERSION, 'db_migration_version');
    console.log('DB Migration completed successfully');
  }
};

/**
 * Migration 1: Ensure absoluteDay exists for all Lore, Voices, and Scenes.
 * This is a "Structural Hardening" step to prevent undefined errors in the new Chronology system.
 */
async function migrateToVersion1() {
  // 1. Get Calendar Config (if exists)
  const calendarConfig: CalendarConfig | undefined = await db.settings.get('calendar_config');
  
  // 2. Migrate Lore
  await db.transaction('rw', db.lore, async () => {
    const entries = await db.lore.toArray();
    const updated = entries.map(entry => {
      if (entry.absoluteDay !== undefined) return entry;
      const absoluteDay = calendarConfig && entry.storyDate 
        ? calculateAbsoluteDay(entry.storyDate, calendarConfig) 
        : (entry.storyDay || 0);
      return { ...entry, absoluteDay };
    });
    await db.lore.bulkPut(updated);
  });

  // 3. Migrate Voices
  await db.transaction('rw', db.voices, async () => {
    const profiles = await db.voices.toArray();
    const updated = profiles.map(profile => {
      if (profile.absoluteDay !== undefined) return profile;
      const absoluteDay = calendarConfig && profile.storyDate 
        ? calculateAbsoluteDay(profile.storyDate, calendarConfig) 
        : (profile.storyDay || 0);
      return { ...profile, absoluteDay };
    });
    await db.voices.bulkPut(updated);
  });

  // 4. Migrate Scenes
  await db.transaction('rw', db.scenes, async () => {
    const scenes = await db.scenes.toArray();
    const updated = scenes.map(scene => {
      if (scene.absoluteDay !== undefined) return scene;
      const absoluteDay = calendarConfig && scene.storyDate 
        ? calculateAbsoluteDay(scene.storyDate, calendarConfig) 
        : (scene.storyDay || 0);
      return { ...scene, absoluteDay };
    });
    await db.scenes.bulkPut(updated);
  });
}
