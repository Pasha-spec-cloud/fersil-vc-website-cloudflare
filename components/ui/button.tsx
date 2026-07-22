"use client";

import { ButtonHTMLAttributes, ReactElement, cloneElement, forwardRef, isValidElement } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MotionButton = motion.button as any;

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'accent' | 'ghost';
  size?: 'md' | 'lg';
  asChild?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', asChild = false, type, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center rounded-full font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-black';
    const variants = {
      primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
      accent: 'bg-accent text-white hover:bg-accent/90',
      ghost: 'bg-white/5 text-white hover:bg-white/10'
    };
    const sizes = {
      md: 'h-11 px-6 text-base',
      lg: 'h-12 px-8 text-lg'
    };

    if (asChild) {
      if (!isValidElement(children)) {
        throw new Error('Button with asChild expects a valid React element as its only child.');
      }
      const child = children as ReactElement;
      return cloneElement(child, {
        ...props,
        className: cn(base, variants[variant], sizes[size], child.props.className, className),
        ref
      });
    }

    return (
      <MotionButton
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        type={type ?? 'button'}
        whileTap={{ scale: 0.98 }}
        {...props}
      >
        {children}
      </MotionButton>
    );
  }
);

Button.displayName = 'Button';
