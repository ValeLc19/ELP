import { useState } from 'react'
import { extractLink, addUserEvent } from '../lib/userEvents.js'
import { addBusiness } from '../lib/businesses.js'
import { ocrImage, parseEventText, imageFileToDataUrl, guessCategory } from '../lib/ocr.js'
import { useLang } from '../lib/i18n.js'
import { CATEGORY_ORDER, categoryColor, categoryTint } from '../data/categories.js'
import { XIcon } from './icons.jsx'
import ConfirmDialog from './ConfirmDialog.jsx'
import './AddEventModal.css'

// True when the ISO date is before today (local) — an already-passed event.
function isPastDate(iso) {
  if (!iso) return false
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y || 1970, (m || 1) - 1, d || 1) < t
}

// Paste a link -> best-effort autofill -> review/edit -> save as a private,
// per-user event tagged to one of the user's businesses.
export default function AddEventModal({ businesses, onClose }) {
  const { t } = useLang()
  const [bizId, setBizId] = useState(businesses[0]?.id || 'other')
  const [hostName, setHostName] = useState('') // free-text host for "Other"
  const [newBizName, setNewBizName] = useState('') // handle/name for a new biz
  const [url, setUrl] = useState('')
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [added, setAdded] = useState(false)
  const [autofillMsg, setAutofillMsg] = useState('')
  const [imgError, setImgError] = useState(false)
  const [confirmPast, setConfirmPast] = useState(null) // null | 'close' | 'another'
  const [detectedDates, setDetectedDates] = useState([]) // [{ dateISO, time }]
  const [selectedDates, setSelectedDates] = useState(() => new Set()) // multi-pick
  const [form, setForm] = useState({
    title: '', categories: ['Markets'], dateISO: '', time: '',
    price: '', address: '', image: '', about: '',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const clearForm = () => {
    setForm({
      title: '', categories: [], dateISO: '', time: '',
      price: '', address: '', image: '', about: '',
    })
    setUrl('')
    setHostName('')
    setNewBizName('')
    setAutofillMsg('')
    setDetectedDates([])
    setSelectedDates(new Set())
    setImgError(false)
    setErr('')
  }

  // Toggle a category chip (at least one must stay selected).
  const toggleCategory = (c) => {
    setForm((f) => {
      const cats = f.categories || []
      const has = cats.includes(c)
      return {
        ...f,
        categories: has ? cats.filter((x) => x !== c) : [...cats, c],
      }
    })
  }

  // Toggle a detected date in/out of the multi-select set.
  const toggleDate = (iso) => {
    setSelectedDates((prev) => {
      const next = new Set(prev)
      if (next.has(iso)) next.delete(iso)
      else next.add(iso)
      return next
    })
  }

  // The dates to actually create: the selected chips, or else the single
  // Date field. Each carries its own time when the flyer specified one.
  const datesToAdd = () => {
    if (selectedDates.size > 0) {
      return detectedDates.filter((d) => selectedDates.has(d.dateISO))
    }
    return form.dateISO ? [{ dateISO: form.dateISO, time: form.time }] : []
  }

  const autofill = async () => {
    if (!url.trim() || reading) return
    setReading(true)
    setErr('')
    setAutofillMsg('')
    const d = await extractLink(url.trim())

    // Read the flyer itself: OCR the image (browser-side) + the caption, then
    // pull date/time/price/place out of that text. Fills only what the page's
    // structured data (OG/JSON-LD) didn't already provide.
    const merged = { ...d }
    let ocrText = ''
    if (d.imageData || d.about) {
      if (d.imageData) setAutofillMsg(t('readingFlyer'))
      ocrText = d.imageData ? await ocrImage(d.imageData) : ''
      const parsed = parseEventText([ocrText, d.about].filter(Boolean).join('\n'))
      for (const k of ['dateISO', 'time', 'price', 'address']) {
        if (!merged[k] && parsed[k]) merged[k] = parsed[k]
      }
      setDetectedDates(parsed.dates || [])
      setSelectedDates(new Set())
    }

    setReading(false)
    const found = ['title', 'dateISO', 'time', 'price', 'address', 'image', 'about']
      .filter((k) => merged[k]).length
    setAutofillMsg(found > 0 ? t('autofillFilled') : t('autofillEmpty'))
    if (merged.image) setImgError(false)
    const bizName = (bizId === 'other' ? hostName : businesses.find((b) => b.id === bizId)?.name) || ''
    const cat = guessCategory([bizName, merged.title, ocrText, merged.about].filter(Boolean).join(' '))
    setForm((f) => ({
      ...f,
      title: merged.title || f.title,
      categories: cat ? [cat] : f.categories,
      dateISO: merged.dateISO || f.dateISO,
      time: merged.time || f.time,
      price: merged.price || f.price,
      address: merged.address || f.address,
      image: merged.image || f.image,
      about: merged.about || f.about,
    }))
  }

  // Upload the actual flyer (for carousels/videos where the link only exposes
  // slide 1): use it as the event image and OCR it to fill the fields.
  const onFlyerFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = '' // allow re-selecting the same file
    if (!file || !file.type.startsWith('image/') || reading) return
    setReading(true)
    setErr('')
    setAutofillMsg(t('readingFlyer'))
    let dataUrl
    try {
      dataUrl = await imageFileToDataUrl(file)
    } catch {
      setReading(false)
      setErr(t('errWrong'))
      return
    }
    setImgError(false)
    const ocrText = await ocrImage(dataUrl)
    const parsed = parseEventText([ocrText, form.about].filter(Boolean).join('\n'))
    // Merge (don't replace) — the upload completes what the link found, e.g.
    // dates that were only visible on the flyer image.
    setDetectedDates((prev) => {
      const seen = new Set(prev.map((x) => x.dateISO))
      const out = [...prev]
      for (const dt of parsed.dates || []) {
        if (!seen.has(dt.dateISO)) {
          seen.add(dt.dateISO)
          out.push(dt)
        }
      }
      return out.sort((a, b) => a.dateISO.localeCompare(b.dateISO))
    })
    setReading(false)
    const found = ['dateISO', 'time', 'price', 'address'].filter((k) => parsed[k]).length
    setAutofillMsg(found > 0 ? t('autofillFilled') : t('autofillEmpty'))
    const bizName = (bizId === 'other' ? hostName : businesses.find((b) => b.id === bizId)?.name) || ''
    const cat = guessCategory([bizName, form.title, ocrText, form.about].filter(Boolean).join(' '))
    setForm((f) => ({
      ...f,
      image: dataUrl,
      categories: cat ? [cat] : f.categories,
      dateISO: f.dateISO || parsed.dateISO || '',
      time: f.time || parsed.time || '',
      price: f.price || parsed.price || '',
      address: f.address || parsed.address || '',
    }))
  }

  const save = (andAnother = false) => {
    if (busy) return
    const dates = datesToAdd()
    if (!form.title.trim() || dates.length === 0 || (form.categories || []).length === 0) {
      setErr(t('errMissing'))
      return
    }
    if (bizId === 'new' && !newBizName.trim()) {
      setErr(t('errMissing'))
      return
    }
    // Warn if any of the dates to add has already passed.
    if (dates.some((d) => isPastDate(d.dateISO))) {
      setConfirmPast(andAnother ? 'another' : 'close')
      return
    }
    persist(andAnother)
  }

  const persist = async (andAnother) => {
    const isOther = bizId === 'other'
    let biz = null
    if (bizId === 'new') {
      biz = addBusiness(newBizName.trim()) // creates it (or returns existing)
      if (biz) setBizId(biz.id) // select it going forward; it's now in the list
    } else if (!isOther) {
      biz = businesses.find((b) => b.id === bizId)
    }
    const dates = datesToAdd()
    setBusy(true)
    setErr('')
    let saved = 0
    let dupes = 0
    for (const dt of dates) {
      const res = await addUserEvent({
        businessId: biz?.id || null,
        businessName: isOther ? hostName.trim() || null : biz?.name || null,
        title: form.title.trim(),
        categories: form.categories || ['Markets'],
        image: form.image || null,
        address: form.address || null,
        dateISO: dt.dateISO,
        time: dt.time || form.time || null,
        price: form.price || null,
        about: form.about || null,
        sourceUrl: url.trim() || null,
      })
      if (res.ok) saved++
      else if (res.duplicate) dupes++
    }
    setBusy(false)
    if (saved === 0) {
      setErr(dupes > 0 ? t('duplicateEvent') : t('errWrong'))
      return
    }
    if (andAnother) {
      // Keep the modal open (same business) for the next carousel slide.
      setForm({
        title: '', categories: [], dateISO: '', time: '',
        price: '', address: '', image: '', about: '',
      })
      setUrl('')
      setDetectedDates([])
      setSelectedDates(new Set())
      setImgError(false)
      setAutofillMsg(t('eventAdded'))
    } else {
      setAdded(true)
      setTimeout(onClose, 900)
    }
  }

  return (
    <div className="aev" role="dialog" aria-modal="true">
      <div className="aev__backdrop" onClick={onClose} />
      <div className="aev__card">
        <button className="aev__close" onClick={onClose} aria-label={t('close')}>
          <XIcon />
        </button>

        {added ? (
          <p className="aev__added">{t('eventAdded')}</p>
        ) : (
          <>
            <h2 className="aev__title">{t('addEventTitle')}</h2>
            <p className="aev__intro">{t('addEventIntro')}</p>

            <label className="aev__label">{t('forBusiness')}</label>
            <select className="aev__input" value={bizId} onChange={(e) => setBizId(e.target.value)}>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
              <option value="new">{t('addNewBusinessOpt')}</option>
              <option value="other">{t('otherBusiness')}</option>
            </select>
            {bizId === 'other' && (
              <input
                className="aev__input aev__host"
                placeholder={t('hostNamePlaceholder')}
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
            )}
            {bizId === 'new' && (
              <input
                className="aev__input aev__host"
                placeholder={t('newBizPlaceholder')}
                value={newBizName}
                onChange={(e) => setNewBizName(e.target.value)}
              />
            )}

            <div className="aev__step">
              <span className="aev__step-num">1</span>
              <h3 className="aev__step-title">{t('importFromLink')}</h3>
            </div>
            <div className="aev__row">
              <input
                className="aev__input"
                placeholder={t('eventLinkPlaceholder')}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
              />
              <button type="button" className="aev__fetch" onClick={autofill} disabled={reading || !url.trim()}>
                {reading ? t('reading') : t('autofillLink')}
              </button>
            </div>
            {autofillMsg ? (
              <p className="aev__autofill-msg">{autofillMsg}</p>
            ) : (
              <p className="aev__hint">{t('autofillHint')}</p>
            )}

            <p className="aev__or">{t('orUpload')}</p>
            <label className="aev__upload">
              <input type="file" accept="image/*" onChange={onFlyerFile} hidden />
              {t('uploadFlyer')}
            </label>

            <div className="aev__step">
              <span className="aev__step-num">2</span>
              <h3 className="aev__step-title">{t('reviewEdit')}</h3>
              <button type="button" className="aev__clear" onClick={clearForm}>
                {t('clearForm')}
              </button>
            </div>

            <label className="aev__label">
              {t('evTitle')} <span className="aev__req">*</span>
            </label>
            <input className="aev__input" value={form.title} onChange={(e) => set('title', e.target.value)} />

            <div className="aev__grid">
              <div>
                <label className="aev__label">
                  {t('evDate')} <span className="aev__req">*</span>
                </label>
                <input className="aev__input" type="date" value={form.dateISO} onChange={(e) => set('dateISO', e.target.value)} />
              </div>
              <div>
                <label className="aev__label">{t('evTime')}</label>
                <input className="aev__input" placeholder="6:00 pm" value={form.time} onChange={(e) => set('time', e.target.value)} />
              </div>
            </div>
            {detectedDates.length > 1 && (
              <div className="aev__dates">
                <span className="aev__dates-label">{t('foundDates')}</span>
                {detectedDates.map((dt) => (
                  <button
                    type="button"
                    key={dt.dateISO}
                    className={`aev__date-chip ${selectedDates.has(dt.dateISO) ? 'is-on' : ''}`}
                    onClick={() => toggleDate(dt.dateISO)}
                  >
                    {new Date(dt.dateISO + 'T12:00:00').toLocaleDateString(undefined, {
                      month: 'short', day: 'numeric',
                    })}
                    {dt.time ? ` · ${dt.time}` : ''}
                  </button>
                ))}
                {selectedDates.size > 0 && (
                  <span className="aev__dates-note">{t('eachDateEvent')}</span>
                )}
              </div>
            )}

            <label className="aev__label">
              {t('category')} <span className="aev__req">*</span>
            </label>
            <div className="aev__cats">
              {CATEGORY_ORDER.map((c) => {
                const on = (form.categories || []).includes(c)
                return (
                  <button
                    type="button"
                    key={c}
                    className={`aev__cat-chip ${on ? 'is-on' : ''}`}
                    style={{
                      borderColor: categoryColor(c),
                      background: on ? categoryTint(c, 0.55) : undefined,
                    }}
                    onClick={() => toggleCategory(c)}
                  >
                    <span className="badge__dot" style={{ background: categoryColor(c) }} />
                    {t(`cat_${c}`)}
                  </button>
                )
              })}
            </div>

            <label className="aev__label">{t('evPrice')}</label>
            <input className="aev__input" placeholder="Free" value={form.price} onChange={(e) => set('price', e.target.value)} />

            <label className="aev__label">{t('evAddress')}</label>
            <input className="aev__input" value={form.address} onChange={(e) => set('address', e.target.value)} />

            <label className="aev__label">{t('evAbout')}</label>
            <textarea className="aev__input aev__textarea" rows={3} value={form.about} onChange={(e) => set('about', e.target.value)} />

            <label className="aev__label">{t('evImage')}</label>
            {form.image && !imgError && (
              <img
                className="aev__preview"
                src={form.image}
                alt=""
                onError={() => setImgError(true)}
              />
            )}
            <input
              className="aev__input"
              placeholder="https://…"
              value={form.image}
              onChange={(e) => { setImgError(false); set('image', e.target.value) }}
            />

            {err && <p className="aev__err">{err}</p>}
            <button className="aev__save" onClick={() => save(false)} disabled={busy}>
              {busy
                ? t('working')
                : datesToAdd().length > 1
                  ? `${t('addEvent')} · ${datesToAdd().length}`
                  : t('addEvent')}
            </button>
            <button
              type="button"
              className="aev__save-another"
              onClick={() => save(true)}
              disabled={busy}
            >
              {t('saveAndAnother')}
            </button>
          </>
        )}
      </div>

      {confirmPast && (
        <ConfirmDialog
          message={t('confirmPastEvent')}
          confirmLabel={t('addAnyway')}
          onConfirm={() => {
            const andAnother = confirmPast === 'another'
            setConfirmPast(null)
            persist(andAnother)
          }}
          onCancel={() => setConfirmPast(null)}
        />
      )}
    </div>
  )
}
