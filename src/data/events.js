// Fictional events for now — real data will replace this later.
// Dates are generated relative to "today" (via `offset` in days) so the
// events always appear as upcoming on whatever the current date is.
// Images use picsum.photos placeholders (stable per seed).
const img = (seed) => `https://picsum.photos/seed/${seed}/600/400`

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const pad = (n) => String(n).padStart(2, '0')
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

const TODAY = new Date()
TODAY.setHours(0, 0, 0, 0)

function dateFromOffset(offset) {
  const d = new Date(TODAY)
  d.setDate(TODAY.getDate() + offset)
  return d
}

const RAW = [
  {
    id: 'running-club',
    title: 'Running Club',
    category: 'Outdoors',
    image: img('elp-running'),
    family: true,
    address: '3110 Parkwood St, El Paso, TX 79925',
    lat: 31.7745,
    lng: -106.4096,
    offset: 0,
    time: '7:00 pm',
    price: 'Free',
    about:
      'Whether you’re chasing a PR or just starting your fitness journey, you’re welcome here! We’re a casual, no-drop group that focuses on community, good miles, and great post-run coffee.',
    additionalInfo: 'Bring your own water',
    host: 'Sunset Heights Coffee',
  },
  {
    id: 'sunrise-yoga',
    title: 'Sunrise Yoga',
    category: 'Sports',
    image: img('elp-yoga'),
    family: true,
    address: 'Memorial Park, El Paso, TX 79930',
    lat: 31.7869,
    lng: -106.4663,
    offset: 1,
    time: '7:00 am',
    price: 'Free',
    about:
      'Start your day with a gentle all-levels flow as the sun comes up. Mats provided while supplies last.',
    additionalInfo: 'Bring a towel and water.',
    host: 'Sun City Yoga',
  },
  {
    id: 'mariachi-festival',
    title: 'Mariachi Festival',
    category: 'Music',
    image: img('elp-mariachi'),
    family: true,
    address: '2701 Sun Bowl Dr, El Paso, TX 79902',
    lat: 31.7683,
    lng: -106.5045,
    offset: 3,
    time: '5:00 pm',
    price: '$50 - $400',
    about: 'Get ready for an unforgettable night of live music.',
    additionalInfo: 'No food/drinks or any arm allowed.',
    host: 'Mariachi "Las Galleras"',
  },
  {
    id: 'jazz-night',
    title: 'Jazz Night',
    category: 'Music',
    image: img('elp-jazz'),
    family: false,
    address: '125 Pioneer Plaza, El Paso, TX 79901',
    lat: 31.7565,
    lng: -106.486,
    offset: 5,
    time: '8:00 pm',
    price: '$15.00',
    about:
      'An intimate evening of live jazz featuring local trios and a guest soloist. Doors open at 7:30 pm.',
    additionalInfo: 'Seating is first come, first served.',
    host: 'Downtown Jazz Society',
  },
  {
    id: 'art-walk',
    title: 'Art Walk',
    category: 'Arts',
    image: img('elp-art'),
    family: true,
    address: '1 Arts Festival Plaza, El Paso, TX 79901',
    lat: 31.761,
    lng: -106.488,
    offset: 7,
    time: '5:00 pm',
    price: 'Free',
    about:
      'A self-guided walk through downtown galleries and studios. Meet local artists and watch live demonstrations.',
    additionalInfo: 'Family friendly. Strollers welcome.',
    host: 'El Paso Museum of Art',
  },
  {
    id: 'farmers-market',
    title: 'Farmers Market',
    category: 'Markets',
    image: img('elp-market'),
    family: true,
    address: 'Downtown Artist & Farmers Market',
    lat: 31.757,
    lng: -106.4855,
    offset: 9,
    time: '9:00 am',
    price: 'Free',
    about:
      'Fresh produce, baked goods, handmade crafts, and food trucks from local vendors every weekend.',
    additionalInfo: 'Cash and cards accepted. Pets on leash welcome.',
    host: 'El Paso Markets',
  },
  {
    id: 'soccer-pickup',
    title: 'Pickup Soccer',
    category: 'Sports',
    image: img('elp-soccer'),
    family: true,
    address: '4200 Album Ave, El Paso, TX 79904',
    lat: 31.772,
    lng: -106.365,
    offset: 11,
    time: '6:00 pm',
    price: 'Free',
    about:
      'Casual pickup soccer for all skill levels. Teams are mixed on the spot. Just show up and play.',
    additionalInfo: 'Cleats recommended. Bring a light and dark shirt.',
    host: 'Sun City Soccer',
  },
  {
    id: 'cooking-class',
    title: 'Cooking Class',
    category: 'Food',
    image: img('elp-cooking'),
    family: false,
    address: '500 N Oregon St, El Paso, TX 79901',
    lat: 31.7598,
    lng: -106.4877,
    offset: 13,
    time: '6:00 pm',
    price: '$35.00',
    about:
      'Hands-on regional cooking class. Learn to make three dishes from scratch and enjoy them together at the end.',
    additionalInfo: 'Aprons and ingredients provided.',
    host: 'Mesa Culinary Studio',
  },
  {
    id: 'picnic',
    title: 'Picnic',
    category: 'Outdoors',
    image: img('elp-picnic'),
    family: true,
    address: 'El Paso Botanical Garden',
    lat: 31.7501,
    lng: -106.5061,
    offset: 17,
    time: '12:00 pm',
    price: '$20.00',
    about:
      'A relaxed afternoon picnic among the gardens. Blankets, baskets, and live acoustic music. Ticket includes garden entry.',
    additionalInfo: 'Outside food allowed. No glass containers.',
    host: 'Botanical Garden Friends',
  },
  {
    id: 'wine-tasting',
    title: 'Wine Tasting',
    category: 'Food',
    image: img('elp-wine'),
    family: false,
    ageNote: '+21',
    address: '201 E Franklin Ave, El Paso, TX 79901',
    lat: 31.7592,
    lng: -106.4869,
    offset: 19,
    time: '9:30 pm',
    price: '$50.00',
    about:
      'Think you can tell an Old World wine from a New World pour? Put your palate to the test at our Blind Wine Tasting Night. You’ll decode 4 mystery wines, learn to identify tasting notes, and compete for a prize. Enjoy a guided tasting session followed by a social hour featuring paired appetizers.',
    additionalInfo: 'Bring your own food',
    host: 'The Reagan Winery',
  },
]

// Derive real dates from each event's offset.
export const EVENTS = RAW.map((e) => {
  const d = dateFromOffset(e.offset)
  return {
    ...e,
    dateObj: d,
    iso: isoOf(d),
    day: d.getDate(),
    date: `${MONTHS[d.getMonth()]} ${ordinal(d.getDate())}`,
  }
})
