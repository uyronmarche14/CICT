type CustomBadgeProps = {
  variant?: 'default' | 'outline' | 'destructive';
  color?: 'green' | 'red' | 'blue' | 'yellow' | 'gray';
  children: React.ReactNode;
  className?: string;
};

const CustomBadge = ({
  variant = 'default',
  color = 'gray',
  children,
  className = '',
}: CustomBadgeProps) => {
  const baseClasses =
    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors';

  const variantClasses = {
    default: {
      green: 'bg-primary/20 text-primary',
      red: 'bg-destructive/20 text-destructive',
      blue: 'bg-secondary/20 text-secondary',
      yellow: 'bg-accent/20 text-accent',
      gray: 'bg-muted text-muted-foreground',
    },
    outline: {
      green: 'border border-primary text-primary',
      red: 'border border-destructive text-destructive',
      blue: 'border border-secondary text-secondary',
      yellow: 'border border-yellow-500 text-yellow-500',
      gray: 'border border-muted-foreground text-muted-foreground',
    },
    destructive: {
      green: 'bg-primary text-primary-foreground',
      red: 'bg-destructive text-destructive-foreground',
      blue: 'bg-secondary text-secondary-foreground',
      yellow: 'bg-accent text-accent-foreground',
      gray: 'bg-muted-foreground text-muted',
    },
  };

  const classes = `${baseClasses} ${variantClasses[variant][color]} ${className}`;

  return <span className={classes}>{children}</span>;
};

export default CustomBadge;
