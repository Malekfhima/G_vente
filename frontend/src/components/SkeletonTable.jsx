import React from "react";

const SkeletonTable = ({ rows = 6, cols = 5 }) => {
  return (
    <div className="card">
      <div className="px-4 py-5 sm:p-6 animate-pulse">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: cols }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <div className="h-3 bg-gray-200 rounded w-24" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: rows }).map((_, r) => (
                <tr key={r}>
                  {Array.from({ length: cols }).map((_, c) => (
                    <td key={c} className="px-6 py-4">
                      <div className="h-3 bg-gray-200 rounded w-full" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkeletonTable;

