
import styles from './button.module.css'
import { cn } from '@/lib/utils'

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    return (
        <button
            className={cn(styles.button, styles[variant], styles[size], className)}
            {...props}
        >
            {children}
        </button>
    )
}
