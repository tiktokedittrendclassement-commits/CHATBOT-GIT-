'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import styles from './custom-select.module.css'

export function CustomSelect({ options, value, onChange, placeholder = "Sélectionner..." }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef(null)

    const selectedOption = options.find(opt => opt.value === value) || options[0]

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSelect = (val) => {
        onChange(val)
        setIsOpen(false)
    }

    return (
        <div className={styles.container} ref={containerRef}>
            <button
                className={`${styles.trigger} ${isOpen ? styles.triggerActive : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                type="button"
            >
                <span>{selectedOption?.label || placeholder}</span>
                <ChevronDown size={16} className={`${styles.arrow} ${isOpen ? styles.arrowOpen : ''}`} />
            </button>

            {isOpen && (
                <div className={styles.dropdown}>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`${styles.option} ${value === option.value ? styles.optionSelected : ''}`}
                            onClick={() => handleSelect(option.value)}
                        >
                            <span style={{ flex: 1 }}>{option.label}</span>
                            {value === option.value && <Check size={14} />}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
