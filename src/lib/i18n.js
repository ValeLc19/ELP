import { useEffect, useReducer } from 'react'

const KEY = 'elp-lang'
let lang = localStorage.getItem(KEY) || 'en'
const listeners = new Set()

const DICT = {
  en: {
    // header
    welcome: 'Welcome',
    events: 'Events:',
    langEN: 'EN',
    langES: 'ES',
    // tabs
    map: 'Map',
    calendar: 'Calendar',
    list: 'List',
    nextEvents: 'Next Events',
    pastEvents: 'Past Events',
    noSaved: 'No saved events yet.',
    // filter group labels
    when: 'When',
    category: 'Category',
    price: 'Price',
    goodFor: 'Good for',
    // date filters
    Today: 'Today',
    'This Weekend': 'This Weekend',
    'This Week': 'This Week',
    clearFilters: 'Clear filters',
    savedChip: 'Saved',
    // categories
    cat_Food: 'Food',
    cat_Music: 'Music',
    cat_Arts: 'Arts',
    cat_Outdoors: 'Outdoors',
    cat_Markets: 'Markets',
    cat_Sports: 'Sports',
    // price / audience chips
    chip_Free: 'Free',
    chip_Paid: 'Paid',
    chip_Kids: 'Kids',
    'chip_18+': '18+',
    // sort
    sortBy: 'Sort by:',
    sortDate: 'Date',
    sortPrice: 'Price',
    // list / empty
    empty1: 'Sorry!',
    empty2: 'No events found.',
    empty3: 'The closest event is:',
    seeSimilar: 'See similar events',
    // card / detail
    familyEvent: 'Family Event',
    seeDetails: 'See Details',
    about: 'About:',
    additionalInfo: 'Additional Information:',
    host: 'Host:',
    moreInfo: 'More Info →',
    copied: 'Copied!',
    recur_Weekly: 'Weekly',
    recur_Biweekly: 'Biweekly',
    recur_Monthly: 'Monthly',
    // calendar
    monthTab: 'Month',
    weekTab: 'Week',
    // auth
    logIn: 'LOG IN',
    signUp: 'SIGN UP',
    emailLabel: 'E-mail',
    emailLabelColon: 'E-mail:',
    passwordLabel: 'Password',
    passwordLabelColon: 'Password:',
    rememberMe: 'Remember me',
    done: 'Done',
    errWrong: 'Something is Wrong. Try Again',
    errMissing: '*Something is missing. Try again',
    interestsQ: 'On what type of events are you interested?',
    noAccount: 'No account? Sign up',
    haveAccount: 'Have an account? Log in',
    accountExists: 'That account already exists. Try logging in.',
    // onboarding
    onb1: 'Add a local business’s social media account to pull in the events they post.',
    onb2: 'Now you can save the events you are interested in.',
    next: 'Next',
    gotIt: 'Got it',
    // add business
    addBizTitle: 'Add a local business',
    addBizText:
      'Paste a business’s social media handle or page link and we’ll pull in the events they post.',
    addBizPlaceholder: '@elpasomarket or a page link',
    add: 'Add',
    addMore: 'Add more',
    alreadyAdded: 'That account is already added.',
    thanks: 'Thanks!',
    close: 'Close',
    businessesTitle: 'Local businesses',
    businessesText:
      'The businesses whose accounts you’ve added will show their events here.',
    myBusinesses: 'My Local Business',
    noBusinesses: 'You haven’t added any businesses yet.',
    addBusinessShort: 'Add business',
    new: 'New',
    account: 'Account',
    accountInfo: 'Account information',
    changePassword: 'Change password',
    newPassword: 'New password',
    save: 'Save',
    logOut: 'Log out',
    passwordChanged: 'Password updated',
    pwTooShort: 'Password must be at least 6 characters',
    weekdays: [
      'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
    ],
    months: [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December',
    ],
  },
  es: {
    welcome: 'Bienvenido',
    events: 'Eventos:',
    langEN: 'EN',
    langES: 'ES',
    map: 'Mapa',
    calendar: 'Calendario',
    list: 'Lista',
    nextEvents: 'Próximos eventos',
    pastEvents: 'Eventos pasados',
    noSaved: 'Aún no tienes eventos guardados.',
    when: 'Cuándo',
    category: 'Categoría',
    price: 'Precio',
    goodFor: 'Ideal para',
    Today: 'Hoy',
    'This Weekend': 'Este fin de semana',
    'This Week': 'Esta semana',
    clearFilters: 'Borrar filtros',
    savedChip: 'Guardados',
    cat_Food: 'Comida',
    cat_Music: 'Música',
    cat_Arts: 'Arte',
    cat_Outdoors: 'Aire libre',
    cat_Markets: 'Mercados',
    cat_Sports: 'Deportes',
    chip_Free: 'Gratis',
    chip_Paid: 'De pago',
    chip_Kids: 'Niños',
    'chip_18+': '18+',
    sortBy: 'Ordenar por:',
    sortDate: 'Fecha',
    sortPrice: 'Precio',
    empty1: '¡Lo sentimos!',
    empty2: 'No se encontraron eventos.',
    empty3: 'El evento más cercano es:',
    seeSimilar: 'Ver eventos similares',
    familyEvent: 'Evento familiar',
    seeDetails: 'Ver detalles',
    about: 'Acerca de:',
    additionalInfo: 'Información adicional:',
    host: 'Organiza:',
    moreInfo: 'Más información →',
    copied: '¡Copiado!',
    recur_Weekly: 'Semanal',
    recur_Biweekly: 'Quincenal',
    recur_Monthly: 'Mensual',
    monthTab: 'Mes',
    weekTab: 'Semana',
    logIn: 'INICIAR SESIÓN',
    signUp: 'REGISTRARSE',
    emailLabel: 'Correo',
    emailLabelColon: 'Correo:',
    passwordLabel: 'Contraseña',
    passwordLabelColon: 'Contraseña:',
    rememberMe: 'Recuérdame',
    done: 'Listo',
    errWrong: 'Algo está mal. Inténtalo de nuevo',
    errMissing: '*Falta algo. Inténtalo de nuevo',
    interestsQ: '¿Qué tipo de eventos te interesan?',
    noAccount: '¿Sin cuenta? Regístrate',
    haveAccount: '¿Ya tienes cuenta? Inicia sesión',
    accountExists: 'Esa cuenta ya existe. Inicia sesión.',
    onb1: 'Agrega la cuenta de redes sociales de un negocio local para traer los eventos que publican.',
    onb2: 'Ahora puedes guardar los eventos que te interesan.',
    next: 'Siguiente',
    gotIt: 'Entendido',
    addBizTitle: 'Agrega un negocio local',
    addBizText:
      'Pega el usuario de redes o el enlace de la página de un negocio y traeremos los eventos que publican.',
    addBizPlaceholder: '@elpasomarket o un enlace',
    add: 'Agregar',
    addMore: 'Agregar más',
    alreadyAdded: 'Esa cuenta ya está agregada.',
    thanks: '¡Gracias!',
    close: 'Cerrar',
    businessesTitle: 'Negocios locales',
    businessesText:
      'Los negocios cuyas cuentas hayas agregado mostrarán sus eventos aquí.',
    myBusinesses: 'Mis negocios locales',
    noBusinesses: 'Aún no has agregado negocios.',
    addBusinessShort: 'Agregar negocio',
    new: 'Nuevo',
    account: 'Cuenta',
    accountInfo: 'Información de la cuenta',
    changePassword: 'Cambiar contraseña',
    newPassword: 'Nueva contraseña',
    save: 'Guardar',
    logOut: 'Cerrar sesión',
    passwordChanged: 'Contraseña actualizada',
    pwTooShort: 'La contraseña debe tener al menos 6 caracteres',
    weekdays: [
      'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado',
    ],
    months: [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
    ],
  },
}

export function getLang() {
  return lang
}
export function setLang(l) {
  lang = l
  localStorage.setItem(KEY, l)
  listeners.forEach((fn) => fn())
}
export function t(key) {
  const d = DICT[lang] || DICT.en
  return d[key] ?? DICT.en[key] ?? key
}

export function useLang() {
  const [, force] = useReducer((n) => n + 1, 0)
  useEffect(() => {
    listeners.add(force)
    return () => listeners.delete(force)
  }, [])
  return { lang, setLang, t }
}
