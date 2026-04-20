import { 
    BaseCheckpointSaver, 
    Checkpoint, 
    CheckpointMetadata, 
    CheckpointTuple, 
    PendingWrite,
    WRITES_IDX_MAP,
    copyCheckpoint, 
    getCheckpointId,
    maxChannelVersion,
    SerializerProtocol,
    TASKS
} from "@langchain/langgraph-checkpoint";
import { RunnableConfig } from "@langchain/core/runnables";
import { db } from "../../services/dbService";

function _generateKey(threadId: string, checkpointNamespace: string, checkpointId: string) {
    return JSON.stringify([threadId, checkpointNamespace, checkpointId]);
}

function _parseKey(key: string) {
    const [threadId, checkpointNamespace, checkpointId] = JSON.parse(key);
    return { threadId, checkpointNamespace, checkpointId };
}

export class DexieSaver extends BaseCheckpointSaver {
    constructor(serde?: SerializerProtocol) {
        super(serde);
    }

    /** @internal */
    async _migratePendingSends(mutableCheckpoint: Checkpoint, threadId: string, checkpointNs: string, parentCheckpointId: string) {
        const deseriablizableCheckpoint = mutableCheckpoint;
        const parentKey = _generateKey(threadId, checkpointNs, parentCheckpointId);
        
        const writes = await db.checkpointWrites.where('outerKey').equals(parentKey).toArray();
        const pendingSends = await Promise.all(
            writes
                .filter(w => w.channel === TASKS)
                .map(async w => await this.serde.loadsTyped("json", w.valueBytes))
        );
        
        deseriablizableCheckpoint.channel_values ??= {};
        deseriablizableCheckpoint.channel_values[TASKS] = pendingSends;
        deseriablizableCheckpoint.channel_versions ??= {};
        deseriablizableCheckpoint.channel_versions[TASKS] = Object.keys(deseriablizableCheckpoint.channel_versions).length > 0
            ? maxChannelVersion(...Object.values(deseriablizableCheckpoint.channel_versions).map(String))
            : this.getNextVersion(undefined);
    }

    async getTuple(config: RunnableConfig): Promise<CheckpointTuple | undefined> {
        const thread_id = config.configurable?.thread_id;
        const checkpoint_ns = config.configurable?.checkpoint_ns ?? "";
        let checkpoint_id = getCheckpointId(config);

        if (checkpoint_id) {
            const key = _generateKey(thread_id, checkpoint_ns, checkpoint_id);
            const saved = await db.checkpoints.get(key);
            if (saved !== undefined) {
                const { checkpointBytes, metadataBytes, parentCheckpointId } = saved;
                const deserializedCheckpoint = await this.serde.loadsTyped("json", checkpointBytes);
                if (deserializedCheckpoint.v < 4 && parentCheckpointId !== undefined) {
                    await this._migratePendingSends(deserializedCheckpoint, thread_id, checkpoint_ns, parentCheckpointId);
                }
                
                const writes = await db.checkpointWrites.where('outerKey').equals(key).toArray();
                const pendingWrites: [string, string, unknown][] = await Promise.all(writes.map(async w => [
                    w.taskId,
                    w.channel,
                    await this.serde.loadsTyped("json", w.valueBytes)
                ]));
                
                const checkpointTuple: CheckpointTuple = {
                    config,
                    checkpoint: deserializedCheckpoint,
                    metadata: await this.serde.loadsTyped("json", metadataBytes),
                    pendingWrites
                };
                
                if (parentCheckpointId !== undefined) {
                    checkpointTuple.parentConfig = {
                        configurable: { thread_id, checkpoint_ns, checkpoint_id: parentCheckpointId }
                    };
                }
                return checkpointTuple;
            }
        } else {
            const checkpoints = await db.checkpoints.where('threadId').equals(thread_id).toArray();
            const nsCheckpoints = checkpoints.filter(c => c.namespace === checkpoint_ns);
            
            if (nsCheckpoints.length > 0) {
                // sort by checkpointId descending (string comparison works for generation dates)
                nsCheckpoints.sort((a, b) => b.checkpointId.localeCompare(a.checkpointId));
                const saved = nsCheckpoints[0];
                checkpoint_id = saved.checkpointId;
                
                const key = _generateKey(thread_id, checkpoint_ns, checkpoint_id);
                const { checkpointBytes, metadataBytes, parentCheckpointId } = saved;
                const deserializedCheckpoint = await this.serde.loadsTyped("json", checkpointBytes);
                
                if (deserializedCheckpoint.v < 4 && parentCheckpointId !== undefined) {
                    await this._migratePendingSends(deserializedCheckpoint, thread_id, checkpoint_ns, parentCheckpointId);
                }
                
                const writes = await db.checkpointWrites.where('outerKey').equals(key).toArray();
                const pendingWrites: [string, string, unknown][] = await Promise.all(writes.map(async w => [
                    w.taskId,
                    w.channel,
                    await this.serde.loadsTyped("json", w.valueBytes)
                ]));
                
                const checkpointTuple: CheckpointTuple = {
                    config: { configurable: { thread_id, checkpoint_id, checkpoint_ns } },
                    checkpoint: deserializedCheckpoint,
                    metadata: await this.serde.loadsTyped("json", metadataBytes),
                    pendingWrites
                };
                
                if (parentCheckpointId !== undefined) {
                    checkpointTuple.parentConfig = {
                        configurable: { thread_id, checkpoint_ns, checkpoint_id: parentCheckpointId }
                    };
                }
                return checkpointTuple;
            }
        }
        return undefined;
    }

    async *list(config: RunnableConfig, options?: import("@langchain/langgraph-checkpoint").CheckpointListOptions): AsyncGenerator<CheckpointTuple> {
        const { before, limit: originalLimit, filter } = options ?? {};
        let limit = originalLimit;
        const threadIds = config.configurable?.thread_id ? [config.configurable?.thread_id] : (await db.checkpoints.toArray()).map((c) => c.threadId);
        // unique thread ids
        const uniqueThreadIds = [...new Set(threadIds)];
        const configCheckpointNamespace = config.configurable?.checkpoint_ns;
        const configCheckpointId = config.configurable?.checkpoint_id;

        for (const threadId of uniqueThreadIds) {
            const checkpointsForThread = await db.checkpoints.where('threadId').equals(threadId).toArray();
            
            const groupedByNs = checkpointsForThread.reduce((acc, c) => {
                if (!acc[c.namespace]) acc[c.namespace] = [];
                acc[c.namespace].push(c);
                return acc;
            }, {} as Record<string, any[]>);

            for (const checkpointNamespace of Object.keys(groupedByNs)) {
                if (configCheckpointNamespace !== undefined && checkpointNamespace !== configCheckpointNamespace) continue;
                
                const checkpoints = groupedByNs[checkpointNamespace];
                checkpoints.sort((a, b) => b.checkpointId.localeCompare(a.checkpointId));
                
                for (const saved of checkpoints) {
                    const checkpointId = saved.checkpointId;
                    if (configCheckpointId && checkpointId !== configCheckpointId) continue;
                    if (before && before.configurable?.checkpoint_id && checkpointId >= before.configurable.checkpoint_id) continue;
                    
                    const metadata = await this.serde.loadsTyped("json", saved.metadataBytes);
                    if (filter && !Object.entries(filter).every(([key, value]) => metadata[key] === value)) continue;
                    
                    if (limit !== undefined) {
                        if (limit <= 0) break;
                        limit -= 1;
                    }
                    
                    const key = _generateKey(threadId, checkpointNamespace, checkpointId);
                    const writesForCheckPoint = await db.checkpointWrites.where('outerKey').equals(key).toArray();
                    const pendingWrites: [string, string, unknown][] = await Promise.all(writesForCheckPoint.map(async w => [
                        w.taskId,
                        w.channel,
                        await this.serde.loadsTyped("json", w.valueBytes)
                    ]));
                    
                    const deserializedCheckpoint = await this.serde.loadsTyped("json", saved.checkpointBytes);
                    if (deserializedCheckpoint.v < 4 && saved.parentCheckpointId !== undefined) {
                        await this._migratePendingSends(deserializedCheckpoint, threadId, checkpointNamespace, saved.parentCheckpointId);
                    }
                    
                    const checkpointTuple: CheckpointTuple = {
                        config: { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: checkpointId } },
                        checkpoint: deserializedCheckpoint,
                        metadata,
                        pendingWrites
                    };
                    
                    if (saved.parentCheckpointId !== undefined) {
                        checkpointTuple.parentConfig = {
                            configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: saved.parentCheckpointId }
                        };
                    }
                    
                    yield checkpointTuple;
                }
            }
        }
    }

    async put(config: RunnableConfig, checkpoint: Checkpoint, metadata: CheckpointMetadata): Promise<RunnableConfig> {
        const preparedCheckpoint = copyCheckpoint(checkpoint);
        const threadId = config.configurable?.thread_id;
        const checkpointNamespace = config.configurable?.checkpoint_ns ?? "";
        
        if (threadId === undefined) throw new Error(`Failed to put checkpoint. The passed RunnableConfig is missing a required "thread_id" field in its "configurable" property.`);
        
        const [[, serializedCheckpoint], [, serializedMetadata]] = await Promise.all([
            this.serde.dumpsTyped(preparedCheckpoint), 
            this.serde.dumpsTyped(metadata)
        ]);

        const key = _generateKey(threadId, checkpointNamespace, checkpoint.id);
        
        await db.checkpoints.put({
            key,
            threadId,
            namespace: checkpointNamespace,
            checkpointId: checkpoint.id,
            checkpointBytes: serializedCheckpoint,
            metadataBytes: serializedMetadata,
            parentCheckpointId: config.configurable?.checkpoint_id
        });

        return { configurable: { thread_id: threadId, checkpoint_ns: checkpointNamespace, checkpoint_id: checkpoint.id } };
    }

    async putWrites(config: RunnableConfig, writes: PendingWrite[], taskId: string): Promise<void> {
        const threadId = config.configurable?.thread_id;
        const checkpointNamespace = config.configurable?.checkpoint_ns;
        const checkpointId = config.configurable?.checkpoint_id;
        
        if (threadId === undefined) throw new Error(`Failed to put writes. The passed RunnableConfig is missing a required "thread_id" field in its "configurable" property`);
        if (checkpointId === undefined) throw new Error(`Failed to put writes. The passed RunnableConfig is missing a required "checkpoint_id" field in its "configurable" property.`);
        
        const outerKey = _generateKey(threadId, checkpointNamespace, checkpointId);
        
        await Promise.all(writes.map(async ([channel, value], idx) => {
            const [, serializedValue] = await this.serde.dumpsTyped(value);
            const innerKey = [taskId, WRITES_IDX_MAP[channel] || idx];
            const innerKeyStr = `${innerKey[0]},${innerKey[1]}`;
            
            const writeKey = `${outerKey}-${innerKeyStr}`;
            
            // if it exists, skip
            if (innerKey[1] >= 0) {
                const existing = await db.checkpointWrites.get(writeKey);
                if (existing) return;
            }
            
            await db.checkpointWrites.put({
                key: writeKey,
                outerKey,
                threadId,
                innerKeyStr,
                taskId,
                channel,
                valueBytes: serializedValue
            });
        }));
    }

    async deleteThread(threadId: string): Promise<void> {
        const checkpoints = await db.checkpoints.where('threadId').equals(threadId).toArray();
        await Promise.all(checkpoints.map(c => db.checkpoints.delete(c.key)));
        
        const writes = await db.checkpointWrites.where('threadId').equals(threadId).toArray();
        await Promise.all(writes.map(w => db.checkpointWrites.delete(w.key)));
    }
}
