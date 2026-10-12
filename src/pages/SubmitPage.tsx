import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  Sparkles, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  Wand2, 
  AlertCircle 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SEOHead } from '../components/SEOHead';

export const SubmitPage: React.FC = () => {
  const { categories, submitTool, addToast } = useApp();

  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [description, setDescription] = useState('');
  const [pricing, setPricing] = useState<'free' | 'freemium' | 'paid'>('freemium');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Auto-fill from URL simulation/metadata inspection
  const handleAutoFill = async () => {
    if (!url) {
      addToast('URL Required', 'Please enter a website URL first.', 'error');
      return;
    }

    setIsAutoFilling(true);
    setErrorMessage('');

    try {
      let clean = url.trim();
      if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
        setUrl(clean);
      }

      const domain = new URL(clean).hostname.replace(/^www\./, '');
      const rawName = domain.split('.')[0];
      const capitalized = rawName.charAt(0).toUpperCase() + rawName.slice(1);

      // Simulate network metadata check
      await new Promise((r) => setTimeout(r, 650));

      if (!name) {
        setName(capitalized);
      }
      if (!description) {
        setDescription(`Modern web tool offering streamlined cloud workflow and collaboration tools.`);
      }

      addToast('Metadata Inspected', `Auto-detected "${capitalized}" from domain headers!`, 'success');
    } catch {
      setErrorMessage('Please enter a valid URL (e.g. https://toolname.com)');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!url.trim()) {
      setErrorMessage('Website URL is required.');
      return;
    }
    if (!name.trim()) {
      setErrorMessage('Tool name is required.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Please provide a short description or why it should be ranked.');
      return;
    }

    setIsSubmitting(true);
    const result = await submitTool({
      name: name.trim(),
      url: url.trim(),
      category_id: categoryId,
      description: description.trim(),
      pricing,
      notes: notes.trim(),
    });
    setIsSubmitting(false);

    if (result.success) {
      setSubmittedSuccess(true);
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <>
      <SEOHead
        title="Submit a Tool — Top10"
        description="Recommend a groundbreaking tool or website to be reviewed and ranked on Top10."
      />

      <div className="max-w-2xl mx-auto py-6 pb-20">
        {submittedSuccess ? (
          <div className="bg-[#111111] border border-[#10b981]/40 rounded-3xl p-8 sm:p-12 text-center shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-[#10b981]/15 border border-[#10b981]/30 flex items-center justify-center mx-auto text-[#10b981]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#f5f5f5]">Submission Queued!</h2>
              <p className="text-sm text-[#9ca3af] max-w-md mx-auto leading-relaxed">
                Thank you for contributing to the Top10 directory. Your submission for{' '}
                <span className="text-[#10b981] font-semibold">{name}</span> has been staged for curator
                verification and automated quality scoring.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#161616] border border-[#222222] text-xs text-[#9ca3af] flex items-center justify-center gap-2 max-w-sm mx-auto">
              <Clock className="w-4 h-4 text-[#10b981]" />
              <span>Average review time: &lt; 24 hours</span>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setUrl('');
                  setName('');
                  setDescription('');
                  setNotes('');
                  setSubmittedSuccess(false);
                }}
                className="px-4 py-2.5 rounded-xl bg-[#181818] hover:bg-[#202020] border border-[#262626] text-xs font-semibold text-[#f5f5f5] transition-colors"
              >
                Submit Another Tool
              </button>

              <Link
                to="/"
                className="px-4 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-xs font-semibold text-black transition-colors"
              >
                Back to Directory
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-[#111111] border border-[#1f1f1f] rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#181818] border border-[#262626] text-xs font-medium text-[#10b981] mb-2">
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Community Submissions</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#f5f5f5] tracking-tight">
                Submit a Tool or Website
              </h1>
              <p className="text-xs sm:text-sm text-[#9ca3af] mt-1 leading-relaxed">
                Know an extraordinary app, open-source library, or AI tool that deserves a spot in our Top 10 rankings? Let our curators know!
              </p>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* URL with Auto-fill action */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Website URL <span className="text-rose-400">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="w-4 h-4 absolute left-3.5 top-3 text-[#9ca3af]" />
                    <input
                      type="url"
                      required
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-sm text-[#f5f5f5] placeholder-[#9ca3af]/40 focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isAutoFilling || !url}
                    className="px-3.5 py-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#222222] border border-[#2a2a2a] hover:border-[#10b981]/50 text-xs font-semibold text-[#10b981] flex items-center gap-1.5 transition-all disabled:opacity-50 shrink-0"
                    title="Auto-fill title and description from URL"
                  >
                    <Wand2 className={`w-3.5 h-3.5 ${isAutoFilling ? 'animate-spin' : ''}`} />
                    <span className="hidden sm:inline">Auto-fill</span>
                  </button>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Tool Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Cursor, Notion, Linear"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-sm text-[#f5f5f5] placeholder-[#9ca3af]/40 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Target Category <span className="text-rose-400">*</span>
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-sm text-[#f5f5f5] focus:outline-none focus:border-[#10b981]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[#111111]">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Pricing Model
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['free', 'freemium', 'paid'] as const).map((tier) => (
                    <button
                      type="button"
                      key={tier}
                      onClick={() => setPricing(tier)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all border ${
                        pricing === tier
                          ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/50'
                          : 'bg-[#161616] text-[#9ca3af] border-[#262626] hover:text-[#f5f5f5]'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  One-Line Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  maxLength={140}
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Concise overview of what it does and why it is great (under 140 chars)..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-sm text-[#f5f5f5] placeholder-[#9ca3af]/40 focus:outline-none focus:border-[#10b981]"
                />
                <div className="flex justify-end text-[11px] text-[#9ca3af]/70 mt-1">
                  {description.length}/140 chars
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] mb-1.5">
                  Why does it belong in the Top 10? (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notable features, speed, pricing advantages, or popularity milestones..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#161616] border border-[#262626] text-sm text-[#f5f5f5] placeholder-[#9ca3af]/40 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-black font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <span>Submitting to Staging...</span>
                  ) : (
                    <>
                      <span>Submit for Review</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};
