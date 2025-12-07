"use client";

import { useState } from "react";
import axios from "axios";

export default function Scraper() {
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [log, setLog] = useState([]);

  const appendLog = (msg) => {
    setLog((prev) => [...prev, msg]);
  };

  // 🔹 Scrape a single page
  const scrapePage = async (categoryId, pageNo) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/scrape?categoryId=${categoryId}&pageNo=${pageNo}`
      );
      return res.data;
    } catch (err) {
      appendLog(`❌ Error fetching category ${categoryId}, page ${pageNo}`);
      return undefined;
    }
  };

  // 🔹 Main scraping loop
  const startScraping = async () => {
    setLoading(true);
    appendLog("🚀 Starting scraping from categoryId=4 ...");

    let categoryId = 4; // start category
    const MAX_CATEGORY = 2000; // safety limit

    while (categoryId <= MAX_CATEGORY) {
      appendLog(`\n===== 📦 CATEGORY ${categoryId} START =====`);

      let pageNo = 1;

      while (true) {
        const data = await scrapePage(categoryId, pageNo);

        if (!data) {
          appendLog(
            `⚠️ API returned undefined at category ${categoryId}, page ${pageNo}. Skipping to next category.`
          );
          break;
        }

        // Stop if API fields are undefined
        if (
          data.total_synced === undefined ||
          data.inserted_new === undefined ||
          data.updated_existing === undefined
        ) {
          appendLog(
            `🛑 Undefined sync data at category ${categoryId}, page ${pageNo}. Skipping to next category.`
          );
          break;
        }

        // Stop if no products
        if (data.total_synced === 0) {
          appendLog(
            `🛑 No more products at page ${pageNo}. Switching to next category → ${
              categoryId + 1
            }`
          );
          break;
        }

        // ✔ Valid page
        appendLog(
          `✔️ Category ${categoryId} | Page ${pageNo} | synced=${data.total_synced} | new=${data.inserted_new} | updated=${data.updated_existing}`
        );

        pageNo++; // next page
      }

      categoryId++; // next category
    }

    appendLog("\n🎉 Scraping Finished all categories!");
    setFinished(true);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">🔥 HyperPure Auto Scraper</h2>

      {!loading && !finished && (
        <button
          onClick={startScraping}
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold"
        >
          Start Scraping
        </button>
      )}

      {loading && (
        <p className="text-yellow-600 font-medium">Scraping in progress...</p>
      )}

      {finished && (
        <p className="text-green-600 font-medium">
          Scraping completed successfully!
        </p>
      )}

      <div className="mt-6 bg-gray-900 text-green-300 p-4 rounded h-96 overflow-auto text-sm">
        {log.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
}
