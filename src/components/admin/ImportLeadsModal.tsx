'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X, FileText, CheckCircle2, ArrowRight } from 'lucide-react'

const TARGET_FIELDS = [
  { key: 'full_name', label: 'Full Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'client_type', label: 'Client Type' },
  { key: 'preferred_area', label: 'Preferred Area' },
  { key: 'source', label: 'Source' },
  { key: 'notes', label: 'Notes' },
]

// Minimal CSV parser (handles quoted fields + commas)
function parseCSV(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = [], field = '', inQuotes = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++ }
      else if (c === '"') inQuotes = false
      else field += c
    } else {
      if (c === '"') inQuotes = true
      else if (c === ',') { row.push(field); field = '' }
      else if (c === '\n' || c === '\r') {
        if (field !== '' || row.length > 0) { row.push(field); rows.push(row); row = []; field = '' }
        if (c === '\r' && text[i + 1] === '\n') i++
      } else field += c
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row) }
  return rows.filter((r) => r.some((cell) => cell.trim() !== ''))
}

function autoGuess(header: string): string {
  const h = header.toLowerCase()
  if (/name/.test(h) && !/last/.test(h)) return 'full_name'
  if (/first/.test(h)) return 'full_name'
  if (/e-?mail/.test(h)) return 'email'
  if (/phone|mobile|cell|tel/.test(h)) return 'phone'
  if (/type|category/.test(h)) return 'client_type'
  if (/area|city|location|neighborhood/.test(h)) return 'preferred_area'
  if (/source|origin/.test(h)) return 'source'
  if (/note|comment|message/.test(h)) return 'notes'
  return ''
}

export default function ImportLeadsModal() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<'upload' | 'map' | 'done'>('upload')
  const [headers, setHeaders] = useState<string[]>([])
  const [rows, setRows] = useState<string[][]>([])
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(0)

  function handleFile(file: File) {
    const reader = new FileReader()
    reader.onload = () => {
      const parsed = parseCSV(String(reader.result))
      if (parsed.length < 2) return
      const hdr = parsed[0]
      setHeaders(hdr)
      setRows(parsed.slice(1))
      const guess: Record<string, string> = {}
      hdr.forEach((h, i) => { const g = autoGuess(h); if (g && !Object.values(guess).includes(g)) guess[String(i)] = g })
      setMapping(guess)
      setStep('map')
    }
    reader.readAsText(file)
  }

  async function runImport() {
    setImporting(true)
    const mapped = rows.map((r) => {
      const obj: Record<string, string> = {}
      Object.entries(mapping).forEach(([colIdx, field]) => {
        if (field) obj[field] = r[Number(colIdx)] ?? ''
      })
      return obj
    })
    const res = await fetch('/api/leads/import', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rows: mapped }),
    })
    const json = await res.json()
    setImporting(false)
    if (json.success) { setResult(json.inserted); setStep('done'); router.refresh(); window.dispatchEvent(new Event('leads-changed')) }
  }

  function reset() { setStep('upload'); setHeaders([]); setRows([]); setMapping({}); setResult(0) }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-secondary text-sm px-4 py-2.5">
        <Upload size={15} /> Import CSV
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-premium w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-thin">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-navy-900">Import Contacts</h2>
              <button type="button" onClick={() => { setOpen(false); reset() }} className="text-gray-400 hover:text-navy-900" aria-label="Close"><X size={20} /></button>
            </div>

            <div className="p-6">
              {step === 'upload' && (
                <div>
                  <label className="block border-2 border-dashed border-gray-200 rounded-2xl p-10 text-center cursor-pointer hover:border-sky-300 transition-colors">
                    <FileText size={32} className="text-gray-300 mx-auto mb-3" />
                    <p className="font-semibold text-navy-900 text-sm">Choose a CSV file</p>
                    <p className="text-gray-400 text-xs mt-1">Export contacts from your phone, Google, or a spreadsheet</p>
                    <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  </label>
                  <p className="text-gray-400 text-xs mt-4 text-center">We&apos;ll let you match columns in the next step.</p>
                </div>
              )}

              {step === 'map' && (
                <div>
                  <p className="text-sm text-gray-500 mb-4">Found <strong className="text-navy-900">{rows.length} rows</strong>. Match your columns:</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                    {headers.map((h, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-1/3 truncate" title={h}>{h || `Column ${i + 1}`}</span>
                        <ArrowRight size={12} className="text-gray-300 shrink-0" />
                        <select
                          value={mapping[String(i)] ?? ''}
                          onChange={(e) => setMapping((m) => ({ ...m, [String(i)]: e.target.value }))}
                          className="input-field text-sm flex-1 py-2"
                          title={`Map column ${h}`}
                        >
                          <option value="">— Skip —</option>
                          {TARGET_FIELDS.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button type="button" onClick={reset} className="btn-secondary flex-1">Back</button>
                    <button type="button" onClick={runImport} disabled={importing || !Object.values(mapping).some(Boolean)} className="btn-primary flex-1 disabled:opacity-50">
                      {importing ? 'Importing…' : `Import ${rows.length} Contacts`}
                    </button>
                  </div>
                </div>
              )}

              {step === 'done' && (
                <div className="text-center py-6">
                  <CheckCircle2 size={44} className="text-green-500 mx-auto mb-4" />
                  <h3 className="font-serif text-xl font-bold text-navy-900 mb-1">{result} contacts imported!</h3>
                  <p className="text-gray-500 text-sm mb-6">They&apos;re now in your Leads, ready to work.</p>
                  <button type="button" onClick={() => { setOpen(false); reset() }} className="btn-primary">Done</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
