import { useNavigate } from 'react-router-dom'
import { Clock } from 'lucide-react'
import type { FlightDto } from '@/types'
import { formatCurrency, formatDuration } from '@/utils/formatters'

interface FlightCardProps {
  flight: FlightDto
}

const AIRLINE_COLORS: Record<string, string> = {
  'IndiGo':            '#0056a2',
  'SpiceJet':          '#e31837',
  'Air India':         '#c8102e',
  'Vistara':           '#6f2c91',
  'Akasa Air':         '#ff6600',
  'Air India Express': '#007ba7',
  'Go First':          '#003580',
}

function AirlineLogo({ airline }: { airline: string }) {
  const color = AIRLINE_COLORS[airline] ?? '#555'
  const initials = airline.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      style={{ backgroundColor: color }}
      className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
    >
      {initials}
    </div>
  )
}

export function FlightCard({ flight }: FlightCardProps) {
  const navigate = useNavigate()

  const dep = new Date(flight.departureTime)
  const arr = new Date(flight.arrivalTime)
  const fmt = (d: Date) => d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })
  const isNextDay = arr.getDate() !== dep.getDate() || arr.getMonth() !== dep.getMonth()

  const stopsLabel = flight.stops === 0 ? 'Non stop' : flight.stops === 1 ? '1 Stop' : `${flight.stops} Stops`

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex items-center gap-4 px-5 py-4">
        {/* Airline logo + name */}
        <div className="flex flex-col items-center gap-1.5 w-20 flex-shrink-0">
          <AirlineLogo airline={flight.airline} />
          <p className="text-xs font-semibold text-gray-700 text-center leading-tight">{flight.airline}</p>
          <p className="text-xs text-gray-400">{flight.flightNumber}</p>
        </div>

        {/* Route */}
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-center">
          {/* Departure */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">{fmt(dep)}</p>
            <p className="text-sm text-gray-500 mt-0.5">{flight.origin}</p>
          </div>

          {/* Duration + stops */}
          <div className="flex flex-col items-center gap-0.5 flex-1 min-w-[80px] max-w-[140px]">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(flight.durationMinutes)}
            </p>
            <div className="w-full flex items-center gap-1">
              <div className="flex-1 h-px bg-gray-300" />
              <div className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
            </div>
            <p className={`text-xs font-semibold ${flight.stops === 0 ? 'text-green-600' : 'text-orange-500'}`}>
              {stopsLabel}
            </p>
          </div>

          {/* Arrival */}
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 tabular-nums">
              {fmt(arr)}
              {isNextDay && <sup className="text-orange-500 text-base ml-0.5">+1</sup>}
            </p>
            <p className="text-sm text-gray-500 mt-0.5">{flight.destination}</p>
          </div>
        </div>

        {/* Price + CTA */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0 min-w-[120px]">
          <div className="text-right">
            <p className="text-xl font-bold text-gray-900">{formatCurrency(flight.price)}</p>
            <p className="text-xs text-gray-400">per adult</p>
          </div>
          <button
            onClick={() => navigate(`/flights/${flight.id}/book`)}
            disabled={flight.availableSeats === 0}
            className={`px-4 py-2 rounded-lg text-sm font-bold tracking-wide transition-colors ${
              flight.availableSeats === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-orange-500 hover:bg-orange-600 text-white'
            }`}
          >
            {flight.availableSeats === 0 ? 'SOLD OUT' : 'VIEW FARES'}
          </button>
          {flight.availableSeats > 0 && flight.availableSeats <= 9 && (
            <p className="text-xs text-red-500 font-semibold">{flight.availableSeats} seats left!</p>
          )}
        </div>
      </div>

      {/* Tag bar */}
      {(flight.isRefundable || flight.baggageIncluded) && (
        <div className="bg-green-50 border-t border-green-100 px-5 py-1.5 flex items-center gap-4">
          {flight.isRefundable && (
            <span className="text-xs text-green-700 font-medium">✓ Refundable</span>
          )}
          {flight.baggageIncluded && (
            <span className="text-xs text-green-700 font-medium">
              ✓ {flight.checkedBags ? `${flight.checkedBags} Checked Bag` : 'Baggage Included'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
