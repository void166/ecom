import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './lib';

const variants = cva(
  'inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary: 'bg-neutral-950 text-white hover:bg-neutral-800 focus-visible:ring-neutral-500',
        secondary: 'bg-neutral-100 text-neutral-950 hover:bg-neutral-200 focus-visible:ring-neutral-400',
        outline: 'border border-neutral-300 bg-transparent hover:bg-neutral-50 focus-visible:ring-neutral-400',
        ghost: 'hover:bg-neutral-100 focus-visible:ring-neutral-400',
        danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-400',
      },
      size: { sm: 'h-9 px-4', md: 'h-11 px-6', lg: 'h-13 px-8 text-base', icon: 'size-10' },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof variants> {
  asChild?: boolean;
}

export function Button({ className, variant, size, asChild, ...props }: ButtonProps) {
  const Component = asChild ? Slot : 'button';
  return <Component className={cn(variants({ variant, size }), className)} {...props} />;
}
