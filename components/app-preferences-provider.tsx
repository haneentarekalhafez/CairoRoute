"use client"

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react"

export type ThemePreference =
  | "light"
  | "dark"
  | "system"

export type LanguagePreference =
  | "english"
  | "arabic"
  | "french"

type TranslationKey =
  | "dashboard"
  | "myBookings"
  | "profile"
  | "settings"
  | "yourJourney"
  | "account"
  | "signedInAs"
  | "loading"
  | "logout"
  | "loggingOut"
  | "preferences"
  | "settingsTitle"
  | "settingsDescription"
  | "generalPreferences"
  | "generalPreferencesDescription"
  | "language"
  | "appearance"
  | "english"
  | "arabic"
  | "french"
  | "light"
  | "dark"
  | "systemDefault"
  | "notifications"
  | "notificationsDescription"
  | "bookingConfirmations"
  | "bookingConfirmationsDescription"
  | "tripReminders"
  | "tripRemindersDescription"
  | "offersAnnouncements"
  | "offersAnnouncementsDescription"
  | "privacyLocation"
  | "privacyLocationDescription"
  | "locationAccess"
  | "locationAccessDescription"
  | "accountSecurity"
  | "accountSecurityDescription"
  | "changePassword"
  | "saveSettings"
  | "settingsSaved"
  | "transportationAcrossCairo"
  | "whereDoYouWantToGo"
  | "dashboardHeroDescription"
  | "planYourTrip"
  | "planTripDescription"
  | "currentLocation"
  | "enterCurrentLocation"
  | "destination"
  | "selectDestination"
  | "loadingDestinations"
  | "searchRoutes"
  | "upcomingTrip"
  | "upcomingTripDescription"
  | "loadingNextTrip"
  | "noUpcomingTrips"
  | "noUpcomingTripsDescription"
  | "viewMyBooking"
  | "nearestPickupPoint"
  | "nearestPickupDescription"
  | "locationNotSelected"
  | "locationNotSelectedDescription"
  | "detectLocation"
  | "approximateDistance"
  | "straightLineDistance"
  | "date"
  | "departure"
  | "seat"
  | "plate"
  | "unavailable"

const translations: Record<
  LanguagePreference,
  Record<TranslationKey, string>
> = {
  english: {
    dashboard: "Dashboard",
    myBookings: "My Bookings",
    profile: "Profile",
    settings: "Settings",
    yourJourney: "Your journey",
    account: "Account",
    signedInAs: "Signed in as",
    loading: "Loading...",
    logout: "Log out",
    loggingOut: "Logging out...",

    preferences: "Preferences",
    settingsTitle: "Settings",
    settingsDescription:
      "Manage language, appearance, notifications, location access, and privacy preferences.",

    generalPreferences: "General preferences",
    generalPreferencesDescription:
      "Choose the language and appearance of CairoRoute.",

    language: "Language",
    appearance: "Appearance",

    english: "English",
    arabic: "Arabic",
    french: "French",

    light: "Light",
    dark: "Dark",
    systemDefault: "System default",

    notifications: "Notifications",
    notificationsDescription:
      "Choose which updates you want to receive.",

    bookingConfirmations:
      "Booking confirmations",
    bookingConfirmationsDescription:
      "Receive updates when a booking is confirmed or changed.",

    tripReminders: "Trip reminders",
    tripRemindersDescription:
      "Receive reminders before your scheduled departure.",

    offersAnnouncements:
      "Offers and announcements",
    offersAnnouncementsDescription:
      "Receive promotional messages and service announcements.",

    privacyLocation:
      "Privacy and location",
    privacyLocationDescription:
      "Control location access and account security settings.",

    locationAccess:
      "Location access",
    locationAccessDescription:
      "Allow CairoRoute to use your location when suggesting nearby pickup points.",

    accountSecurity:
      "Account security",
    accountSecurityDescription:
      "Password changes and additional account security controls can be managed here.",

    changePassword:
      "Change password",

    saveSettings:
      "Save settings",

    settingsSaved:
      "Your settings have been saved.",

    transportationAcrossCairo:
      "Transportation across Cairo",

    whereDoYouWantToGo:
      "Where do you want to go?",

    dashboardHeroDescription:
      "Enter your destination and we will suggest the nearest suitable pickup point based on your current location.",

    planYourTrip:
      "Plan your trip",

    planTripDescription:
      "Use your current location and select your destination.",

    currentLocation:
      "Current location",

    enterCurrentLocation:
      "Enter your current location",

    destination:
      "Destination",

    selectDestination:
      "Select your destination",

    loadingDestinations:
      "Loading destinations...",

    searchRoutes:
      "Search routes",

    upcomingTrip:
      "Upcoming trip",

    upcomingTripDescription:
      "Your next confirmed reservation",

    loadingNextTrip:
      "Loading your next trip...",

    noUpcomingTrips:
      "No upcoming trips",

    noUpcomingTripsDescription:
      "Your confirmed bus reservations will appear here.",

    viewMyBooking:
      "View my booking",

    nearestPickupPoint:
      "Nearest pickup point",

    nearestPickupDescription:
      "Suggested using your current location",

    locationNotSelected:
      "Location not selected",

    locationNotSelectedDescription:
      "Detect your location to view the nearest pickup point.",

    detectLocation:
      "Detect location",

    approximateDistance:
      "Approximate distance",

    straightLineDistance:
      "Straight-line distance from your detected location.",

    date: "Date",
    departure: "Departure",
    seat: "Seat",
    plate: "Plate",
    unavailable: "Unavailable",
  },

  arabic: {
    dashboard: "الرئيسية",
    myBookings: "حجوزاتي",
    profile: "الملف الشخصي",
    settings: "الإعدادات",
    yourJourney: "رحلتك",
    account: "الحساب",
    signedInAs: "تم تسجيل الدخول باسم",
    loading: "جارٍ التحميل...",
    logout: "تسجيل الخروج",
    loggingOut: "جارٍ تسجيل الخروج...",

    preferences: "التفضيلات",
    settingsTitle: "الإعدادات",
    settingsDescription:
      "إدارة اللغة والمظهر والإشعارات والوصول إلى الموقع وتفضيلات الخصوصية.",

    generalPreferences:
      "التفضيلات العامة",
    generalPreferencesDescription:
      "اختر لغة ومظهر CairoRoute.",

    language: "اللغة",
    appearance: "المظهر",

    english: "الإنجليزية",
    arabic: "العربية",
    french: "الفرنسية",

    light: "فاتح",
    dark: "داكن",
    systemDefault:
      "حسب إعداد الجهاز",

    notifications: "الإشعارات",
    notificationsDescription:
      "اختر التحديثات التي تريد استلامها.",

    bookingConfirmations:
      "تأكيدات الحجز",
    bookingConfirmationsDescription:
      "استلم تحديثات عند تأكيد الحجز أو تغييره.",

    tripReminders:
      "تذكيرات الرحلات",
    tripRemindersDescription:
      "استلم تذكيراً قبل موعد مغادرة رحلتك.",

    offersAnnouncements:
      "العروض والإعلانات",
    offersAnnouncementsDescription:
      "استلم الرسائل الترويجية وإعلانات الخدمة.",

    privacyLocation:
      "الخصوصية والموقع",
    privacyLocationDescription:
      "تحكم في الوصول إلى الموقع وإعدادات أمان الحساب.",

    locationAccess:
      "الوصول إلى الموقع",
    locationAccessDescription:
      "اسمح لـ CairoRoute باستخدام موقعك لاقتراح أقرب نقاط الركوب.",

    accountSecurity:
      "أمان الحساب",
    accountSecurityDescription:
      "يمكن إدارة تغيير كلمة المرور وإعدادات أمان الحساب الإضافية من هنا.",

    changePassword:
      "تغيير كلمة المرور",

    saveSettings:
      "حفظ الإعدادات",

    settingsSaved:
      "تم حفظ إعداداتك.",

    transportationAcrossCairo:
      "تنقل في جميع أنحاء القاهرة",

    whereDoYouWantToGo:
      "إلى أين تريد الذهاب؟",

    dashboardHeroDescription:
      "أدخل وجهتك وسنقترح أقرب نقطة ركوب مناسبة بناءً على موقعك الحالي.",

    planYourTrip:
      "خطط لرحلتك",

    planTripDescription:
      "استخدم موقعك الحالي واختر وجهتك.",

    currentLocation:
      "الموقع الحالي",

    enterCurrentLocation:
      "أدخل موقعك الحالي",

    destination:
      "الوجهة",

    selectDestination:
      "اختر وجهتك",

    loadingDestinations:
      "جارٍ تحميل الوجهات...",

    searchRoutes:
      "البحث عن الرحلات",

    upcomingTrip:
      "الرحلة القادمة",

    upcomingTripDescription:
      "حجزك المؤكد القادم",

    loadingNextTrip:
      "جارٍ تحميل رحلتك القادمة...",

    noUpcomingTrips:
      "لا توجد رحلات قادمة",

    noUpcomingTripsDescription:
      "ستظهر حجوزات الحافلات المؤكدة هنا.",

    viewMyBooking:
      "عرض حجزي",

    nearestPickupPoint:
      "أقرب نقطة ركوب",

    nearestPickupDescription:
      "مقترحة بناءً على موقعك الحالي",

    locationNotSelected:
      "لم يتم تحديد الموقع",

    locationNotSelectedDescription:
      "حدد موقعك لعرض أقرب نقطة ركوب.",

    detectLocation:
      "تحديد الموقع",

    approximateDistance:
      "المسافة التقريبية",

    straightLineDistance:
      "المسافة المباشرة من موقعك المحدد.",

    date: "التاريخ",
    departure: "المغادرة",
    seat: "المقعد",
    plate: "رقم اللوحة",
    unavailable: "غير متاح",
  },

  french: {
    dashboard: "Tableau de bord",
    myBookings: "Mes réservations",
    profile: "Profil",
    settings: "Paramètres",
    yourJourney: "Votre trajet",
    account: "Compte",
    signedInAs:
      "Connecté en tant que",
    loading: "Chargement...",
    logout: "Se déconnecter",
    loggingOut: "Déconnexion...",

    preferences: "Préférences",
    settingsTitle: "Paramètres",
    settingsDescription:
      "Gérez la langue, l’apparence, les notifications, la localisation et vos préférences de confidentialité.",

    generalPreferences:
      "Préférences générales",
    generalPreferencesDescription:
      "Choisissez la langue et l’apparence de CairoRoute.",

    language: "Langue",
    appearance: "Apparence",

    english: "Anglais",
    arabic: "Arabe",
    french: "Français",

    light: "Clair",
    dark: "Sombre",
    systemDefault:
      "Paramètre du système",

    notifications: "Notifications",
    notificationsDescription:
      "Choisissez les mises à jour que vous souhaitez recevoir.",

    bookingConfirmations:
      "Confirmations de réservation",
    bookingConfirmationsDescription:
      "Recevez des mises à jour lorsqu’une réservation est confirmée ou modifiée.",

    tripReminders:
      "Rappels de trajet",
    tripRemindersDescription:
      "Recevez un rappel avant l’heure de départ prévue.",

    offersAnnouncements:
      "Offres et annonces",
    offersAnnouncementsDescription:
      "Recevez des offres promotionnelles et des annonces de service.",

    privacyLocation:
      "Confidentialité et localisation",
    privacyLocationDescription:
      "Contrôlez l’accès à votre localisation et les paramètres de sécurité du compte.",

    locationAccess:
      "Accès à la localisation",
    locationAccessDescription:
      "Autorisez CairoRoute à utiliser votre localisation pour proposer les points de prise en charge les plus proches.",

    accountSecurity:
      "Sécurité du compte",
    accountSecurityDescription:
      "Les changements de mot de passe et les contrôles de sécurité supplémentaires peuvent être gérés ici.",

    changePassword:
      "Changer le mot de passe",

    saveSettings:
      "Enregistrer les paramètres",

    settingsSaved:
      "Vos paramètres ont été enregistrés.",

    transportationAcrossCairo:
      "Transport à travers Le Caire",

    whereDoYouWantToGo:
      "Où souhaitez-vous aller ?",

    dashboardHeroDescription:
      "Entrez votre destination et nous vous proposerons le point de prise en charge approprié le plus proche selon votre position actuelle.",

    planYourTrip:
      "Planifiez votre trajet",

    planTripDescription:
      "Utilisez votre position actuelle et sélectionnez votre destination.",

    currentLocation:
      "Position actuelle",

    enterCurrentLocation:
      "Entrez votre position actuelle",

    destination:
      "Destination",

    selectDestination:
      "Sélectionnez votre destination",

    loadingDestinations:
      "Chargement des destinations...",

    searchRoutes:
      "Rechercher des trajets",

    upcomingTrip:
      "Prochain trajet",

    upcomingTripDescription:
      "Votre prochaine réservation confirmée",

    loadingNextTrip:
      "Chargement de votre prochain trajet...",

    noUpcomingTrips:
      "Aucun trajet à venir",

    noUpcomingTripsDescription:
      "Vos réservations de bus confirmées apparaîtront ici.",

    viewMyBooking:
      "Voir ma réservation",

    nearestPickupPoint:
      "Point de prise en charge le plus proche",

    nearestPickupDescription:
      "Suggestion basée sur votre position actuelle",

    locationNotSelected:
      "Position non sélectionnée",

    locationNotSelectedDescription:
      "Détectez votre position pour afficher le point de prise en charge le plus proche.",

    detectLocation:
      "Détecter ma position",

    approximateDistance:
      "Distance approximative",

    straightLineDistance:
      "Distance à vol d’oiseau depuis votre position détectée.",

    date: "Date",
    departure: "Départ",
    seat: "Siège",
    plate: "Immatriculation",
    unavailable: "Indisponible",
  },
}

type AppPreferencesContextType = {
  theme: ThemePreference
  language: LanguagePreference

  setTheme: (
    value: ThemePreference
  ) => void

  setLanguage: (
    value: LanguagePreference
  ) => void

  t: (
    key: TranslationKey
  ) => string
}

const AppPreferencesContext =
  createContext<AppPreferencesContextType | null>(
    null
  )

const THEME_KEY =
  "cairoroute-theme"

const LANGUAGE_KEY =
  "cairoroute-language"

const PREFERENCES_EVENT =
  "cairoroute-preferences-change"

/*
 * =========================================
 * READ THEME
 * =========================================
 */

function readTheme():
  ThemePreference {
  if (
    typeof window ===
    "undefined"
  ) {
    return "light"
  }

  const value =
    window.localStorage.getItem(
      THEME_KEY
    )

  if (
    value === "light" ||
    value === "dark" ||
    value === "system"
  ) {
    return value
  }

  return "light"
}

/*
 * =========================================
 * READ LANGUAGE
 * =========================================
 */

function readLanguage():
  LanguagePreference {
  if (
    typeof window ===
    "undefined"
  ) {
    return "english"
  }

  const value =
    window.localStorage.getItem(
      LANGUAGE_KEY
    )

  if (
    value === "english" ||
    value === "arabic" ||
    value === "french"
  ) {
    return value
  }

  return "english"
}

/*
 * =========================================
 * SUBSCRIBE
 * =========================================
 */

function subscribePreferences(
  callback: () => void
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return () => {}
  }

  window.addEventListener(
    "storage",
    callback
  )

  window.addEventListener(
    PREFERENCES_EVENT,
    callback
  )

  return () => {
    window.removeEventListener(
      "storage",
      callback
    )

    window.removeEventListener(
      PREFERENCES_EVENT,
      callback
    )
  }
}

/*
 * =========================================
 * APPLY THEME
 * =========================================
 */

function applyTheme(
  value: ThemePreference
) {
  if (
    typeof document ===
    "undefined"
  ) {
    return
  }

  const root =
    document.documentElement

  if (
    value === "dark"
  ) {
    root.classList.add(
      "dark"
    )

    root.style.colorScheme =
      "dark"

    return
  }

  if (
    value === "light"
  ) {
    root.classList.remove(
      "dark"
    )

    root.style.colorScheme =
      "light"

    return
  }

  const prefersDark =
    window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches

  root.classList.toggle(
    "dark",
    prefersDark
  )

  root.style.colorScheme =
    prefersDark
      ? "dark"
      : "light"
}

/*
 * =========================================
 * APPLY LANGUAGE
 * =========================================
 */

function applyLanguage(
  value: LanguagePreference
) {
  if (
    typeof document ===
    "undefined"
  ) {
    return
  }

  const root =
    document.documentElement

  if (
    value === "arabic"
  ) {
    root.lang = "ar"
    root.dir = "rtl"

    return
  }

  root.dir = "ltr"

  if (
    value === "french"
  ) {
    root.lang = "fr"

    return
  }

  root.lang = "en"
}

/*
 * =========================================
 * PROVIDER
 * =========================================
 */

export function AppPreferencesProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const theme =
    useSyncExternalStore<ThemePreference>(
      subscribePreferences,
      readTheme,
      () => "light"
    )

  const language =
    useSyncExternalStore<LanguagePreference>(
      subscribePreferences,
      readLanguage,
      () => "english"
    )

  /*
   * =========================================
   * APPLY CURRENT THEME
   * =========================================
   */

  useEffect(() => {
    applyTheme(
      theme
    )
  }, [theme])

  /*
   * =========================================
   * APPLY CURRENT LANGUAGE
   * =========================================
   */

  useEffect(() => {
    applyLanguage(
      language
    )
  }, [language])

  /*
   * =========================================
   * SYSTEM THEME WATCHER
   * =========================================
   */

  useEffect(() => {
    if (
      theme !== "system"
    ) {
      return
    }

    const mediaQuery =
      window.matchMedia(
        "(prefers-color-scheme: dark)"
      )

    function handleSystemThemeChange() {
      applyTheme(
        "system"
      )
    }

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    )

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      )
    }
  }, [theme])

  /*
   * =========================================
   * CHANGE THEME
   * =========================================
   */

  function setTheme(
    value: ThemePreference
  ) {
    window.localStorage.setItem(
      THEME_KEY,
      value
    )

    applyTheme(
      value
    )

    window.dispatchEvent(
      new Event(
        PREFERENCES_EVENT
      )
    )
  }

  /*
   * =========================================
   * CHANGE LANGUAGE
   * =========================================
   */

  function setLanguage(
    value:
      LanguagePreference
  ) {
    window.localStorage.setItem(
      LANGUAGE_KEY,
      value
    )

    applyLanguage(
      value
    )

    window.dispatchEvent(
      new Event(
        PREFERENCES_EVENT
      )
    )
  }

  /*
   * =========================================
   * TRANSLATE
   * =========================================
   */

  function t(
    key: TranslationKey
  ): string {
    return translations[
      language
    ][key]
  }

  /*
   * =========================================
   * CONTEXT
   * =========================================
   */

  const contextValue =
    useMemo<AppPreferencesContextType>(
      () => ({
        theme,
        language,
        setTheme,
        setLanguage,
        t,
      }),
      [
        theme,
        language,
      ]
    )

  return (
    <AppPreferencesContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </AppPreferencesContext.Provider>
  )
}

/*
 * =========================================
 * HOOK
 * =========================================
 */

export function useAppPreferences():
  AppPreferencesContextType {
  const context =
    useContext(
      AppPreferencesContext
    )

  if (!context) {
    throw new Error(
      "useAppPreferences must be used inside AppPreferencesProvider."
    )
  }

  return context
}