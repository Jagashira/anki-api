import { useState } from "react";

type GraphType = "tokens" | "apiUsage" | "responseTime";

const GraphSelector = ({
  setGraphType,
}: {
  setGraphType: (value: GraphType) => void;
}) => {
  return (
    <div className="mb-4">
      <label htmlFor="graph-type" className="text-lg">
        表示するグラフを選択
      </label>
      <select
        id="graph-type"
        onChange={(e) => setGraphType(e.target.value as GraphType)}
        className="w-full mt-2 p-2 border rounded"
      >
        <option value="tokens">トークン使用量</option>
        <option value="apiUsage">API使用回数</option>
        <option value="responseTime">レスポンス時間</option>
      </select>
    </div>
  );
};

export default GraphSelector;
