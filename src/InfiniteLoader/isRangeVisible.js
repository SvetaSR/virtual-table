export default function isRangeVisible({
  lastRenderedStartIndex,
  lastRenderedStopIndex,
  startIndex,
  stopIndex,
}) {
  return !(
    startIndex > lastRenderedStopIndex || stopIndex < lastRenderedStartIndex
  );
}
