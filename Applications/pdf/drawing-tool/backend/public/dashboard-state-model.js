export function createInitialDashboardState() {
  return {
    counters: {
      requests: 0,
      dispatches: 0,
      responses: 0,
      errors: 0,
    },
    pipeline: {
      commandStages: 0,
      queryStages: 0,
      errors: 0,
      lastStage: '-',
      recentStages: [],
    },
  };
}

export function resetCounters(state) {
  state.counters.requests = 0;
  state.counters.dispatches = 0;
  state.counters.responses = 0;
  state.counters.errors = 0;
}

export function setRequestsFromRowCount(state, rowCount) {
  state.counters.requests = Number.isFinite(rowCount) ? Math.max(0, Number(rowCount)) : 0;
}

export function applyActivityToCounters(state, entry) {
  const category = String(entry?.category ?? '').trim().toLowerCase();
  const scope = String(entry?.scope ?? '').trim().toLowerCase();
  const stage = String(entry?.details?.payload?.stage ?? '').trim().toLowerCase();

  const isDispatchEvent =
    category === 'dispatch'
    || (category === 'response' && (scope === 'command' || scope === 'query'))
    || (category === 'notification' && stage.includes('dispatcher.invoke'));

  if (isDispatchEvent) {
    state.counters.dispatches += 1;
  }

  if (category === 'response') {
    state.counters.responses += 1;
  }

  if (entry?.status && Number(entry.status) >= 400) {
    state.counters.errors += 1;
  }

  if (category === 'notification') {
    const payload = entry?.details?.payload;
    if (payload && payload.ok === false) {
      state.counters.errors += 1;
    }
  }
}

export function resetPipeline(state) {
  state.pipeline.commandStages = 0;
  state.pipeline.queryStages = 0;
  state.pipeline.errors = 0;
  state.pipeline.lastStage = '-';
  state.pipeline.recentStages = [];
}

export function applyActivityToPipeline(state, entry, maxPipelineStageItems) {
  const category = String(entry?.category ?? '').trim().toLowerCase();
  if (category !== 'notification') {
    return;
  }

  const payload = entry?.details?.payload;
  const scope = String(payload?.scope ?? entry?.scope ?? '').trim().toLowerCase();
  const stage = String(payload?.stage ?? '').trim();
  if (!stage) {
    return;
  }

  if (scope === 'command') {
    state.pipeline.commandStages += 1;
  } else if (scope === 'query') {
    state.pipeline.queryStages += 1;
  }

  const statusNumber = Number(payload?.status ?? entry?.status ?? 0);
  if (statusNumber >= 400 || payload?.ok === false) {
    state.pipeline.errors += 1;
  }

  const stageEntry = {
    scope: scope || 'pipeline',
    stage,
    status: payload?.status ?? entry?.status,
    timestamp: entry?.timestamp,
  };

  state.pipeline.lastStage = `${stageEntry.scope}: ${stageEntry.stage}`;
  state.pipeline.recentStages.unshift(stageEntry);

  while (state.pipeline.recentStages.length > maxPipelineStageItems) {
    state.pipeline.recentStages.pop();
  }
}
