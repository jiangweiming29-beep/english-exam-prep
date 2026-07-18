import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StarRatingProps {
  stars: number;
  maxStars?: number;
  size?: number;
  className?: string;
  animated?: boolean;
}

export function StarRating({
  stars,
  maxStars = 5,
  size = 20,
  className,
  animated = true,
}: StarRatingProps) {
  return (
    <div className={cn('flex items-center gap-0.5', className)}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <Star
          key={i}
          size={size}
          fill={i < stars ? 'currentColor' : 'none'}
          className={cn(
            'transition-all duration-300',
            i < stars ? 'text-accent-500 star-filled' : 'text-slate-200 star-empty',
            animated && i < stars ? 'animate-star-pop' : ''
          )}
          style={animated ? { animationDelay: `${i * 0.1}s` } : undefined}
        />
      ))}
    </div>
  );
}
