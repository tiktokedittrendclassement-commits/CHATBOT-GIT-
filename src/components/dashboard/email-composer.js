'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Bold, Italic, List, Link as LinkIcon, Send } from 'lucide-react'
import styles from './email-composer.module.css'

export default function EmailComposer({ isOpen, onClose, onSend, leadsCount, initialSubject = '', initialBody = '', senderName = '', senderEmail = '' }) {
    const [subject, setSubject] = useState(initialSubject)
    const [isBold, setIsBold] = useState(false)
    const [isItalic, setIsItalic] = useState(false)
    const editorRef = useRef(null)

    useEffect(() => {
        if (initialSubject) setSubject(initialSubject)
        if (initialBody && editorRef.current) {
            editorRef.current.innerHTML = initialBody
        }
    }, [initialSubject, initialBody])

    if (!isOpen) return null

    const execCommand = (command, value = null) => {
        document.execCommand(command, false, value)
        if (editorRef.current) editorRef.current.focus()
        checkFormatting()
    }

    const checkFormatting = () => {
        setIsBold(document.queryCommandState('bold'))
        setIsItalic(document.queryCommandState('italic'))
    }

    const handleSend = () => {
        const bodyHtml = editorRef.current.innerHTML
        onSend({ subject, body: bodyHtml })
        setSubject('')
        if (editorRef.current) editorRef.current.innerHTML = ''
        if (onClose) onClose()
    }

    return (
        <div className={styles.composer}>
            {/* Header */}
            <div className={styles.header}>
                <div className={styles.title}>NOUVELLE CAMPAGNE ({leadsCount} contacts)</div>
                <div className={styles.headerActions}>
                    {onClose && (
                        <button className={styles.actionBtn} onClick={onClose}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.body}>
                <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>De</span>
                    <span style={{ fontSize: '13px', color: '#fff', fontWeight: 600 }}>
                        {senderName || 'Votre Marque'} {senderEmail ? `<${senderEmail}>` : '(Email Pro non configuré)'}
                    </span>
                </div>
                <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>À</span>
                    <span style={{ fontSize: '13px', color: '#fff' }}>Tous vos leads ({leadsCount})</span>
                </div>
                <div className={styles.inputGroup}>
                    <span className={styles.inputLabel}>Sujet</span>
                    <input
                        type="text"
                        className={styles.subjectInput}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Sujet de votre campagne"
                    />
                </div>
            </div>

            {/* Editor */}
            <div className={styles.editorContainer}>
                <div
                    ref={editorRef}
                    className={styles.editor}
                    contentEditable
                    onKeyUp={checkFormatting}
                    onMouseUp={checkFormatting}
                    data-placeholder="Écrivez votre message ici..."
                />
            </div>

            {/* Toolbar */}
            <div className={styles.toolbar}>
                <button
                    className={`${styles.toolbarBtn} ${isBold ? styles.toolbarBtnActive : ''}`}
                    onClick={() => execCommand('bold')}
                    title="Gras"
                >
                    <Bold size={18} />
                </button>
                <button
                    className={`${styles.toolbarBtn} ${isItalic ? styles.toolbarBtnActive : ''}`}
                    onClick={() => execCommand('italic')}
                    title="Italique"
                >
                    <Italic size={18} />
                </button>
                <button
                    className={styles.toolbarBtn}
                    onClick={() => execCommand('insertUnorderedList')}
                    title="Liste à puces"
                >
                    <List size={18} />
                </button>
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
                <button
                    className={styles.toolbarBtn}
                    onClick={() => {
                        const url = prompt('Entrez l\'URL')
                        if (url) execCommand('createLink', url)
                    }}
                    title="Insérer un lien"
                >
                    <LinkIcon size={18} />
                </button>
            </div>

            {/* Footer */}
            <div className={styles.footer}>
                <button
                    className={styles.sendBtn}
                    onClick={handleSend}
                    disabled={!subject}
                >
                    Envoyer <Send size={16} />
                </button>
                <div className={styles.secondaryActions}>
                    {/* Future actions like scheduling or templates can go here */}
                </div>
            </div>
        </div>
    )
}
