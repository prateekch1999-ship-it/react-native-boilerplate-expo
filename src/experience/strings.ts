/**
 * Every user-facing string, in both languages.
 *
 * `hi` is typed against `en`, so a string added to one language and not the
 * other fails to compile. That is the whole point of keeping them in one file:
 * a half-translated screen should never be shippable.
 *
 * Add a language by adding a key to `AppLanguage` and an object typed
 * `typeof en`; add a screen by adding a section. Nothing renders a literal —
 * screens read `useStrings()`.
 */

export type AppLanguage = 'en' | 'hi';

const en = {
  app: {
    name: 'RN Boilerplate',
  },
  splash: {
    /** Two lines on purpose: the artboard breaks after the comma. */
    headline: 'Built to ship,\nfrom the first commit',
    subtitle: 'Typed routes, tokens, storage and tests, already wired together.',
    loading: 'Getting things ready…',
  },
  home: {
    title: 'Home',
  },
  common: {
    back: 'Back',
    /** The language the app is in now, named in that language. */
    currentLanguage: 'English',
    switchLanguage: 'हिन्दी',
    changeLanguage: 'Change language',
    retry: 'Try again',
    /** {terms} and {privacy} are links, drawn from termsLink and privacyLink. */
    agreement: 'By continuing you agree to our {terms} and {privacy}',
    termsLink: 'Terms of use',
    privacyLink: 'Privacy policy',
    /** One line per kind of failure, so no screen has to invent error copy. */
    errors: {
      offline: "You're offline. Connect and try again.",
      timedOut: 'That took too long. Please try again.',
      notAuthorized: 'Please sign in again to continue.',
      unknown: 'Something went wrong. Please try again.',
    },
  },
  /** The error boundary. Kept plain: nobody reading this wants a diagnosis. */
  crash: {
    title: 'Something went wrong',
    body: 'This screen could not be shown. Trying again usually fixes it.',
    retry: 'Try again',
  },
};

const hi: typeof en = {
  app: {
    name: 'आरएन बॉयलरप्लेट',
  },
  splash: {
    headline: 'पहले कमिट से ही,\nभेजने के लिए तैयार',
    subtitle: 'टाइप्ड रूट, टोकन, स्टोरेज और टेस्ट — सब पहले से जुड़े हुए।',
    loading: 'तैयारी हो रही है…',
  },
  home: {
    title: 'होम',
  },
  common: {
    back: 'पीछे',
    currentLanguage: 'हिन्दी',
    switchLanguage: 'English',
    changeLanguage: 'भाषा बदलें',
    retry: 'दोबारा कोशिश करें',
    agreement: 'आगे बढ़कर आप हमारी {terms} और {privacy} से सहमत होते हैं',
    termsLink: 'उपयोग की शर्तों',
    privacyLink: 'गोपनीयता नीति',
    errors: {
      offline: 'आप ऑफ़लाइन हैं। इंटरनेट जोड़कर फिर कोशिश करें।',
      timedOut: 'बहुत समय लग गया। फिर कोशिश करें।',
      notAuthorized: 'जारी रखने के लिए दोबारा साइन इन करें।',
      unknown: 'कुछ गड़बड़ हो गई। फिर कोशिश करें।',
    },
  },
  crash: {
    title: 'कुछ गड़बड़ हो गई',
    body: 'यह स्क्रीन दिखाई नहीं जा सकी। दोबारा कोशिश करने से आमतौर पर ठीक हो जाता है।',
    retry: 'दोबारा कोशिश करें',
  },
};

export const Strings = { en, hi } as const;

/**
 * Fills `{name}` placeholders. Used where a sentence wraps a value whose
 * position differs between the two languages, which rules out concatenation.
 */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (whole, key: string) =>
    key in values ? String(values[key]) : whole,
  );
}

/**
 * A template cut either side of one placeholder, for when the value is drawn
 * differently from the words around it — bolder, or as a link. Languages put
 * the value in different places, so the words on each side come from the
 * template rather than from the screen.
 */
export function splitAround(template: string, key: string): [before: string, after: string] {
  const marker = `{${key}}`;
  const at = template.indexOf(marker);
  if (at < 0) return [template, ''];
  return [template.slice(0, at), template.slice(at + marker.length)];
}

export type AppStrings = typeof en;
