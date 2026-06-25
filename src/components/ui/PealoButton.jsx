'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const PealoButton = React.forwardRef(
  ({ className, variant = 'primary', children, padding, ...props }, ref) => {
    
    let shadcnVariant = "default"
    if (variant === 'outline') {
      shadcnVariant = 'outline'
    } else if (variant === 'secondary' || variant === 'yellow') {
      shadcnVariant = 'secondary'
    }

    return (
      <Button
        ref={ref}
        variant={shadcnVariant}
        className={cn("w-full rounded-xl font-semibold", padding, className)}
        {...props}
      >
        {children}
      </Button>
    )
  }
)
PealoButton.displayName = 'PealoButton'
