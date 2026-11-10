import { DurableObject } from 'cloudflare:workers';
import app from './worker';
import { durableStore } from './durable-store';

export class SodiRuntime extends DurableObject {
  private objectStore;
  constructor(ctx: DurableObjectState, env: Record<string,unknown>) {
    super(ctx,env);
    this.objectStore=durableStore(ctx.storage);
  }
  async fetch(request: Request) {
    return app.fetch(request,{...this.env,SODI_STORAGE:this.objectStore},{waitUntil:this.ctx.waitUntil.bind(this.ctx),passThroughOnException(){}});
  }
  // Binding-only RPC. There is no public HTTP route to this method in the production entry.
  // The temporary migration entry authenticates the operator before forwarding here.
  async storageTransfer(input: {operation:string;key?:string;body?:string;etag?:string;cursor?:string}) {
    if(input.operation==='list') return this.objectStore.list({cursor:input.cursor,limit:100});
    if(!input.key || !/^(weddings|boda-studio)\//.test(input.key)) throw new Error('Invalid private object key');
    if(input.operation==='get') {
      const item=await this.objectStore.get(input.key);
      return item?{etag:item.etag,text:await item.text()}:null;
    }
    if(input.operation==='put' && typeof input.body==='string') {
      return this.objectStore.put(input.key,input.body,{onlyIf:input.etag?{etagMatches:input.etag}:{etagDoesNotMatch:'*'}});
    }
    throw new Error('Invalid transfer operation');
  }
}
export default {
  async fetch(request: Request, env: {SODI_RUNTIME:DurableObjectNamespace}) {
    return env.SODI_RUNTIME.get(env.SODI_RUNTIME.idFromName('sodi-runtime-v1')).fetch(request);
  },
};
