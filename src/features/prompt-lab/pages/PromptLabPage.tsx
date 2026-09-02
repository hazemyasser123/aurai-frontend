import React, { useState, useEffect, useMemo } from 'react';
import { WithNavbar } from '@/shared/components/hoc/WithNavbar';
import { Modal, Button, Card, InputField, Select, Textarea, Badge } from '@/shared/components/ui';
import { promptLabApi } from '@/shared/queries/prompt-lab/promptLabApi';
import {
  usePromptLabStatus,
  useSavePromptVersion,
  useActivatePromptVersion,
  useLabProducts,
  useLabBatches,
  useLabAccountSearch,
  useSimulateDraft,
  useSimulateReply,
} from '@/shared/queries/prompt-lab/promptLabHooks';
import { useSeniorityLevels } from '@/features/batches/hooks/useSeniorityLevels';
import type { PromptTabKey, SimulateDraftResponse, SimulateReplyResponse } from '@/features/prompt-lab/types/promptLabTypes';
import toast from 'react-hot-toast';
import { getErrorMessage } from '@/shared/utils/errorHandler';

type SellingMode = 'product' | 'batch';
type CompanyMode = 'existing' | 'manual';
type ThreadItem = { role: 'agent' | 'prospect'; subject: string; body: string };

const PromptLabPageContent: React.FC = () => {
  const { data: status, isLoading: statusLoading, error: statusError } = usePromptLabStatus();
  const saveMutation = useSavePromptVersion();
  const activateMutation = useActivatePromptVersion();

  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [editingVersion, setEditingVersion] = useState<string>('');
  const [activeTab, setActiveTab] = useState<PromptTabKey>('initial_draft');
  const [prompts, setPrompts] = useState<Record<PromptTabKey, string>>({ initial_draft: '', classify_and_reply: '', followup: '' });
  const [saveVersion, setSaveVersion] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [isRedeployOpen, setIsRedeployOpen] = useState(false);
  const [redeployVersion, setRedeployVersion] = useState('');
  const [isPromptLoading, setIsPromptLoading] = useState(false);

  const isVersionLoading = statusLoading || isPromptLoading;

  useEffect(() => {
    if (status && !selectedVersion && status.versions.length > 0) {
      const v = status.active_version || status.versions[0];
      setSelectedVersion(v);
      setEditingVersion(v);
      setRedeployVersion(v);
    }
  }, [status]);

  useEffect(() => {
    if (!editingVersion) return;
    setIsPromptLoading(true);
    promptLabApi
      .getVersion(editingVersion)
      .then((v) => setPrompts(v.prompts))
      .catch(() => {})
      .finally(() => setIsPromptLoading(false));
  }, [editingVersion]);

  const handleLoad = async () => {
    if (!selectedVersion) return toast.error('Select a version to load');
    setIsPromptLoading(true);
    try {
      const v = await promptLabApi.getVersion(selectedVersion);
      setPrompts(v.prompts);
      setEditingVersion(v.version);
      toast.success(`Loaded ${v.version}`);
    } catch (e) {
      toast.error(getErrorMessage(e));
    } finally {
      setIsPromptLoading(false);
    }
  };

  const handleSave = async () => {
    if (!saveVersion.trim()) return toast.error('Version is required');
    if (!prompts.initial_draft.trim() || !prompts.classify_and_reply.trim() || !prompts.followup.trim()) {
      return toast.error('All three prompts must be non-empty');
    }
    try {
      const saved = await saveMutation.mutateAsync({ version: saveVersion.trim(), note: saveNote.trim() || undefined, prompts });
      toast.success(`Saved ${saved.version}`);
      setSelectedVersion(saved.version);
      setEditingVersion(saved.version);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleRedeploy = async () => {
    const v = redeployVersion.trim() || saveVersion.trim() || editingVersion;
    if (!v) return toast.error('Version to activate is required');
    try {
      const activated = await activateMutation.mutateAsync(v);
      toast.success(`Activated ${activated.version} as production`);
      setIsRedeployOpen(false);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  // Simulator
  const { data: products } = useLabProducts();
  const { data: batches } = useLabBatches();
  const [sellingMode, setSellingMode] = useState<SellingMode>('product');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [companyMode, setCompanyMode] = useState<CompanyMode>('existing');
  const [accountQuery, setAccountQuery] = useState('');
  const { data: accountResults } = useLabAccountSearch(accountQuery, 20);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [accountContext, setAccountContext] = useState<Record<string, unknown> | null>(null);
  const [manualContext, setManualContext] = useState('{\n  "name": "Homzmart",\n  "domain": "homzmart.com"\n}');
  const [showJson, setShowJson] = useState(false);
  const [contact, setContact] = useState({ first_name: '', last_name: '', title: '', seniority_level: '' });
  const [contactErrors, setContactErrors] = useState<{ first_name?: string }>({});
  const [thread, setThread] = useState<ThreadItem[]>([]);
  const [prospectInput, setProspectInput] = useState('');

  const simulateDraft = useSimulateDraft();
  const simulateReply = useSimulateReply();

  const { data: seniorityLevelsData } = useSeniorityLevels();
  const FALLBACK_SENIORITIES = ['c_suite', 'founder_owner', 'partner', 'vp', 'head', 'director', 'manager', 'senior', 'lead', 'junior', 'entry', 'intern'] as const;
  const seniorityLevels = seniorityLevelsData && seniorityLevelsData.length > 0 ? seniorityLevelsData : (FALLBACK_SENIORITIES as unknown as string[]);
  const SENIORITY_LABELS: Record<string, string> = {
    c_suite: 'C-Suite',
    founder_owner: 'Founder / Owner',
    partner: 'Partner',
    vp: 'VP',
    head: 'Head',
    director: 'Director',
    manager: 'Manager',
    senior: 'Senior',
    lead: 'Lead',
    junior: 'Junior',
    entry: 'Entry Level',
    intern: 'Intern',
  };
  const getSeniorityLabel = (v: string) => SENIORITY_LABELS[v] ?? v.split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const selectedProduct = useMemo(() => products?.find((p) => p.id === selectedProductId) ?? null, [products, selectedProductId]);
  const selectedBatch = useMemo(() => batches?.find((b) => b.id === selectedBatchId) ?? null, [batches, selectedBatchId]);

  const productAnalysisId = useMemo(() => {
    if (sellingMode === 'product') return selectedProduct?.analysis_id ?? null;
    return selectedBatch?.analysis_id ?? null;
  }, [sellingMode, selectedProduct, selectedBatch]);

  const handleSelectAccount = async (accId: string) => {
    setSelectedAccountId(accId);
    try {
      const ctx = await promptLabApi.getAccountContext(accId);
      setAccountContext(ctx as unknown as Record<string, unknown>);
      const first = (ctx.contacts && ctx.contacts[0]) || null;
      if (first) {
        setContact({
          first_name: first.first_name || '',
          last_name: first.last_name || '',
          title: first.title || '',
          seniority_level: first.seniority_level || '',
        });
        if (first.first_name) setContactErrors({});
      }
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const companyContextForSimulate = useMemo(() => {
    if (companyMode === 'manual') {
      try {
        return JSON.parse(manualContext || '{}');
      } catch {
        return {};
      }
    }
    if (accountContext) return accountContext as Record<string, unknown>;
    return undefined;
  }, [companyMode, manualContext, accountContext]);

  const threadHistoryString = useMemo(() => thread.map((m) => `${m.role}: ${m.subject}\n${m.body}`).join('\n\n'), [thread]);

  const handleGenerateDraft = async () => {
    if (!productAnalysisId) return toast.error('Select a product or batch with an analysis');
    if (!contact.first_name.trim()) {
      setContactErrors({ first_name: 'First name is required' });
      toast.error('Contact first name is required');
      return;
    }
    setContactErrors({});
    try {
      const res: SimulateDraftResponse = await simulateDraft.mutateAsync({
        product_analysis_id: productAnalysisId,
        contact: {
          first_name: contact.first_name.trim(),
          last_name: contact.last_name.trim() || undefined,
          title: contact.title.trim() || undefined,
          seniority_level: contact.seniority_level.trim() || undefined,
        },
        company_context: companyContextForSimulate,
        system_prompt: prompts.initial_draft || undefined,
      });
      setThread((prev) => [...prev, { role: 'agent', subject: res.subject, body: res.body }]);
      toast.success('Draft generated');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleSendFollowup = async () => {
    if (!productAnalysisId) return toast.error('Select a product or batch with an analysis');
    if (thread.length === 0) return toast.error('Generate a draft first');
    try {
      const res: SimulateReplyResponse = await simulateReply.mutateAsync({
        product_analysis_id: productAnalysisId,
        thread_history: threadHistoryString,
        system_prompt: prompts.followup || undefined,
      });
      setThread((prev) => [...prev, { role: 'agent', subject: res.subject, body: res.body }]);
      toast.success('Follow-up generated');
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleProspectReply = async () => {
    if (!prospectInput.trim()) return;
    if (!productAnalysisId) return toast.error('Select a product or batch with an analysis');
    const prospectText = prospectInput.trim();
    setThread((prev) => [...prev, { role: 'prospect', subject: 'Re: thread', body: prospectText }]);
    setProspectInput('');
    try {
      const res: SimulateReplyResponse = await simulateReply.mutateAsync({
        product_analysis_id: productAnalysisId,
        thread_history: `${threadHistoryString}\n\nprospect: ${prospectText}`,
        system_prompt: prompts.classify_and_reply || undefined,
      });
      setThread((prev) => [...prev, { role: 'agent', subject: res.subject, body: res.body }]);
    } catch (e) {
      toast.error(getErrorMessage(e));
    }
  };

  const handleResetThread = () => setThread([]);

  if (statusError) {
    return (
      <div className="w-full max-w-[1120px] mx-auto p-4 sm:p-6">
        <Card variant="elevated" className="text-center">
          <p className="font-sans font-semibold text-sm text-danger">{getErrorMessage(statusError)}</p>
          <p className="font-sans text-xs text-fg-body mt-1">Admin privileges required. Use admin / admin123 token.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1120px] mx-auto pb-8 sm:pb-12 flex flex-col gap-6">
      {/* Header — matches Products/Batches headers */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1 min-w-0">
          <h2 className="font-sans font-bold text-xl sm:text-2xl tracking-tight text-fg">Prompt Lab</h2>
          <p className="font-sans font-medium text-sm text-fg-body">Edit sales system prompts, simulate threads, then save a version. Redeploy a saved pack to make it live for production outreach.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="success">Production active: {statusLoading ? '…' : status?.active_version ?? '—'}</Badge>
          <Badge variant="info">Editing: {editingVersion || '—'}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 xl:gap-6 items-start">
        {/* Left: Version Management */}
        <Card variant="elevated" className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 min-w-0">
              <Select
                label="Version"
                id="prompt-lab-version"
                value={selectedVersion}
                onChange={(e) => setSelectedVersion(e.target.value)}
                disabled={isVersionLoading}
              >
                {status?.versions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </Select>
            </div>
            <Button variant="outline" onClick={handleLoad} isLoading={isVersionLoading} disabled={isVersionLoading} className="w-full sm:w-auto">
              Load
            </Button>
          </div>

          <div className="flex gap-1 border-b border-border -mx-4 sm:-mx-6 px-4 sm:px-6">
            {(['initial_draft', 'classify_and_reply', 'followup'] as PromptTabKey[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                disabled={isVersionLoading}
                className={`px-3 py-2.5 text-xs font-semibold tracking-tight transition-colors border-b-2 -mb-px whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-fg-body hover:text-fg'}`}
              >
                {tab === 'initial_draft' ? 'Initial draft' : tab === 'classify_and_reply' ? 'Classify & reply' : 'Follow-up'}
              </button>
            ))}
          </div>

          <Textarea
            label={activeTab === 'initial_draft' ? 'Initial Draft Prompt' : activeTab === 'classify_and_reply' ? 'Classify & Reply Prompt' : 'Follow-up Prompt'}
            id={`prompt-${activeTab}`}
            value={prompts[activeTab] || ''}
            onChange={(e) => setPrompts((prev) => ({ ...prev, [activeTab]: e.target.value }))}
            placeholder={isVersionLoading ? 'Loading version…' : activeTab === 'initial_draft' ? 'You are an AI sales agent...' : activeTab === 'classify_and_reply' ? 'You are an AI sales agent handling an inbound reply...' : 'You are an AI sales agent writing a follow-up...'}
            rows={14}
            className="min-h-[22rem] font-mono text-sm leading-relaxed"
            hint={isVersionLoading ? 'Loading selected version…' : 'System prompt sent as system_prompt to the simulator'}
            disabled={isVersionLoading}
          />

          <div className="rounded-xl border border-border bg-bg-page p-4 flex flex-col gap-3">
            <div>
              <h3 className="font-sans font-semibold text-xs tracking-tight text-fg">Save as version</h3>
              <p className="font-sans text-xs text-fg-body mt-1">Saving writes a new pack and does not change production. Redeploy a saved version to make it live for all outreach.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <InputField id="save-version" label="Version" placeholder="e.g. v2" value={saveVersion} onChange={(e) => setSaveVersion(e.target.value)} disabled={isVersionLoading} />
              <div className="sm:col-span-2">
                <InputField id="save-note" label="Note" placeholder="Optional note" value={saveNote} onChange={(e) => setSaveNote(e.target.value)} disabled={isVersionLoading} />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="primary" onClick={handleSave} isLoading={saveMutation.isPending} disabled={isVersionLoading || saveMutation.isPending} className="w-full sm:w-auto">
                Save version
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setRedeployVersion(saveVersion.trim() || editingVersion || selectedVersion);
                  setIsRedeployOpen(true);
                }}
                disabled={isVersionLoading || activateMutation.isPending}
                className="w-full sm:w-auto"
              >
                Redeploy
              </Button>
            </div>
          </div>
        </Card>

        {/* Right: Thread Simulator */}
        <Card variant="elevated" className="flex flex-col gap-5 p-4 sm:p-6">
          <div className="flex flex-col gap-1">
            <h3 className="font-sans font-semibold text-sm tracking-tight text-fg">Thread simulator</h3>
            <p className="font-sans text-xs text-fg-body">Test prompts against a real analysis + account context without touching a batch.</p>
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-sans font-semibold text-xs tracking-tight text-primary">Selling from</span>
            <div className="flex gap-1.5 p-1 rounded-lg bg-bg-page border border-border w-fit">
              <button
                type="button"
                onClick={() => setSellingMode('product')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${sellingMode === 'product' ? 'bg-primary text-white shadow-sm' : 'text-fg-body hover:text-fg hover:bg-bg-muted/50'}`}
              >
                Product
              </button>
              <button
                type="button"
                onClick={() => setSellingMode('batch')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${sellingMode === 'batch' ? 'bg-primary text-white shadow-sm' : 'text-fg-body hover:text-fg hover:bg-bg-muted/50'}`}
              >
                Batch
              </button>
            </div>
            {sellingMode === 'product' ? (
              <Select id="sim-product" label="Product" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)}>
                <option value="">Select product…</option>
                {products?.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            ) : (
              <Select id="sim-batch" label="Batch" value={selectedBatchId} onChange={(e) => setSelectedBatchId(e.target.value)}>
                <option value="">Select batch…</option>
                {batches?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            )}
            {(() => {
              const summary = sellingMode === 'product' ? selectedProduct?.executive_summary : selectedBatch?.executive_summary;
              const hasSelection = sellingMode === 'product' ? !!selectedProductId : !!selectedBatchId;
              if (!hasSelection) {
                return <span className="font-sans text-xs text-fg-muted">Pick a product/batch to see its executive summary</span>;
              }
              if (summary && summary.trim()) {
                return (
                  <div className="rounded-lg border border-border bg-bg-page p-3">
                    <span className="font-sans font-semibold text-xs tracking-tight text-fg">Executive summary</span>
                    <p className="font-sans text-xs leading-5 text-fg-body mt-1.5 whitespace-pre-wrap break-words">{summary}</p>
                    {!productAnalysisId && <span className="font-sans text-[11px] text-warning mt-2 block">No analysis linked — simulation requires an analysis. Pick another {sellingMode}.</span>}
                  </div>
                );
              }
              return <span className="font-sans text-xs text-warning">No executive summary available for this {sellingMode} — it has no analysis yet</span>;
            })()}
          </div>

          <div className="flex flex-col gap-3">
            <span className="font-sans font-semibold text-xs tracking-tight text-primary">Company</span>
            <div className="flex gap-1.5 p-1 rounded-lg bg-bg-page border border-border w-fit">
              <button
                type="button"
                onClick={() => setCompanyMode('existing')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${companyMode === 'existing' ? 'bg-primary text-white shadow-sm' : 'text-fg-body hover:text-fg hover:bg-bg-muted/50'}`}
              >
                Existing account
              </button>
              <button
                type="button"
                onClick={() => setCompanyMode('manual')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${companyMode === 'manual' ? 'bg-primary text-white shadow-sm' : 'text-fg-body hover:text-fg hover:bg-bg-muted/50'}`}
              >
                Manual
              </button>
            </div>
            {companyMode === 'existing' ? (
              <div className="relative">
                <InputField
                  id="account-search"
                  label="Search accounts"
                  placeholder="Search by name or domain…"
                  value={accountQuery}
                  onChange={(e) => setAccountQuery(e.target.value)}
                  hint={selectedAccountId && accountContext ? `Selected: ${(accountContext as unknown as { name: string }).name} — ${(accountContext as unknown as { status: string }).status}` : undefined}
                />
                {accountQuery && accountResults && accountResults.length > 0 && (
                  <div className="absolute z-10 mt-1 w-full rounded-lg bg-bg-card border border-border shadow-card max-h-48 overflow-auto">
                    {accountResults.map((acc) => (
                      <button
                        key={acc.id}
                        onClick={() => {
                          handleSelectAccount(acc.id);
                          setAccountQuery(`${acc.name} (${acc.domain})`);
                        }}
                        className={`w-full text-left px-3 py-2.5 hover:bg-bg-muted/50 transition-colors ${selectedAccountId === acc.id ? 'bg-bg-purple-soft text-primary' : 'text-fg'}`}
                      >
                        <div className="font-sans font-medium text-sm">{acc.name}</div>
                        <div className="font-sans text-xs text-fg-body">
                          {acc.domain} — {acc.enrichment_status}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Textarea
                id="manual-context"
                label="Company context JSON"
                value={manualContext}
                onChange={(e) => setManualContext(e.target.value)}
                rows={4}
                className="font-mono text-xs"
                hint="Parsed as company_context for the draft simulator"
              />
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <InputField
              id="contact-first"
              label="First name *"
              value={contact.first_name}
              onChange={(e) => {
                setContact((prev) => ({ ...prev, first_name: e.target.value }));
                if (contactErrors.first_name && e.target.value.trim()) setContactErrors({});
              }}
              placeholder="Ibrahim"
              error={contactErrors.first_name}
            />
            <InputField id="contact-last" label="Last name" value={contact.last_name} onChange={(e) => setContact((prev) => ({ ...prev, last_name: e.target.value }))} placeholder="Mohamed" />
            <InputField id="contact-title" label="Title" value={contact.title} onChange={(e) => setContact((prev) => ({ ...prev, title: e.target.value }))} placeholder="COO & Co-Founder" />
            <Select
              id="contact-seniority"
              label="Seniority"
              value={contact.seniority_level}
              onChange={(e) => setContact((prev) => ({ ...prev, seniority_level: e.target.value }))}
            >
              <option value="">Any seniority</option>
              {seniorityLevels.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {getSeniorityLabel(lvl)}
                </option>
              ))}
            </Select>
          </div>

          <button type="button" onClick={() => setShowJson((v) => !v)} className="self-start font-sans font-semibold text-xs text-primary hover:text-primary-dark transition-colors">
            {showJson ? 'Hide JSON' : 'Edit JSON'}
          </button>
          {showJson && (
            <pre className="rounded-lg bg-bg-page border border-border p-3 text-xs font-mono text-fg-body overflow-auto max-h-48 whitespace-pre-wrap break-words">
              {JSON.stringify({ product_analysis_id: productAnalysisId, contact, company_context: companyContextForSimulate, threadHistory: threadHistoryString.slice(0, 800) }, null, 2)}
            </pre>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            <Button variant="primary" onClick={handleGenerateDraft} isLoading={simulateDraft.isPending} disabled={simulateDraft.isPending || !productAnalysisId} className="w-full sm:w-auto">
              Generate initial draft
            </Button>
            <Button variant="outline" onClick={handleSendFollowup} disabled={simulateReply.isPending || thread.length === 0} className="w-full sm:w-auto">
              Send follow-up
            </Button>
            <Button variant="ghost" onClick={handleResetThread} className="w-full sm:w-auto">
              Reset thread
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-bg-page max-h-[520px] overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
            {thread.length === 0 ? (
              <p className="font-sans text-xs text-fg-body text-center py-8">No messages yet. Generate a draft to start the thread.</p>
            ) : (
              thread.map((m, idx) => (
                <div key={idx} className={`rounded-xl p-3 sm:p-4 border ${m.role === 'agent' ? 'bg-bg-card border-border' : 'bg-bg-sidebar border-border'}`}>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <Badge variant={m.role === 'agent' ? 'info' : 'warning'}>{m.role === 'agent' ? 'Agent' : 'Prospect'}</Badge>
                    <span className="font-sans text-xs text-fg-muted truncate max-w-[60%]">{m.subject}</span>
                  </div>
                  <div className="font-sans text-sm leading-5 text-fg whitespace-pre-wrap break-words">{m.body}</div>
                </div>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <div className="flex-1 min-w-0">
              <input
                value={prospectInput}
                onChange={(e) => setProspectInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleProspectReply();
                  }
                }}
                placeholder="Type as the prospect… (Enter to send, Shift+Enter for new line)"
                className="w-full h-11 px-4 bg-bg-input border border-border rounded-lg font-sans text-sm text-fg placeholder:text-fg-muted outline-none focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(127,34,254,0.12)] transition-[border-color,box-shadow]"
              />
            </div>
            <Button variant="primary" onClick={handleProspectReply} isLoading={simulateReply.isPending} disabled={simulateReply.isPending || !prospectInput.trim()} className="shrink-0 h-11">
              Reply
            </Button>
          </div>
        </Card>
      </div>

      <Modal isOpen={isRedeployOpen} onClose={() => setIsRedeployOpen(false)} title="Redeploy prompt pack">
        <div className="flex flex-col gap-4">
          <p className="font-sans text-sm text-fg-body">
            Activate <span className="font-semibold text-fg">{redeployVersion || 'selected version'}</span> as the live production prompts? This will affect all new outreach.
          </p>
          <InputField id="redeploy-version" label="Version to activate" value={redeployVersion} onChange={(e) => setRedeployVersion(e.target.value)} placeholder="e.g. 1.1" />
          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="ghost" onClick={() => setIsRedeployOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRedeploy} isLoading={activateMutation.isPending} disabled={activateMutation.isPending} className="w-full sm:w-auto">
              Redeploy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export const PromptLabPage = WithNavbar(PromptLabPageContent);
export default PromptLabPage;
