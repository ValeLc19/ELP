import { useState } from 'react'
import { extractLink, addUserEvent } from '../lib/userEvents.js'
import { ocrImage, parseEventText } from '../lib/ocr.js'
import { useLang } from '../lib/i18n.js'
import { CATEGORY_ORDER } from '../data/categories.js'
import { XIcon } from './icons.jsx'
import './AddEventModal.css'

// Paste a link -> best-effort autofill -> review/edit -> save as a private,
// per-user event tagged to one of the user's businesses.
export default function AddEventModal({ businesses, onClose }) {
  const { t } = useLang()
  const [bizId, setBizId] = useState(businesses[0]?.id || '')
  const [url, setUrl] = useState('')
  const [reading, setReading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [added, setAdded] = useState(false)
  const [autofillMsg, setAutofillMsg] = useState('')
  const [imgError, setImgError] = useState(false)
  const [form, setForm] = useState({
    title: '', category: 'Markets', dateISO: '', time: '',
    price: '', address: '', image: '', about: '',
  })
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

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
    if (d.imageData || d.about) {
      if (d.imageData) setAutofillMsg(t('readingFlyer'))
      const ocrText = d.imageData ? await ocrImage(d.imageData) : ''
      const parsed = parseEventText([ocrText, d.about].filter(Boolean).join('\n'))
      for (const k of ['dateISO', 'time', 'price', 'address']) {
        if (!merged[k] && parsed[k]) merged[k] = parsed[k]
      }
    }

    setReading(false)
    const found = ['title', 'dateISO', 'time', 'price', 'address', 'image', 'about']
      .filter((k) => merged[k]).length
    setAutofillMsg(found > 0 ? t('autofillFilled') : t('autofillEmpty'))
    if (merged.image) setImgError(false)
    setForm((f) => ({
      ...f,
      title: merged.title || f.title,
      dateISO: merged.dateISO || f.dateISO,
      time: merged.time || f.time,
      price: merged.price || f.price,
      address: merged.address || f.address,
      image: merged.image || f.image,
      about: merged.about || f.about,
    }))
  }

  const save = async () => {
    if (busy) return
    if (!form.title.trim() || !form.dateISO) {
      setErr(t('errMissing'))
      return
    }
    const biz = businesses.find((b) => b.id === bizId)
    setBusy(true)
    setErr('')
    const res = await addUserEvent({
      businessId: biz?.id || null,
      businessName: biz?.name || null,
      title: form.title.trim(),
      category: form.category,
      image: form.image || null,
      address: form.address || null,
      dateISO: form.dateISO,
      time: form.time || null,
      price: form.price || null,
      about: form.about || null,
      sourceUrl: url.trim() || null,
    })
    setBusy(false)
    if (!res.ok) {
      setErr(res.error)
      return
    }
    setAdded(true)
    setTimeout(onClose, 900)
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
        ) : !businesses.length ? (
          <p className="aev__empty">{t('addBusinessFirst')}</p>
        ) : (
          <>
            <h2 className="aev__title">{t('addEventTitle')}</h2>
            <p className="aev__intro">{t('addEventIntro')}</p>

            <label className="aev__label">{t('forBusiness')}</label>
            <select className="aev__input" value={bizId} onChange={(e) => setBizId(e.target.value)}>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>

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

            <div className="aev__step">
              <span className="aev__step-num">2</span>
              <h3 className="aev__step-title">{t('reviewEdit')}</h3>
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

            <div className="aev__grid">
              <div>
                <label className="aev__label">{t('category')}</label>
                <select className="aev__input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                  {CATEGORY_ORDER.map((c) => (
                    <option key={c} value={c}>{t(`cat_${c}`)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="aev__label">{t('evPrice')}</label>
                <input className="aev__input" placeholder="Free" value={form.price} onChange={(e) => set('price', e.target.value)} />
              </div>
            </div>

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
            <button className="aev__save" onClick={save} disabled={busy}>
              {busy ? t('working') : t('addEvent')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
