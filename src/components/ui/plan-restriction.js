'use client'

import React from 'react'
import { Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import styles from './plan-restriction.module.css'

export function PlanRestriction({
    tier = 'Pro',
    description = `Cette fonctionnalité est réservée aux abonnements ${tier}.`,
    upgradeLink = '/billing',
    isOverlay = false
}) {
    const content = (
        <div className={styles.lockedBox}>
            <div className={styles.iconContainer}>
                <Lock size={18} />
            </div>
            <div className={styles.content}>
                <div className={styles.lockedText}>
                    Fonctionnalité {tier}
                </div>
                {description && <p className={styles.lockedSubText} dangerouslySetInnerHTML={{ __html: description }} />}
            </div>
            <Link href={upgradeLink}>
                <Button size="sm" className={styles.upgradeBtn}>
                    Mettre à niveau
                </Button>
            </Link>
        </div>
    )

    if (isOverlay) {
        return (
            <div className={styles.overlayWrapper}>
                {content}
            </div>
        )
    }

    return content
}



