'use client';

import { AnchorHTMLAttributes, ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const MotionButton = motion.button as any;
const MotionAnchor = motion.a as any;

type ButtonStyleProps = {
  variant?: 'primary' | 'accent' | 'ghost';
  size?: 'md' | 'lg';
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & ButtonStyleProps;
type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & ButtonStyleProps & { href: string };

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

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, children, variant = 'primary', size = 'md', type, ...props }, ref) => {
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

export const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  ({ className, children, variant = 'primary', size = 'md', href, ...props }, ref) => (
    <MotionAnchor
      ref={ref}
      href={href}
      className={cn(base, variants[variant], sizes[size], className)}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </MotionAnchor>
  )
);

ButtonLink.displayName = 'ButtonLink';
