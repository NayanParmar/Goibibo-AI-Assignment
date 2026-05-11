import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plane, Hotel, Search, ArrowLeftRight,
  ChevronDown, ChevronUp, Clock, MapPin, TrendingUp,
  Shield, HeadphonesIcon, Tag, BadgePercent, Zap
} from 'lucide-react'
import { AirportSearch } from '@/components/search/AirportSearch'
import { TravellerSelector, type TravellerConfig } from '@/components/search/TravellerSelector'
import { AuthModal } from '@/components/home/AuthModal'

type TripType = 'oneway' | 'roundtrip' | 'multicity'
type OfferFilter = 'All' | 'Bank Offers' | 'Flights' | 'Hotels' | 'Cabs' | 'Trains'

interface RecentSearchItem {
  type: 'flight' | 'hotel'
  label: string
  sub: string
  href: string
}

const TODAY = new Date().toISOString().split('T')[0]
const RECENT_KEY = 'tp_recent_searches'

const OFFERS = [
  { id: 1, category: 'Flights', title: 'Flat 10% off on first flight booking', code: 'FIRST10', bank: null, color: 'from-blue-500 to-blue-700', desc: 'Use code at checkout. Valid for new users.' },
  { id: 2, category: 'Bank Offers', title: 'Extra ₹500 off with HDFC Credit Card', code: 'HDFC500', bank: 'HDFC', color: 'from-purple-500 to-purple-700', desc: 'Applicable on bookings above ₹3000.' },
  { id: 3, category: 'Hotels', title: 'Up to ₹500 off on hotel booking', code: 'HOTEL500', bank: null, color: 'from-orange-500 to-orange-700', desc: 'Save big on your next hotel stay.' },
  { id: 4, category: 'Flights', title: 'Summer special - 20% off domestic flights', code: 'SUMMER20', bank: null, color: 'from-sky-500 to-sky-700', desc: 'Limited period offer, book now!' },
  { id: 5, category: 'Bank Offers', title: 'Save ₹100 with SBI Debit Card', code: 'SAVE100', bank: 'SBI', color: 'from-green-500 to-green-700', desc: 'Valid on all bookings.' },
  { id: 6, category: 'Cabs', title: 'Flat 15% off on cab bookings', code: 'FLAT15', bank: null, color: 'from-yellow-500 to-yellow-700', desc: 'Book your ride at a great price.' },
]

const POPULAR_ROUTES = [
  { from: 'DEL', fromCity: 'Delhi', to: 'BOM', toCity: 'Mumbai', price: 2899, duration: '2h 15m' },
  { from: 'BOM', fromCity: 'Mumbai', to: 'GOI', toCity: 'Goa', price: 3199, duration: '1h 20m' },
  { from: 'BLR', fromCity: 'Bangalore', to: 'DEL', toCity: 'Delhi', price: 3499, duration: '2h 40m' },
  { from: 'HYD', fromCity: 'Hyderabad', to: 'BOM', toCity: 'Mumbai', price: 2599, duration: '1h 30m' },
  { from: 'DEL', fromCity: 'Delhi', to: 'BLR', toCity: 'Bangalore', price: 3299, duration: '2h 50m' },
  { from: 'MAA', fromCity: 'Chennai', to: 'BOM', toCity: 'Mumbai', price: 3099, duration: '2h 10m' },
]

const POPULAR_DESTINATIONS = [
  { city: 'Goa', desc: 'Beaches & Nightlife', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400&h=300&fit=crop', hotels: 120 },
  { city: 'Jaipur', desc: 'Forts & Culture', img: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=400&h=300&fit=crop', hotels: 95 },
  { city: 'Mumbai', desc: 'City of Dreams', img: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=400&h=300&fit=crop', hotels: 210 },
  { city: 'Bangalore', desc: 'Garden City', img: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=400&h=300&fit=crop', hotels: 175 },
  { city: 'Kerala', desc: "God's Own Country", img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=400&h=300&fit=crop', hotels: 140 },
  { city: 'Delhi', desc: 'Heart of India', img: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=400&h=300&fit=crop', hotels: 280 },
]

const FAQS = [
  { q: 'How do I book a flight on TravelPort?', a: 'Search for flights by entering your origin, destination, and date. Select a flight and click "Book Now". Complete the passenger details and payment to confirm your booking.' },
  { q: 'Can I cancel my booking?', a: 'Yes, you can cancel bookings from the "My Bookings" section. A 90% refund will be credited to your TravelPort wallet within 24 hours of cancellation.' },
  { q: 'What payment methods are accepted?', a: 'We accept Credit/Debit Cards, UPI, Net Banking, and TravelPort Wallet. All payments are secured with 256-bit SSL encryption.' },
  { q: 'How do I use a coupon code?', a: 'Enter the coupon code in the designated field on the booking page before completing payment. The discount will be applied automatically.' },
  { q: 'Is my personal data safe?', a: 'Absolutely. We use industry-standard encryption to protect your data. We never share your information with third parties without consent.' },
  { q: 'How do I track my booking?', a: `Log in to your account and go to "My Bookings". You'll find all your flight and hotel bookings along with their status and details.` },
]

function saveRecentSearch(search: RecentSearchItem) {
  const prev = getRecentSearches()
  const updated = [search, ...prev.filter(item => item.href !== search.href)].slice(0, 5)
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated))
}

function getRecentSearches(): RecentSearchItem[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
  } catch {
    return []
  }
}

export default function HomePage() {
  const navigate = useNavigate()
  const [tripType, setTripType] = useState<TripType>('oneway')
  const [offerFilter, setOfferFilter] = useState<OfferFilter>('All')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>(getRecentSearches())

  const [origin, setOrigin] = useState('')
  const [originCity, setOriginCity] = useState('')
  const [destination, setDestination] = useState('')
  const [destinationCity, setDestinationCity] = useState('')
  const [departureDate, setDepartureDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [travellers, setTravellers] = useState<TravellerConfig>({ adults: 1, children: 0, infants: 0, cabinClass: 'Economy' })

  const swapCities = () => {
    setOrigin(destination)
    setOriginCity(destinationCity)
    setDestination(origin)
    setDestinationCity(originCity)
  }

  const handleFlightSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination || !departureDate) return

    const total = travellers.adults + travellers.children + travellers.infants
    const href = `/flights?${new URLSearchParams({
      origin,
      destination,
      departureDate,
      passengers: String(total),
      cabinClass: travellers.cabinClass,
      ...(tripType === 'roundtrip' && returnDate ? { returnDate } : {}),
    })}`

    saveRecentSearch({
      type: 'flight',
      label: `${originCity || origin} → ${destinationCity || destination}`,
      sub: `${departureDate} · ${total} Traveller${total !== 1 ? 's' : ''} · ${travellers.cabinClass}`,
      href,
    })

    setRecentSearches(getRecentSearches())
    navigate(href)
  }

  const filteredOffers = offerFilter === 'All' ? OFFERS : OFFERS.filter(offer => offer.category === offerFilter)

  return (
    <div className="min-h-screen bg-gray-50">
      <AuthModal />

      <section
        className="relative text-white"
        style={{ background: 'linear-gradient(135deg, #1a56db 0%, #1e3a8a 100%)' }}
      >
        <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <div>
            <div className="mb-4 flex gap-4">
              {([['oneway', 'One Way'], ['roundtrip', 'Round Trip'], ['multicity', 'Multi City']] as [TripType, string][]).map(([value, label]) => (
                <label key={value} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-white">
                  <input
                    type="radio"
                    name="tripType"
                    value={value}
                    checked={tripType === value}
                    onChange={() => setTripType(value)}
                    className="accent-white"
                  />
                  {label}
                </label>
              ))}
            </div>

            <form onSubmit={handleFlightSearch}>
              <div className="rounded-2xl bg-white p-4 shadow-2xl">
                <div className="flex flex-wrap divide-x divide-gray-200">
                  <div className="min-w-[160px] flex-1 px-4 py-2">
                    <AirportSearch
                      label="From"
                      placeholder="City or Airport"
                      value={origin ? `${originCity} (${origin})` : ''}
                      onChange={(code, city) => { setOrigin(code); setOriginCity(city) }}
                    />
                  </div>

                  <div className="flex items-center px-2">
                    <button
                      type="button"
                      onClick={swapCities}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition-colors hover:border-blue-300 hover:bg-gray-50"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-gray-400" />
                    </button>
                  </div>

                  <div className="min-w-[160px] flex-1 px-4 py-2">
                    <AirportSearch
                      label="To"
                      placeholder="City or Airport"
                      value={destination ? `${destinationCity} (${destination})` : ''}
                      onChange={(code, city) => { setDestination(code); setDestinationCity(city) }}
                    />
                  </div>

                  <div className="min-w-[130px] flex-1 px-4 py-2">
                    <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Departure</label>
                    <input
                      type="date"
                      value={departureDate}
                      min={TODAY}
                      onChange={e => setDepartureDate(e.target.value)}
                      className="w-full border-b-2 border-gray-300 bg-transparent pb-1 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  {tripType === 'roundtrip' && (
                    <div className="min-w-[130px] flex-1 px-4 py-2">
                      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-gray-500">Return</label>
                      <input
                        type="date"
                        value={returnDate}
                        min={departureDate || TODAY}
                        onChange={e => setReturnDate(e.target.value)}
                        className="w-full border-b-2 border-gray-300 bg-transparent pb-1 text-sm font-medium text-gray-900 focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="min-w-[200px] flex-1 px-4 py-2">
                    <TravellerSelector value={travellers} onChange={setTravellers} />
                  </div>
                </div>

                <div className="mt-4 flex justify-center">
                  <button
                    type="submit"
                    className="flex items-center gap-2 rounded-full px-10 py-3 font-bold text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-100"
                    style={{ background: 'linear-gradient(90deg, #1a56db, #f97316)' }}
                  >
                    <Search className="h-5 w-5" /> Search Flights
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>

      {recentSearches.length > 0 && (
        <section className="relative z-10 mx-auto -mt-6 mb-4 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-lg">
            <p className="mb-3 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <Clock className="h-3 w-3" /> Recent Searches
            </p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {recentSearches.map((search, index) => (
                <button
                  key={`${search.href}-${index}`}
                  type="button"
                  onClick={() => navigate(search.href)}
                  className="flex shrink-0 cursor-pointer items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-left text-sm whitespace-nowrap transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  {search.type === 'flight'
                    ? <Plane className="h-4 w-4 text-blue-500" />
                    : <Hotel className="h-4 w-4 text-orange-500" />}
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{search.label}</p>
                    <p className="text-xs text-gray-400">{search.sub}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <BadgePercent className="h-5 w-5 text-blue-600" /> Offers For You
          </h2>
        </div>

        <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
          {(['All', 'Bank Offers', 'Flights', 'Hotels', 'Cabs', 'Trains'] as OfferFilter[]).map(filter => (
            <button
              key={filter}
              onClick={() => setOfferFilter(filter)}
              className={[
                'whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                offerFilter === filter
                  ? 'bg-blue-700 text-white shadow'
                  : 'border border-gray-200 bg-white text-gray-600 hover:border-blue-300',
              ].join(' ')}
            >
              {filter}
            </button>
          ))}
        </div>

        <div className="flex gap-4 overflow-x-auto pb-3">
          {filteredOffers.map(offer => (
            <div key={offer.id} className={`w-72 flex-shrink-0 rounded-2xl bg-gradient-to-br ${offer.color} p-5 text-white shadow-lg`}>
              <div className="mb-3 flex items-start justify-between">
                <span className="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">{offer.category}</span>
                {offer.bank && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">{offer.bank}</span>}
              </div>
              <p className="mb-2 text-base font-bold leading-snug">{offer.title}</p>
              <p className="mb-4 text-sm text-white/80">{offer.desc}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-1.5">
                  <Tag className="h-3 w-3" />
                  <span className="font-mono text-sm font-bold tracking-widest">{offer.code}</span>
                </div>
                <button className="text-xs font-semibold text-white/80 underline hover:text-white">Copy</button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900">
          <TrendingUp className="h-5 w-5 text-blue-600" /> Popular Flight Routes
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {POPULAR_ROUTES.map(route => (
            <button
              key={`${route.from}-${route.to}`}
              onClick={() => navigate(`/flights?origin=${route.from}&destination=${route.to}&departureDate=${TODAY}&passengers=1&cabinClass=Economy`)}
              className="group flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition-all hover:border-blue-200 hover:shadow-md"
            >
              <div>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-800">
                  <span>{route.fromCity}</span>
                  <Plane className="h-3 w-3 rotate-90 text-blue-500" />
                  <span>{route.toCity}</span>
                </div>
                <p className="mt-1 text-xs text-gray-400">{route.from} → {route.to} · {route.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-400">Starts from</p>
                <p className="text-lg font-bold text-blue-700">₹{route.price.toLocaleString('en-IN')}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-gray-900">
          <MapPin className="h-5 w-5 text-blue-600" /> Popular Destinations
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {POPULAR_DESTINATIONS.map(destination => (
            <button
              key={destination.city}
              onClick={() => navigate(`/hotels?city=${destination.city}&checkIn=${TODAY}`)}
              className="group overflow-hidden rounded-2xl shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="relative h-32 overflow-hidden">
                <img src={destination.img} alt={destination.city} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 p-2 text-left text-white">
                  <p className="text-sm font-bold">{destination.city}</p>
                  <p className="text-xs text-white/80">{destination.hotels} hotels</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-8 text-center text-xl font-bold text-gray-900">Why Book with TravelPort?</h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { icon: Tag, title: 'Best Prices', desc: 'Compare across 500+ airlines & 1M+ hotels' },
              { icon: Shield, title: 'Secure Booking', desc: '256-bit SSL secured transactions' },
              { icon: HeadphonesIcon, title: '24/7 Support', desc: 'Round-the-clock customer assistance' },
              { icon: Zap, title: 'Instant Booking', desc: 'Instant confirmation on all bookings' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Flight Booking FAQs</h2>
        <div className="flex flex-col gap-3">
          {FAQS.map((faq, index) => (
            <div key={index} className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-50"
              >
                {faq.q}
                {openFaq === index
                  ? <ChevronUp className="h-4 w-4 shrink-0 text-gray-400" />
                  : <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />}
              </button>
              {openFaq === index && (
                <div className="border-t border-gray-50 px-5 pb-4 pt-3 text-sm text-gray-600">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
