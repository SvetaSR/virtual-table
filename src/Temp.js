import React, { forwardRef } from "react";
import { faker } from "@faker-js/faker";
import { findIndex, groupBy } from "lodash";
import { useVirtualizer, defaultRangeExtractor } from "@tanstack/react-virtual";

const groupedNames = groupBy(
  Array.from({ length: 1000 })
    .map(() => faker.name.firstName())
    .sort(),
  (name) => name[0]
);
const groups = Object.keys(groupedNames);
const rows = groups.reduce((acc, k) => [...acc, k, ...groupedNames[k]], []);

export const Temp = () => {
  const parentRef = React.useRef();

  const activeStickyIndexRef = React.useRef(0);

  const stickyIndexes = React.useMemo(
    () => groups.map((gn) => findIndex(rows, (n) => n === gn)),
    []
  );

  const isSticky = (index) => stickyIndexes.includes(index);

  const isActiveSticky = (index) => activeStickyIndexRef.current === index;

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    estimateSize: () => 50,
    getScrollElement: () => parentRef.current,
    rangeExtractor: React.useCallback(
      (range) => {
        activeStickyIndexRef.current = [...stickyIndexes]
          .reverse()
          .find((index) => range.startIndex >= index);

        const next = new Set([
          activeStickyIndexRef.current,
          ...defaultRangeExtractor(range),
        ]);

        console.log([...next].sort((a, b) => a - b));

        return [...next].sort((a, b) => a - b);
      },
      [stickyIndexes]
    ),
  });

  return (
    <div
      ref={parentRef}
      className="container"
      style={{
        width: `100%`,
      }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            className={"ListItem"}
            style={{
              ...(isSticky(virtualRow.index)
                ? {
                    background: "#fff",
                    borderBottom: "1px solid #ddd",
                    zIndex: 1,
                  }
                : {}),
              ...(isActiveSticky(virtualRow.index)
                ? {
                    position: "sticky",
                  }
                : {
                    position: "absolute",
                    transform: `translateY(${virtualRow.start}px)`,
                  }),
              top: 0,
              left: 0,
              width: "100%",
              height: `${virtualRow.size}px`,
            }}
          >
            {rows[virtualRow.index]}
          </div>
        ))}
      </div>
    </div>
  );
};
