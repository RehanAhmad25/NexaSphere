/**
 * Downsamples data using the Largest-Triangle-Three-Buckets (LTTB) algorithm.
 * This is useful for preserving visual accuracy of charts while rendering fewer points.
 *
 * @param data Array of data objects
 * @param threshold Maximum number of data points to return
 * @param xKey Key for the X-axis value (should be numeric or timestamp)
 * @param yKey Key for the Y-axis value (should be numeric)
 * @returns Downsampled array of data objects
 */
export function decimateData<T>(
  data: T[],
  threshold: number,
  xKey: keyof T,
  yKey: keyof T
): T[] {
  const dataLength = data.length;
  if (threshold >= dataLength || threshold === 0) {
    return data; // Nothing to do
  }

  const sampled: T[] = [];
  let sampledIndex = 0;

  // Bucket size. Leave room for start and end data points
  const every = (dataLength - 2) / (threshold - 2);

  let a = 0; // Initially a is the first point in the triangle
  let maxAreaPoint = {} as T;
  let maxArea = 0;
  let area = 0;
  let nextA = 0;

  sampled[sampledIndex++] = data[a]; // Always add the first point

  for (let i = 0; i < threshold - 2; i++) {
    // Calculate point average for next bucket (containing c)
    let avgX = 0;
    let avgY = 0;
    let avgRangeStart = Math.floor((i + 1) * every) + 1;
    let avgRangeEnd = Math.floor((i + 2) * every) + 1;
    avgRangeEnd = avgRangeEnd < dataLength ? avgRangeEnd : dataLength;

    const avgRangeLength = avgRangeEnd - avgRangeStart;

    for (; avgRangeStart < avgRangeEnd; avgRangeStart++) {
      avgX += Number(data[avgRangeStart][xKey]) || 0;
      avgY += Number(data[avgRangeStart][yKey]) || 0;
    }

    avgX /= avgRangeLength;
    avgY /= avgRangeLength;

    // Get the range for this bucket
    let rangeOffs = Math.floor(i * every) + 1;
    const rangeTo = Math.floor((i + 1) * every) + 1;

    // Point a
    const pointAX = Number(data[a][xKey]) || 0;
    const pointAY = Number(data[a][yKey]) || 0;

    maxArea = area = -1;

    for (; rangeOffs < rangeTo; rangeOffs++) {
      // Calculate triangle area over three buckets
      area =
        Math.abs(
          (pointAX - avgX) * (Number(data[rangeOffs][yKey]) || 0 - pointAY) -
            (pointAX - (Number(data[rangeOffs][xKey]) || 0)) * (avgY - pointAY)
        ) * 0.5;
      if (area > maxArea) {
        maxArea = area;
        maxAreaPoint = data[rangeOffs];
        nextA = rangeOffs;
      }
    }

    sampled[sampledIndex++] = maxAreaPoint; // Pick this point from the bucket
    a = nextA; // This a is the next a (chosen b)
  }

  sampled[sampledIndex++] = data[dataLength - 1]; // Always add last

  return sampled;
}

/**
 * A simpler linear decimation to quickly reduce large datasets 
 * where LTTB might be too heavy or axes aren't strictly numeric.
 */
export function linearDecimate<T>(data: T[], threshold: number): T[] {
  if (data.length <= threshold) return data;
  const step = data.length / threshold;
  const result: T[] = [];
  for (let i = 0; i < threshold; i++) {
    result.push(data[Math.floor(i * step)]);
  }
  return result;
}
