import {
  Baby, Bug, Calculator, CalendarDays, Camera, Car, CarFront, ChefHat, Compass, GraduationCap, Hammer, HeartPulse, House,
  LifeBuoy, MonitorSmartphone, PawPrint, Ruler, Scissors, Shirt, Snowflake, Sparkles, SprayCan, Sprout, Tag, Truck, Wrench,
  type LucideIcon,
} from 'lucide-react'

// Keys mirror ICON_KEYS in lib/constants.ts (the admin's icon picker).
const ICONS: Record<string, LucideIcon> = {
  sparkles: Sparkles, 'spray-can': SprayCan, hammer: Hammer, truck: Truck, bug: Bug, snowflake: Snowflake,
  'monitor-smartphone': MonitorSmartphone, ruler: Ruler, wrench: Wrench, 'life-buoy': LifeBuoy, car: Car, 'car-front': CarFront,
  baby: Baby, 'graduation-cap': GraduationCap, 'paw-print': PawPrint, 'heart-pulse': HeartPulse, compass: Compass, shirt: Shirt,
  scissors: Scissors, 'chef-hat': ChefHat, 'calendar-days': CalendarDays, camera: Camera, house: House, calculator: Calculator,
  sprout: Sprout, tag: Tag,
}

export function CategoryIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name] ?? Sparkles
  return <Icon aria-hidden className={className} strokeWidth={1.5} />
}
