"use client";

import { Component } from "react";

// React error boundaries must be class components — this is a React requirement,
// not a Loopin-specific choice. Functional components cannot catch render errors.

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // In production you'd send this to an error tracking service
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center
                        min-h-[300px] gap-4 p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-900/20 border border-red-800/40
                          flex items-center justify-center">
            <span className="text-3xl">⚠️</span>
          </div>
          <div>
            <p className="text-white font-bold">Something went wrong</p>
            <p className="text-gray-500 text-sm mt-1">
              {this.state.error?.message || "An unexpected error occurred."}
            </p>
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="btn-secondary text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}