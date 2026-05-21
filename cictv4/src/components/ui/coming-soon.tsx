import * as React from 'react';
import { Clock, Construction, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './card';
import { Button } from './button';
import { useCountdown } from '@/hooks/ui/use-countdown';

type ComingSoonProps = {
  title?: string;
  description?: string;
  expectedDate?: string;
  showIcon?: boolean;
  showCountdown?: boolean;
  className?: string;
  onNotifyMe?: () => void;
  notifyButtonText?: string;
  variant?: 'default' | 'construction' | 'sparkles';
};

const ComingSoon: React.FC<ComingSoonProps> = ({
  title = 'Coming Soon',
  description = "We're working hard to bring you something amazing. Stay tuned for updates!",
  expectedDate,
  showIcon = true,
  showCountdown = false,
  className,
  onNotifyMe,
  notifyButtonText = 'Notify Me',
  variant = 'default',
}) => {
  const countdown = useCountdown(expectedDate || new Date());

  const getIcon = () => {
    switch (variant) {
      case 'construction':
        return <Construction className="h-12 w-12 text-chart-4" />;
      case 'sparkles':
        return <Sparkles className="h-12 w-12 text-chart-2" />;
      default:
        return <Clock className="h-12 w-12 text-primary" />;
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'construction':
        return 'border-chart-4/20 bg-chart-4/5 dark:border-chart-4/30 dark:bg-chart-4/10';
      case 'sparkles':
        return 'border-chart-2/20 bg-chart-2/5 dark:border-chart-2/30 dark:bg-chart-2/10';
      default:
        return 'border-primary/20 bg-primary/5 dark:border-primary/30 dark:bg-primary/10';
    }
  };

  return (
    <Card
      className={cn(
        'max-w-md mx-auto text-center border-2',
        getVariantStyles(),
        className
      )}
    >
      <CardHeader className="pb-4">
        {showIcon && (
          <div className="flex justify-center mb-4">{getIcon()}</div>
        )}
        <CardTitle className="text-2xl font-black text-card-foreground">
          {title}
        </CardTitle>
        <CardDescription className="text-base text-muted-foreground mt-2">
          {description}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {expectedDate && (
          <div className="bg-card/50 rounded-lg p-3 border border-border">
            <p className="text-sm font-medium text-muted-foreground">
              Expected Release
            </p>
            <p className="text-lg font-semibold text-card-foreground">
              {expectedDate}
            </p>
          </div>
        )}

        {showCountdown && expectedDate && (
          <div className="bg-card/50 rounded-lg p-3 border border-border">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Time Remaining
            </p>
            <div className="flex justify-center space-x-2 text-lg font-mono">
              <span className="bg-muted px-2 py-1 rounded min-w-[2rem] text-center text-card-foreground">
                {countdown.days.toString().padStart(2, '0')}
              </span>
              <span className="text-muted-foreground">d</span>
              <span className="bg-muted px-2 py-1 rounded min-w-[2rem] text-center text-card-foreground">
                {countdown.hours.toString().padStart(2, '0')}
              </span>
              <span className="text-muted-foreground">h</span>
              <span className="bg-muted px-2 py-1 rounded min-w-[2rem] text-center text-card-foreground">
                {countdown.minutes.toString().padStart(2, '0')}
              </span>
              <span className="text-muted-foreground">m</span>
              <span className="bg-muted px-2 py-1 rounded min-w-[2rem] text-center text-card-foreground">
                {countdown.seconds.toString().padStart(2, '0')}
              </span>
              <span className="text-muted-foreground">s</span>
            </div>
          </div>
        )}

        {onNotifyMe && (
          <Button onClick={onNotifyMe} className="w-full" variant="default">
            {notifyButtonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export { ComingSoon };
export type { ComingSoonProps };
