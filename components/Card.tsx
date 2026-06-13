import React, { ReactNode } from 'react';
import { motion } from 'motion/react';

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  animate?: boolean;
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, className = '', hoverable = true, animate = true }, ref) => {
    const classes = `glass-card ${hoverable ? 'glass-card-hover' : ''} ${className}`.trim();

    if (animate) {
      return (
        <motion.div
          ref={ref}
          whileHover={hoverable ? { scale: 1.01 } : undefined}
          transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          className={classes}
        >
          {children}
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={classes}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`glass-card-header ${className}`}>
        {children}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`glass-card-body ${className}`}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '' }, ref) => {
    return (
      <div ref={ref} className={`glass-card-footer ${className}`}>
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardBody, CardFooter };
