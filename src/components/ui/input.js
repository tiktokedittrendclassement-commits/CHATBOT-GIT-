
import styles from './input.module.css'
import { cn } from '@/lib/utils'

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(styles.input, className)}
            {...props}
        />
    )
}
