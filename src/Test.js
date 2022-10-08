import { useState, useEffect } from 'react'
import './App.css'

import { useWindowVirtualizer } from '@tanstack/react-virtual'

export const Test = () => {
  const [count, setCount] = useState(0)
  const data = Array.from({ length: 50 }, (v, k) => k)

  const rowVirtualizer = useWindowVirtualizer({
    count: data.length,
    estimateSize: () => 36,
    overscan: 0,
  });

  useEffect(() => {
    const [lastItem] = [...rowVirtualizer.getVirtualItems()].reverse();

    if(lastItem.index === data.length - 1) {
      console.log('last item')
    }

  }, [rowVirtualizer.getVirtualItems(), data.length]);

  return (
    <div
      style={{
        height: `${rowVirtualizer.getTotalSize()}px`,
        width: '100%',
        position: 'relative',
      }}
    >
      {rowVirtualizer.getVirtualItems().map(virtualItem => {
        return (
          <div 
            key={virtualItem.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
              border: '1px solid black',
            }}
          >
            Row {virtualItem.index}
          </div>
        )
      })
    }
    </div>
  )
}