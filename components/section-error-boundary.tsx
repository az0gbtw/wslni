"use client"

import { Component, type ReactNode } from "react"

interface Props {
  children: ReactNode
  name?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class SectionErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error(
      `[SectionErrorBoundary${this.props.name ? ` (${this.props.name})` : ""}]`,
      error,
    )
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          margin: "8px",
          padding: "12px 16px",
          background: "#fee2e2",
          border: "2px solid #ef4444",
          borderRadius: "8px",
          fontFamily: "monospace",
          fontSize: "13px",
          color: "#7f1d1d",
          wordBreak: "break-word",
        }}>
          <strong>Section crash: {this.props.name ?? "unknown"}</strong>
          <br />
          {this.state.error?.message ?? "Unknown error"}
        </div>
      )
    }
    return this.props.children
  }
}
