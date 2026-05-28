import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  notifications: "@taptenpass/settings/notifications",
  transactionAlerts: "@taptenpass/settings/transaction-alerts",
  contactsImport: "@taptenpass/settings/contacts-import",
} as const;

export interface AppSettings {
  notificationsEnabled: boolean;
  transactionAlertsEnabled: boolean;
  contactsImportEnabled: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationsEnabled: true,
  transactionAlertsEnabled: true,
  contactsImportEnabled: false,
};

export async function loadAppSettings(): Promise<AppSettings> {
  try {
    const [notifications, transactionAlerts, contactsImport] = await Promise.all([
      AsyncStorage.getItem(KEYS.notifications),
      AsyncStorage.getItem(KEYS.transactionAlerts),
      AsyncStorage.getItem(KEYS.contactsImport),
    ]);

    return {
      notificationsEnabled: notifications === null ? DEFAULT_SETTINGS.notificationsEnabled : notifications === "true",
      transactionAlertsEnabled:
        transactionAlerts === null ? DEFAULT_SETTINGS.transactionAlertsEnabled : transactionAlerts === "true",
      contactsImportEnabled:
        contactsImport === null ? DEFAULT_SETTINGS.contactsImportEnabled : contactsImport === "true",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveAppSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
  const current = await loadAppSettings();
  const next = { ...current, ...settings };

  await Promise.all([
    AsyncStorage.setItem(KEYS.notifications, String(next.notificationsEnabled)),
    AsyncStorage.setItem(KEYS.transactionAlerts, String(next.transactionAlertsEnabled)),
    AsyncStorage.setItem(KEYS.contactsImport, String(next.contactsImportEnabled)),
  ]);

  return next;
}
