import { weatherIcon } from '@/lib/weatherIcons';

interface WeatherIconProps {
  condition: string;
  className?: string;
}

export default function WeatherIcon({ condition, className = 'w-8 h-8' }: WeatherIconProps) {
  const { Icon } = weatherIcon(condition);
  return <Icon className={className} />;
}
