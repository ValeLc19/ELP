import { Component } from 'react'
import './ErrorBoundary.css'

// When a render throws, React unmounts the ENTIRE tree — the whole page goes
// blank. This contains the damage to one panel: the header, filters, search and
// everything else keep working.
//
// It only catches errors thrown during render (and in lifecycle methods). It
// does NOT catch errors in event handlers, in async code (fetch, setTimeout,
// promise rejections), or thrown by the boundary itself. Those still reach the
// console as before.
//
// Must be a class: there is no hook equivalent for componentDidCatch.
export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // Loud on purpose. A boundary that quietly swallows errors trades a visible
    // failure for a silent one, which is worse — nobody would ever find out.
    console.error(
      `[ELP] "${this.props.label || 'panel'}" failed to render:`,
      error,
      info?.componentStack
    )
  }

  componentDidUpdate(prevProps) {
    // Recover on its own when the caller moves on (switching view, closing the
    // detail card). Without this a single bad render would leave the panel
    // stuck on the fallback until a full reload.
    if (this.state.error && prevProps.resetKey !== this.props.resetKey) {
      this.setState({ error: null })
    }
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="errbnd" role="alert">
        <p className="errbnd__title">{this.props.title}</p>
        <p className="errbnd__msg">{this.props.message}</p>
        <button
          type="button"
          className="errbnd__retry"
          onClick={() => this.setState({ error: null })}
        >
          {this.props.retryLabel}
        </button>
      </div>
    )
  }
}
