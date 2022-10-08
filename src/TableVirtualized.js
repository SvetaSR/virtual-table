import React, { Fragment } from "react";
import { WindowScroller, List, AutoSizer } from "react-virtualized";

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { makeData } from "./makeData";

import "react-virtualized/styles.css";


export const TableVirtualized = () => {
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

  const { rows } = table.getRowModel();
  const { rows: rows2 } = table2.getRowModel();

  return (
    <div style={{}}>
      <h2>List 1</h2>
      <WindowScroller>
        {({ height, scrollTop, registerChild }) => (
          <AutoSizer disableHeight={true}>
            {({ width }) => {
              return (
                <div ref={registerChild}>
                  <div className="divTable">
                    <div className="divBody">
                      <List
                        autoHeight
                        height={height}
                        rowCount={rows2.length}
                        rowHeight={30}
                        rowRenderer={(props) => {
                          const row = rows2[props.index];
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
                        }}
                        scrollTop={scrollTop}
                        width={width}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </AutoSizer>
        )}
      </WindowScroller>
      <h2>List 2</h2>
      <WindowScroller>
        {({ height, scrollTop, registerChild }) => (
          <AutoSizer disableHeight={true}>
            {({ width }) => {
              return (
                <div ref={registerChild}>
                  <div className="divTable">
                    <div className="divBody">
                      <List
                        autoHeight
                        height={height}
                        rowCount={rows.length}
                        rowHeight={30}
                        rowRenderer={(props) => {
                          const row = rows[props.index];
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
                        }}
                        scrollTop={scrollTop}
                        width={width}
                      />
                    </div>
                  </div>
                </div>
              );
            }}
          </AutoSizer>
        )}
      </WindowScroller>
    </div>
  );
};
