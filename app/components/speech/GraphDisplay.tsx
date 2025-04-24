"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type UsageItem = {
  date: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  requests: number;
  response_time: number | null;
};

type GraphType =
  | "input_tokens"
  | "output_tokens"
  | "total_tokens"
  | "requests"
  | "response_time";

const graphLabels: { [key in GraphType]: string } = {
  input_tokens: "入力トークン",
  output_tokens: "出力トークン",
  total_tokens: "トークン合計",
  requests: "API使用回数",
  response_time: "レスポンスタイム",
};

const exchangeRate = 130; // 1 USD = 130 JPY

const GraphDisplay = () => {
  const [usageData, setUsageData] = useState<UsageItem[]>([]);
  const [graphType, setGraphType] = useState<GraphType>("total_tokens");
  const [currency, setCurrency] = useState<"USD" | "JPY">("USD");

  // データ取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/usage?range=this_week");
        const data = await res.json();
        setUsageData(data || []);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    };
    fetchData();
  }, []);

  // 通貨換算
  const convertToCurrency = (amount: number) => {
    if (currency === "JPY") {
      return amount * exchangeRate; // USD → JPY
    }
    return amount; // USD
  };

  // グラフ用のデータ整形
  const chartData = usageData.map((item) => ({
    date: item.date,
    [graphType]: item[graphType],
  }));

  // 日別コスト計算 (USD)
  const totalCostPerDay = usageData.map((item) => {
    const inputCost = (item.input_tokens / 1000) * 0.01; // $0.01 per 1K input tokens
    const outputCost = (item.output_tokens / 1000) * 0.03; // $0.03 per 1K output tokens
    const totalCost = inputCost + outputCost;
    return {
      date: item.date,
      totalCost: convertToCurrency(totalCost), // 通貨換算後のコスト
    };
  });

  // ツールチップに通貨単位を追加
  const formatTooltipValue = (value: number) => {
    return `${value.toFixed(2)} ${currency === "JPY" ? "円" : "USD"}`;
  };

  return (
    <div>
      <div className="mb-4 space-x-2">
        {(
          [
            "input_tokens",
            "output_tokens",
            "total_tokens",
            "requests",
            "response_time",
          ] as GraphType[]
        ).map((type) => (
          <button
            key={type}
            onClick={() => setGraphType(type)}
            className={`px-3 py-1 rounded ${
              graphType === type
                ? "bg-blue-500 text-white font-bold"
                : "bg-gray-200"
            }`}
          >
            {graphLabels[type]}
          </button>
        ))}
        <button
          onClick={() => setCurrency(currency === "USD" ? "JPY" : "USD")}
          className="px-3 py-1 rounded bg-green-500 text-white font-bold"
        >
          通貨: {currency === "USD" ? "USD" : "JPY"}
        </button>
      </div>

      {/* メイングラフ */}
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey={graphType} stroke="#8884d8" />
        </LineChart>
      </ResponsiveContainer>

      {/* 日別コストグラフ */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">日別コスト</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={totalCostPerDay}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis tickFormatter={(value) => `${value.toFixed(2)}`} />
            <Tooltip formatter={formatTooltipValue} />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalCost"
              stroke="#82ca9d"
              name="日別コスト"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraphDisplay;
