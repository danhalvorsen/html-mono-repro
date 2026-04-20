import {
  applyActivityToCounters,
  applyActivityToPipeline,
  createInitialDashboardState,
  resetCounters as resetCountersModel,
  resetPipeline,
  setRequestsFromRowCount,
} from './dashboard-state-model.js';

const requestRows = document.getElementById('requestRows');
const httpLogList = document.getElementById('httpLogList');
const activityList = document.getElementById('activityList');
const apiOutput = document.getElementById('apiOutput');
const handlerOutput = document.getElementById('handlerOutput');
const liveActivityStateJson = document.getElementById('liveActivityStateJson');
const streamState = document.getElementById('streamState');
const messageTypeInput = document.getElementById('messageType');
const payloadInput = document.getElementById('payloadInput');
const sendCommandButton = document.getElementById('sendCommand');
const sendQueryButton = document.getElementById('sendQuery');
const refreshHandlersButton = document.getElementById('refreshHandlers');

const statRequests = document.getElementById('statRequests');
const statDispatches = document.getElementById('statDispatches');
const statResponses = document.getElementById('statResponses');
const statErrors = document.getElementById('statErrors');
const pipelineCommandCount = document.getElementById('pipelineCommandCount');
const pipelineQueryCount = document.getElementById('pipelineQueryCount');
const pipelineErrorCount = document.getElementById('pipelineErrorCount');
const pipelineLastStage = document.getElementById('pipelineLastStage');
const pipelineStageList = document.getElementById('pipelineStageList');

const maxRows = 200;
const maxActivity = 250;
const maxHttpLogItems = 250;
const maxPipelineStageItems = 200;

const dashboardState = createInitialDashboardState();

void loadInitialState();
startLiveStream();

sendCommandButton?.addEventListener('click', () => {
  void postCommand();
});

sendQueryButton?.addEventListener('click', () => {
  void postQuery();
});

refreshHandlersButton?.addEventListener('click', () => {
  void loadHandlers();
});

async function loadInitialState() {
  await Promise.all([loadRequestLog(), loadActivityLog(), loadHandlers()]);
}

async function loadRequestLog() {
  const response = await fetch('/api/request-log');
  const data = await response.json();
  const entries = Array.isArray(data?.data?.entries) ? data.data.entries : [];

  requestRows.innerHTML = '';
  if (httpLogList) {
    httpLogList.innerHTML = '';
  }
  for (const entry of entries) {
    prependRequest(entry);
    prependHttpLogOption(formatHttpLogLineFromRequest(entry));
  }
}

async function loadActivityLog() {
  const response = await fetch('/api/activity-log');
  const data = await response.json();
  const entries = Array.isArray(data?.data?.entries) ? data.data.entries : [];

  activityList.innerHTML = '';
  resetCounterView();
  resetPipelineDashboard();

  for (const entry of entries.slice().reverse()) {
    prependActivity(entry);
    if (entry.category === 'response' && entry.scope === 'http') {
      prependHttpLogOption(formatHttpLogLineFromActivity(entry));
    }
  }

  // Requests is sourced from the request-log table to avoid async reset races.
  setRequestsFromRowCount(dashboardState, requestRows.children.length);
  renderCounters();
}

async function loadHandlers() {
  const response = await fetch('/api/cqrs/handlers');
  const data = await response.json();
  handlerOutput.textContent = pretty(data);
}

function startLiveStream() {
  const source = new EventSource('/api/request-stream');

  source.onopen = () => {
    streamState.textContent = 'LIVE';
    streamState.classList.remove('offline');
  };

  source.onerror = () => {
    streamState.textContent = 'OFFLINE';
    streamState.classList.add('offline');
  };

  source.onmessage = (event) => {
    const parsed = JSON.parse(event.data);
    if (parsed.type === 'activity' && parsed.entry) {
      prependActivity(parsed.entry);
      if (parsed.entry.category === 'request') {
        prependRequest(parsed.entry.details ?? parsed.entry);
        prependHttpLogOption(formatHttpLogLineFromRequest(parsed.entry.details ?? parsed.entry));
      }
      if (parsed.entry.category === 'response' && parsed.entry.scope === 'http') {
        prependHttpLogOption(formatHttpLogLineFromActivity(parsed.entry));
      }
    }
  };
}

async function postCommand() {
  const type = (messageTypeInput.value || '').trim() || 'save';
  const payload = parsePayload(payloadInput.value);

  try {
    const response = await fetch(`/api/commands/${encodeURIComponent(type)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    apiOutput.textContent = pretty({ status: response.status, body });
  } finally {
    await refreshDashboardData();
  }
}

async function postQuery() {
  const type = (messageTypeInput.value || '').trim() || 'status';
  const payload = parsePayload(payloadInput.value);

  try {
    const response = await fetch(`/api/queries/${encodeURIComponent(type)}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const body = await response.json();
    apiOutput.textContent = pretty({ status: response.status, body });
  } finally {
    await refreshDashboardData();
  }
}

async function refreshDashboardData() {
  await Promise.all([loadRequestLog(), loadActivityLog()]);
}

function prependRequest(entry) {
  const row = document.createElement('tr');
  row.innerHTML = [
    `<td>${escapeHtml(entry.receivedAt || '')}</td>`,
    `<td>${escapeHtml(entry.method || '')}</td>`,
    `<td>${escapeHtml(entry.path || '')}</td>`,
    `<td>${escapeHtml(String(entry.statusCode ?? ''))}</td>`,
    `<td>${escapeHtml(String(entry.durationMs ?? ''))}</td>`,
    `<td><code>${escapeHtml(pretty(entry.body))}</code></td>`,
  ].join('');

  requestRows.prepend(row);
  while (requestRows.children.length > maxRows) {
    requestRows.removeChild(requestRows.lastElementChild);
  }

  setRequestsFromRowCount(dashboardState, requestRows.children.length);
  renderCounters();
}

function prependHttpLogOption(text) {
  if (!httpLogList) {
    return;
  }

  const option = document.createElement('option');
  option.textContent = text;
  httpLogList.prepend(option);

  while (httpLogList.options.length > maxHttpLogItems) {
    httpLogList.remove(httpLogList.options.length - 1);
  }
}

function formatHttpLogLineFromRequest(entry) {
  const time = String(entry?.receivedAt ?? new Date().toISOString()).slice(11, 19);
  const method = String(entry?.method ?? 'HTTP');
  const route = String(entry?.path ?? '/');
  const status = String(entry?.statusCode ?? '-');
  const duration = String(entry?.durationMs ?? '-');
  return `[${time}] REQUEST ${method} ${route} status=${status} ${duration}ms`;
}

function formatHttpLogLineFromActivity(entry) {
  const time = String(entry?.timestamp ?? new Date().toISOString()).slice(11, 19);
  const summary = String(entry?.summary ?? 'response');
  const status = String(entry?.status ?? '-');
  return `[${time}] RESPONSE ${summary} status=${status}`;
}

function prependActivity(entry) {
  const item = document.createElement('li');
  item.className = `activity-item ${entry.category || 'notification'}`;

  const status = entry.status ? `status:${entry.status}` : 'status:-';
  item.innerHTML = [
    `<div class="activity-meta">`,
    `<span>${escapeHtml(entry.timestamp || '')}</span>`,
    `<span>${escapeHtml(entry.category || '')}</span>`,
    `<span>${escapeHtml(entry.scope || '')}</span>`,
    `<span>${escapeHtml(status)}</span>`,
    `</div>`,
    `<div class="activity-title">${escapeHtml(entry.summary || '')}</div>`,
    `<div class="activity-detail">${escapeHtml(pretty(entry.details))}</div>`,
  ].join('');

  activityList.prepend(item);
  while (activityList.children.length > maxActivity) {
    activityList.removeChild(activityList.lastElementChild);
  }

  updateCounters(entry);
  updatePipelineDashboard(entry);
}

function resetCounterView() {
  resetCountersModel(dashboardState);
  renderCounters();
}

function updateCounters(entry) {
  applyActivityToCounters(dashboardState, entry);

  renderCounters();
}

function renderCounters() {
  statRequests.textContent = String(dashboardState.counters.requests);
  statDispatches.textContent = String(dashboardState.counters.dispatches);
  statResponses.textContent = String(dashboardState.counters.responses);
  statErrors.textContent = String(dashboardState.counters.errors);
  renderStateJson();
}

function resetPipelineDashboard() {
  resetPipeline(dashboardState);

  if (pipelineStageList) {
    pipelineStageList.innerHTML = '';
  }

  renderPipelineDashboard();
}

function updatePipelineDashboard(entry) {
  const previousLength = dashboardState.pipeline.recentStages.length;
  applyActivityToPipeline(dashboardState, entry, maxPipelineStageItems);
  const latestEntry = dashboardState.pipeline.recentStages[0];

  if (dashboardState.pipeline.recentStages.length > previousLength && latestEntry) {
    prependPipelineStageOption(latestEntry);
  }

  if (pipelineLastStage) {
    pipelineLastStage.textContent = dashboardState.pipeline.lastStage;
  }

  renderPipelineDashboard();
}

function renderPipelineDashboard() {
  if (pipelineCommandCount) {
    pipelineCommandCount.textContent = String(dashboardState.pipeline.commandStages);
  }
  if (pipelineQueryCount) {
    pipelineQueryCount.textContent = String(dashboardState.pipeline.queryStages);
  }
  if (pipelineErrorCount) {
    pipelineErrorCount.textContent = String(dashboardState.pipeline.errors);
  }
  if (pipelineLastStage && !pipelineLastStage.textContent) {
    pipelineLastStage.textContent = '-';
  }

  renderStateJson();
}

function prependPipelineStageOption(entry) {
  if (!pipelineStageList) {
    return;
  }

  const time = String(entry.timestamp ?? new Date().toISOString()).slice(11, 19);
  const scope = String(entry.scope || 'pipeline');
  const status = entry.status !== undefined ? ` status=${entry.status}` : '';
  const option = document.createElement('option');
  option.textContent = `[${time}] ${scope} ${entry.stage}${status}`;
  pipelineStageList.prepend(option);

  while (pipelineStageList.options.length > maxPipelineStageItems) {
    pipelineStageList.remove(pipelineStageList.options.length - 1);
  }
}

function parsePayload(raw) {
  const text = String(raw || '').trim();
  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { value: text };
  }
}

function pretty(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderStateJson() {
  if (!liveActivityStateJson) {
    return;
  }

  liveActivityStateJson.textContent = pretty(dashboardState);
}
