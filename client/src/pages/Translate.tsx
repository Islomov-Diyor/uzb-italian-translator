import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  ArrowLeftRight,
  Copy,
  Check,
  Upload,
  Loader2,
  Clock,
  ChevronRight,
  X,
} from 'lucide-react'
import Background3D from '../components/Background3D'
import Navbar from '../components/Navbar'
import { useLanguage } from '../context/LanguageContext'
import api from '../api/client'
import axios from 'axios'

type Direction = 'uz-it' | 'it-uz'

interface HistoryItem {
  id: number
  source_text: string
  translated_text: string
  direction: Direction
  created_at: string
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export default function Translate() {
  const { t } = useLanguage()
  const [direction, setDirection] = useState<Direction>('uz-it')
  const [sourceText, setSourceText] = useState('')
  const [outputText, setOutputText] = useState('')
  const [translating, setTranslating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [fileLoading, setFileLoading] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historySidebarOpen, setHistorySidebarOpen] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchHistory = useCallback(async () => {
    try {
      const { data } = await api.get<HistoryItem[]>('/history')
      setHistory(data)
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  const saveToHistory = useCallback(
    async (source: string, translated: string, dir: Direction) => {
      try {
        await api.post('/history', {
          source_text: source,
          translated_text: translated,
          direction: dir,
        })
        fetchHistory()
      } catch {
        // silently fail
      }
    },
    [fetchHistory]
  )

  const doTranslate = useCallback(
    async (text: string, dir: Direction) => {
      if (!text.trim()) {
        setOutputText('')
        return
      }
      setTranslating(true)
      try {
        const [src, tgt] = dir.split('-')
        const { data } = await axios.get('https://api.mymemory.translated.net/get', {
          params: { q: text, langpair: `${src}|${tgt}` },
        })
        const result: string = data.responseData?.translatedText ?? ''
        setOutputText(result)
        saveToHistory(text, result, dir)
      } catch {
        toast.error(t('translateError'))
      } finally {
        setTranslating(false)
      }
    },
    [t, saveToHistory]
  )

  const handleSourceChange = (val: string) => {
    setSourceText(val)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      doTranslate(val, direction)
    }, 800)
  }

  const handleSwap = () => {
    const newDir: Direction = direction === 'uz-it' ? 'it-uz' : 'uz-it'
    setDirection(newDir)
    const prevOutput = outputText
    setSourceText(prevOutput)
    setOutputText(sourceText)
    if (prevOutput.trim()) {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        doTranslate(prevOutput, newDir)
      }, 100)
    }
  }

  const handleCopy = async () => {
    if (!outputText) return
    await navigator.clipboard.writeText(outputText)
    setCopied(true)
    toast.success(t('copied'))
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''
    setFileLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('direction', direction)
      const { data } = await api.post<{ translatedText: string }>('/translate/file', formData)
      const blob = new Blob([data.translatedText], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `translated_${file.name}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(t('downloadTranslation'))
    } catch {
      toast.error(t('fileError'))
    } finally {
      setFileLoading(false)
    }
  }

  const loadHistoryItem = (item: HistoryItem) => {
    setDirection(item.direction)
    setSourceText(item.source_text)
    setOutputText(item.translated_text)
    setHistorySidebarOpen(false)
  }

  const [srcLang, tgtLang] = direction === 'uz-it' ? ["O'zbek", 'Italiano'] : ['Italiano', "O'zbek"]

  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      <Background3D />
      <Navbar />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex-1 pt-14 flex overflow-hidden relative"
      >
        {/* History Sidebar Overlay */}
        {historySidebarOpen && (
          <div
            className="fixed inset-0 z-20 bg-black/30"
            onClick={() => setHistorySidebarOpen(false)}
          />
        )}

        {/* History Sidebar */}
        <motion.div
          initial={false}
          animate={{ x: historySidebarOpen ? 0 : -320 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed left-0 top-14 bottom-0 w-[300px] z-30 glass border-r border-white/10 flex flex-col shadow-2xl shadow-black/40"
        >
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-violet-400" />
              <span className="text-sm font-medium text-slate-300">{t('history')}</span>
            </div>
            <button
              onClick={() => setHistorySidebarOpen(false)}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">{t('noHistory')}</p>
            ) : (
              history.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left glass rounded-xl p-3 hover:bg-white/8 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-violet-400 font-medium">
                      {item.direction === 'uz-it' ? "O'z → It" : "It → O'z"}
                    </span>
                    <ChevronRight
                      size={12}
                      className="text-slate-600 group-hover:text-slate-400 transition-colors"
                    />
                  </div>
                  <p className="text-xs text-slate-300 truncate">{item.source_text}</p>
                  <p className="text-xs text-slate-500 truncate">{item.translated_text}</p>
                </button>
              ))
            )}
          </div>
        </motion.div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0 p-4 sm:p-6 gap-4">
          {/* Direction bar */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setHistorySidebarOpen((v) => !v)}
              className="flex items-center gap-1.5 glass rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              <Clock size={13} />
              {t('history')}
              {history.length > 0 && (
                <span className="bg-violet-600/60 text-white text-xs px-1.5 py-0.5 rounded-full ml-1">
                  {history.length}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 glass rounded-2xl px-5 py-2.5">
              <span className="text-sm font-semibold text-violet-300 min-w-[70px] text-right">
                {srcLang}
              </span>
              <button
                onClick={handleSwap}
                className="p-1.5 rounded-lg hover:bg-violet-600/30 transition-colors text-slate-400 hover:text-white"
                title="Swap languages"
              >
                <ArrowLeftRight size={16} />
              </button>
              <span className="text-sm font-semibold text-indigo-300 min-w-[70px]">
                {tgtLang}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={fileLoading}
                className="flex items-center gap-1.5 glass rounded-xl px-3 py-2 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                {fileLoading ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Upload size={13} />
                )}
                {fileLoading ? t('translatingFile') : t('uploadFile')}
              </button>
            </div>
          </div>

          {/* Textareas */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4" style={{ minHeight: '400px' }}>
            {/* Source */}
            <div className="glass-strong rounded-2xl flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <span className="text-xs font-semibold text-violet-300 tracking-wide uppercase">
                  {srcLang}
                </span>
                <span className="text-xs text-slate-500">
                  {wordCount(sourceText)} {t('words')}
                </span>
              </div>
              <textarea
                value={sourceText}
                onChange={(e) => handleSourceChange(e.target.value)}
                placeholder={t('sourceText')}
                className="flex-1 bg-transparent resize-none p-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none leading-relaxed"
              />
            </div>

            {/* Output */}
            <div className="glass-strong rounded-2xl flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/10 flex items-center justify-between flex-shrink-0">
                <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">
                  {tgtLang}
                </span>
                <button
                  onClick={handleCopy}
                  disabled={!outputText}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-violet-300 transition-colors disabled:opacity-30"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                  {copied ? t('copied') : t('copy')}
                </button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto">
                {translating ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    {t('translating')}
                  </div>
                ) : (
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                    {outputText}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
