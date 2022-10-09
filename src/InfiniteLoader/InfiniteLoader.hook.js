import { useCallback, useRef } from "react";

import isInteger from "./isInteger";
import isRangeVisible from "./isRangeVisible";
import scanForUnloadedRanges from "./scanForUnloadedRanges";

/* export type Props = {|
  // Render prop.
  children: ({ onItemsRendered: onItemsRendered, ref: setRef }) => React$Node,

  // Function responsible for tracking the loaded state of each item.
  isItemLoaded: (index: number) => boolean,

  // Number of rows in list; can be arbitrary high number if actual number is unknown.
  itemCount: number,

  // Callback to be invoked when more rows must be loaded.
  // It should return a Promise that is resolved once all data has finished loading.
  loadMoreItems: (startIndex: number, stopIndex: number) => Promise<void>,

  // Renamed to loadMoreItems in v1.0.3; will be removed in v2.0
  loadMoreRows?: (startIndex: number, stopIndex: number) => Promise<void>,

  // Minimum number of rows to be loaded at a time; defaults to 10.
  // This property can be used to batch requests to reduce HTTP requests.
  minimumBatchSize?: number,

  // Threshold at which to pre-fetch data; defaults to 15.
  // A threshold of 15 means that data will start loading when a user scrolls within 15 rows.
  threshold?: number,
|}; */

export const useInfiniteLoader = ({
  isItemLoaded,
  loadMoreItems,
  itemCount,
  minimumBatchSize = 10,
  threshold = 15,
  ref
}) => {
  const _lastRenderedStartIndex = useRef(-1);
  const _lastRenderedStopIndex = useRef(-1);
  const _memoizedUnloadedRanges = useRef([]);

  const _onItemsRendered = ({ visibleStartIndex, visibleStopIndex }) => {
    if (process.env.NODE_ENV !== "production") {
      if (!isInteger(visibleStartIndex) || !isInteger(visibleStopIndex)) {
        console.warn(
          "Invalid onItemsRendered signature; please refer to InfiniteLoader documentation."
        );
      }
    }

    _lastRenderedStartIndex.current = visibleStartIndex;
    _lastRenderedStopIndex.current = visibleStopIndex;

    _ensureRowsLoaded(visibleStartIndex, visibleStopIndex);
  };

  const _ensureRowsLoaded = (startIndex, stopIndex) => {
    const unloadedRanges = scanForUnloadedRanges({
      isItemLoaded,
      itemCount,
      minimumBatchSize,
      startIndex: Math.max(0, startIndex - threshold),
      stopIndex: Math.min(itemCount - 1, stopIndex + threshold),
    });

    // Avoid calling load-rows unless range has changed.
    // This shouldn't be strictly necessary, but is maybe nice to do.
    if (
      _memoizedUnloadedRanges.current.length !== unloadedRanges.length ||
      _memoizedUnloadedRanges.current.some(
        (startOrStop, index) => unloadedRanges[index] !== startOrStop
      )
    ) {
      _memoizedUnloadedRanges.current = unloadedRanges;
      _loadUnloadedRanges(unloadedRanges);
    }
  };

  const _loadUnloadedRanges = (unloadedRanges) => {
    for (let i = 0; i < unloadedRanges.length; i += 2) {
      const startIndex = unloadedRanges[i];
      const stopIndex = unloadedRanges[i + 1];
      const promise = loadMoreItems(startIndex, stopIndex);
      if (promise != null) {
        promise.then(() => {
          // Refresh the visible rows if any of them have just been loaded.
          // Otherwise they will remain in their unloaded visual state.
          if (
            isRangeVisible({
              lastRenderedStartIndex: _lastRenderedStartIndex.current,
              lastRenderedStopIndex: _lastRenderedStopIndex.current,
              startIndex,
              stopIndex,
            })
          ) {
            // Handle an unmount while promises are still in flight.
            if (ref == null) {
              return;
            }

            // Resize cached row sizes for VariableSizeList,
            // otherwise just re-render the list.
            if (typeof ref.resetAfterIndex === "function") {
              ref.resetAfterIndex(startIndex, true);
            } else {
              // HACK reset temporarily cached item styles to force PureComponent to re-render.
              // This is pretty gross, but I'm okay with it for now.
              // Don't judge me.
              if (typeof ref._getItemStyleCache === "function") {
                ref._getItemStyleCache(-1);
              }
              ref.forceUpdate();
            }
          }
        });
      }
    }
  };

  return { onItemsRendered: _onItemsRendered };
};
