import { Annotation, TimeStampedPoint } from "@replayio/protocol";
import { createSingleEntryCache } from "suspense";

import { ThreadFront } from "protocol/thread";
import { compareNumericStrings } from "protocol/utils";
import { ReplayClientInterface } from "shared/client/types";
import { InteractionEventKind } from "ui/actions/eventListeners/constants";
import { EventListenerWithFunctionInfo } from "ui/actions/eventListeners/eventListenerUtils";
import type { ReduxActionAnnotation } from "ui/components/SecondaryToolbox/redux-devtools/redux-annotations";
import { processReduxAnnotations } from "ui/components/SecondaryToolbox/redux-devtools/redux-annotations";

export interface ParsedReactDevToolsAnnotation extends TimeStampedPoint {
  contents: {
    event: "operations";
    operations: number[];
  };
}

export interface JumpToCodeAnnotationContents {
  eventKind: InteractionEventKind;
  eventListener: EventListenerWithFunctionInfo;
  listenerPoint: TimeStampedPoint;
  nextEventPoint: TimeStampedPoint;
}

export interface ParsedJumpToCodeAnnotation extends TimeStampedPoint {
  eventKind: InteractionEventKind;
  eventListener: EventListenerWithFunctionInfo;
  listenerPoint: TimeStampedPoint;
  nextEventPoint: TimeStampedPoint;
}

export const REACT_ANNOTATIONS_KIND = "react-devtools-bridge";
export const REDUX_ANNOTATIONS_KIND = "redux-devtools-data";
export const JUMP_ANNOTATION_KIND = "event-listeners-jump-location";

export const annotationKindsCache = createSingleEntryCache<
  [replayClient: ReplayClientInterface],
  Set<string>
>({
  debugLabel: "Annotations",
  load: async ([replayClient]) => {
    const annotationKinds = await replayClient.getAnnotationKinds();

    const kindsSet = new Set<string>(annotationKinds);
    return kindsSet;
  },
});

export const reactDevToolsAnnotationsCache = createSingleEntryCache<
  [],
  ParsedReactDevToolsAnnotation[]
>({
  debugLabel: "ReactDevToolsAnnotations",
  load: async () => {
    const receivedAnnotations: Annotation[] = [];

    await ThreadFront.getAnnotations(annotations => {
      receivedAnnotations.push(...annotations);
    }, "react-devtools-bridge");

    receivedAnnotations.sort((a1, a2) => compareNumericStrings(a1.point, a2.point));

    const parsedAnnotations: ParsedReactDevToolsAnnotation[] = receivedAnnotations.map(
      ({ point, time, contents }) => ({
        point,
        time,
        contents: JSON.parse(contents),
      })
    );

    return parsedAnnotations;
  },
});

export const reduxDevToolsAnnotationsCache = createSingleEntryCache<[], ReduxActionAnnotation[]>({
  debugLabel: "ReduxDevToolsAnnotations",
  load: async () => {
    const receivedAnnotations: Annotation[] = [];

    await ThreadFront.getAnnotations(annotations => {
      receivedAnnotations.push(...annotations);
    }, REDUX_ANNOTATIONS_KIND);

    receivedAnnotations.sort((a1, a2) => compareNumericStrings(a1.point, a2.point));

    const parsedAnnotations = processReduxAnnotations(receivedAnnotations);

    return parsedAnnotations;
  },
});

export const eventListenersJumpLocationsCache = createSingleEntryCache<
  [],
  ParsedJumpToCodeAnnotation[]
>({
  debugLabel: "EventListenersJumpLocations",
  load: async () => {
    const receivedAnnotations: Annotation[] = [];

    await ThreadFront.getAnnotations(annotations => {
      receivedAnnotations.push(...annotations);
    }, JUMP_ANNOTATION_KIND);

    receivedAnnotations.sort((a1, a2) => compareNumericStrings(a1.point, a2.point));

    const parsedAnnotations: ParsedJumpToCodeAnnotation[] = receivedAnnotations.map(
      ({ point, time, contents }) => ({
        point,
        time,
        ...JSON.parse(contents),
      })
    );

    return parsedAnnotations;
  },
});
