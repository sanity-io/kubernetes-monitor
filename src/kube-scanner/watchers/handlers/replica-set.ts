import { V1ReplicaSet } from '@kubernetes/client-node';
import * as uuidv4 from 'uuid/v4';
import { WatchEventType } from '../types';
import { deleteWorkload } from './index';

export async function replicaSetWatchHandler(eventType: string, replicaSet: V1ReplicaSet) {
  if (eventType !== WatchEventType.Deleted) {
    return;
  }

  const logId = uuidv4().substring(0, 8);

  if (!replicaSet.metadata || !replicaSet.spec || !replicaSet.spec.template ||
      !replicaSet.spec.template.metadata || !replicaSet.spec.template.spec) {
    // TODO(ivanstanev): possibly log this. It shouldn't happen but we should track it!
    return;
  }

  await deleteWorkload({
    kind: 'ReplicaSet',
    objectMeta: replicaSet.metadata,
    specMeta: replicaSet.spec.template.metadata,
    containers: replicaSet.spec.template.spec.containers,
    ownerRefs: replicaSet.metadata.ownerReferences,
  }, logId);
}