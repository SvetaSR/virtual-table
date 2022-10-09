import React, { useCallback, useRef } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer, defaultRangeExtractor } from "@tanstack/react-virtual";
import { useInfiniteLoader } from "./InfiniteLoader/InfiniteLoader.hook";
import { makeData } from "./makeData";

export const Table = () => {
  const [sorting, setSorting] = React.useState([]);
  const ref = useRef(null);

  const columns = React.useMemo(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 60,
      },
      {
        accessorKey: "firstName",
        cell: (info) => info.getValue(),
      },
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
      },
      {
        accessorKey: "age",
        header: () => "Age",
        size: 50,
      },
      {
        accessorKey: "visits",
        header: () => <span>Visits</span>,
        size: 50,
      },
      {
        accessorKey: "status",
        header: "Status",
      },
      {
        accessorKey: "progress",
        header: "Profile Progress",
        size: 80,
      },
      {
        accessorKey: "createdAt",
        header: "Created At",
        cell: (info) => info.getValue().toLocaleString(),
      },
    ],
    []
  );

  const [data, setData] = React.useState(() => makeData(100));

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const loadMoreItems = async (start, end) => {
    console.log({ start, end });
    return new Promise((resolve, reject) => {
      setData((prevData) => [...prevData, ...makeData(10)]);
      resolve();
    });
  };

  const { rows } = table.getRowModel();

  const isItemLoaded = (index) => {
    console.log({index})
    return rows?.[index];
  };

  const { onItemsRendered } = useInfiniteLoader({
    ref,
    isItemLoaded,
    loadMoreItems,
    itemCount: 1000,
  });

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => ref.current,
    count: 1000,
    estimateSize: () => 30,
    overscan: 10,
    onChange: (instnace) => {
      const { range } = instnace;
      const { startIndex, endIndex } = range;
      onItemsRendered({ visibleStartIndex: startIndex, visibleStopIndex: endIndex });
    }
  });
  const { getVirtualItems: getVirtualRows, getTotalSize } = rowVirtualizer;

  const virtualRows = getVirtualRows();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  let paddingBottom =
    virtualRows.length > 0
      ? getTotalSize() - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  const onScroll = useCallback((el) => {
    const { scrollHeight, scrollTop, clientHeight } = el;
    //console.log("here",scrollHeight, scrollTop, clientHeight);
    if (scrollHeight - scrollTop - clientHeight < 637) {
      //console.log("really here");
    }
  }, []);

  return (
    <div
      ref={ref}
      className="container"
    >
      <div className="divTable">
        {table.getHeaderGroups().map((headerGroup) => (
          <div
            key="header"
            className="divTableRow"
            style={{
              zIndex: 1,
              background: "#ccc",
              position: "sticky",
              top: 0,
              left: 0,
              width: "100%",
            }}
          >
            {headerGroup.headers.map((header) => {
              return (
                <div
                  className="divTableCell"
                  key={header.id}
                  colSpan={header.colSpan}
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder ? null : (
                    <div
                      {...{
                        className: header.column.getCanSort()
                          ? "cursor-pointer select-none"
                          : "",
                        onClick: header.column.getToggleSortingHandler(),
                      }}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {{
                        asc: " 🔼",
                        desc: " 🔽",
                      }[header.column.getIsSorted()] ?? null}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
        <div className="divTableBody">
          {paddingTop > 0 && (
            <div className="divTableRow">
              <div
                className="divTableCell"
                style={{ height: `${paddingTop}px` }}
              />
            </div>
          )}
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) {
              return (
                <div
                  className="divTableRow"
                  key={`loading-${virtualRow.index}`}
                >
                  <div className="divTableCell">Loading...</div>
                </div>
              );
            }
            return (
              <div className="divTableRow" key={row.id}>
                {row.getVisibleCells().map((cell) => {
                  return (
                    <div className="divTableCell" key={cell.id}>
                      <div className="cellContent">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
      {paddingBottom > 0 && <div style={{ height: `${paddingBottom}px` }} />}
    </div>
  );
};
