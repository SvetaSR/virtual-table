import React, { Fragment } from "react";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { makeData } from "./makeData";
import { useVirtualizer, defaultRangeExtractor } from "@tanstack/react-virtual";

export const Table = () => {
  const [sorting, setSorting] = React.useState([]);

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

  const tableContainerRef = React.useRef(null);

  const activeStickyIndexRef = React.useRef([0]);
  const stickyIndexes = React.useMemo(() => {
    return [0];
  }, []);

  const isSticky = (index) => stickyIndexes.includes(index);
  const isActiveSticky = (index) => activeStickyIndexRef.current === index;

  const isA = React.useRef(false);

  const { rows } = table.getRowModel();
  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: rows.length + 1,
    estimateSize: () => 30,
    overscan: 10,
    rangeExtractor: React.useCallback(
      (range) => {
        activeStickyIndexRef.current = [...stickyIndexes]
          .reverse()
          .find((index) => range.startIndex >= index);

        const next = new Set([
          activeStickyIndexRef.current,
          ...defaultRangeExtractor(range),
        ]);

        const newDr = [...next].sort((a, b) => a - b);

        isA.current = newDr[1] > 1;

        return newDr;
      },
      [stickyIndexes]
    ),
  });
  const { getVirtualItems: getVirtualRows, getTotalSize } = rowVirtualizer;

  const virtualRows = getVirtualRows();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  let paddingBottom =
    virtualRows.length > 0
      ? getTotalSize() - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  console.log(paddingBottom);
  if (isA.current) {
    console.log("x", paddingBottom);
    //paddingBottom = paddingBottom + 30
  }

  const marginTop = virtualRows[1].index * 30 - 30;
  const marginBottom = paddingBottom;

  console.log({ marginTop, marginBottom });

  return (
    <div ref={tableContainerRef} className="container">
      <div className="divTable">
        <div className="divTableBody">
          {virtualRows.map((virtualRow) => {
            if (virtualRow.index === 0) {
              return table.getHeaderGroups().map((headerGroup) => (
                <Fragment key={headerGroup.id}>
                  <div
                    className="divTableRow"
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
                                onClick:
                                  header.column.getToggleSortingHandler(),
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
                  {marginTop > 0 && (
                    <div className="divTableRow" key="spacer">
                      <div
                        className="divTableCell"
                        style={{ height: `${marginTop}px` }}
                      />
                    </div>
                  )}
                </Fragment>
              ));
            }
            const row = rows[virtualRow.index - 1];
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
          {paddingBottom > 0 && (
            <div className="divTableRow">
              <div
                className="divTableCell"
                style={{ height: `${paddingBottom}px` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
