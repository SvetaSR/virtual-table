import React, { Fragment, useCallback, useEffect } from "react";

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
  const [sorting2, setSorting2] = React.useState([]);

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

  const columns2 = React.useMemo(
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
    ],
    []
  );

  const [data, setData] = React.useState(() => makeData(100));
  const [data2, setData2] = React.useState(() => makeData(50));

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

  const table2 = useReactTable({
    data: data2,
    columns: columns2,
    state: {
      sorting: sorting2,
    },
    onSortingChange: setSorting2,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    debugTable: true,
  });

  const tableContainerRef = React.useRef(null);

  const activeStickyIndexRef = React.useRef([0]);
  const stickyIndexes = React.useMemo(() => {
    return [0, 101];
  }, []);

  const isSticky = (index) => stickyIndexes.includes(index);
  const isActiveSticky = (index) => activeStickyIndexRef.current === index;

  const isA = React.useRef(false);

  const { rows } = table.getRowModel();
  const { rows: rows2 } = table2.getRowModel();

  const t = [
    ...rows.map((row) => ({
      table,
      row,
    })),
    ...rows2.map((row) => ({
      table: table2,
      row,
    })),
  ];

  const rowVirtualizer = useVirtualizer({
    getScrollElement: () => tableContainerRef.current,
    count: t.length,
    estimateSize: () => 30,
    overscan: 10,
  });
  const { getVirtualItems: getVirtualRows, getTotalSize } = rowVirtualizer;

  const virtualRows = getVirtualRows();

  const paddingTop = virtualRows.length > 0 ? virtualRows?.[0]?.start || 0 : 0;
  const paddingTop2 =
    virtualRows.length > 0 ? virtualRows?.[101]?.start || 0 : 0;
  let paddingBottom =
    virtualRows.length > 0
      ? getTotalSize() - (virtualRows?.[virtualRows.length - 1]?.end || 0)
      : 0;

  const onScroll = useCallback((el) => {
    const { scrollHeight, scrollTop, clientHeight } = el;
    console.log("here",scrollHeight, scrollTop, clientHeight);
    if (scrollHeight - scrollTop - clientHeight < 637) {
        console.log("really here");
    }
  }, [])

  return (
    <div ref={tableContainerRef} className="container" onScroll={e => onScroll(e.target)}>
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
          {virtualRows
            .filter((virtualRow) => virtualRow.index < 100)
            .map((virtualRow) => {
              const data = t[virtualRow.index];
              const row = data.row;
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
      <div
        style={{
          zIndex: 1,
          background: "#fff",
          top: 0,
          left: 0,
          width: "100%",
          height: "100px",
        }}
      ></div>
      <div className="divTable">
        {table2.getHeaderGroups().map((headerGroup) => (
          <div
            key="header2"
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
          {paddingTop2 > 0 && (
            <div className="divTableRow">
              <div
                className="divTableCell"
                style={{ height: `${paddingTop2}px` }}
              />
            </div>
          )}
          {virtualRows
            .filter((virtualRow) => virtualRow.index >= 100)
            .map((virtualRow) => {
              const data = t[virtualRow.index];
              const row = data.row;
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
