import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props){ super(props); this.state = { error:null }; }
  static getDerivedStateFromError(error){ return { error }; }
  componentDidCatch(error, info){ console.error('UI error:', error, info); }

  render(){
    if(this.state.error){
      return (
        <div className="page flex min-h-screen items-center justify-center p-4 text-white sm:p-6">
          <div className="surface w-full max-w-3xl rounded-2xl border-rose-400/35 bg-rose-500/10 p-6 shadow-soft sm:p-8">
            <div className="mb-4 h-1 w-16 rounded-full bg-rose-300/70" />
            <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
            <p className="mt-2 text-sm leading-6 text-rose-100">
              The portal hit an unexpected UI error. Technical details are shown below and the console has the full trace.
            </p>
            <pre className="mt-5 max-h-72 overflow-auto rounded-xl border border-white/10 bg-black/30 p-4 text-sm text-rose-50">{String(this.state.error)}</pre>
            <p className="mt-3 text-sm text-slate-300">Check the console for details.</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
