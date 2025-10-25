import * as React from "react"

const buttonVariants = {
  default: {
    backgroundColor: '#2563eb',
    color: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  destructive: {
    backgroundColor: '#dc2626',
    color: 'white',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  outline: {
    backgroundColor: 'white',
    color: '#111827',
    border: '1px solid #d1d5db',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  secondary: {
    backgroundColor: '#e5e7eb',
    color: '#111827',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  ghost: {
    backgroundColor: 'transparent',
    color: '#111827'
  },
  link: {
    backgroundColor: 'transparent',
    color: '#2563eb',
    textDecoration: 'underline'
  },
}

const buttonSizes = {
  default: {
    height: '2.5rem',
    paddingLeft: '1rem',
    paddingRight: '1rem',
    paddingTop: '0.5rem',
    paddingBottom: '0.5rem'
  },
  sm: {
    height: '2.25rem',
    borderRadius: '0.375rem',
    paddingLeft: '0.75rem',
    paddingRight: '0.75rem'
  },
  lg: {
    height: '2.75rem',
    borderRadius: '0.375rem',
    paddingLeft: '2rem',
    paddingRight: '2rem'
  },
  icon: {
    height: '2.5rem',
    width: '2.5rem'
  },
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants
  size?: keyof typeof buttonSizes
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={`${className || ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '0.375rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          transition: 'all 0.2s ease-in-out',
          outline: 'none',
          cursor: 'pointer',
          ...buttonVariants[variant],
          ...buttonSizes[size]
        }}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }