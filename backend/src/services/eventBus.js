import { EventEmitter } from 'node:events';

class WorkflowEventBus extends EventEmitter {
  emitProgress(workflowId, payload) {
    this.emit(`wf:${workflowId}`, { ts: Date.now(), ...payload });
    this.emit('wf:*', { workflowId, ...payload });
  }
  onWorkflow(workflowId, listener) {
    const key = `wf:${workflowId}`;
    this.on(key, listener);
    return () => this.off(key, listener);
  }
}

export const eventBus = new WorkflowEventBus();
eventBus.setMaxListeners(200);
