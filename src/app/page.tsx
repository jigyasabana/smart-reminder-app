"use client";

import { useState, useEffect } from "react";

type Reminder = {
  id: number;
  text: string;
  time: string;
  priority: "High" | "Medium" | "Low";
  notified?: boolean;
};

export default function Home() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState("");
  const [priority, setPriority] = useState<"High" | "Medium" | "Low">("Medium");

  // 📦 Load from localStorage
  useEffect(() => {
    const data = localStorage.getItem("reminders");
    if (data) {
      setReminders(JSON.parse(data));
    }
  }, []);

  // 💾 Save to localStorage
  useEffect(() => {
    localStorage.setItem("reminders", JSON.stringify(reminders));
  }, [reminders]);

  // 🔔 Ask notification permission
  useEffect(() => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }
  }, []);

  // ⏰ Reminder checker (fixed + no duplicates)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();

      setReminders((prev) =>
        prev.map((r) => {
          const reminderTime = new Date(r.time);

          if (
            !r.notified &&
            now >= reminderTime &&
            now.getTime() - reminderTime.getTime() < 60000
          ) {
            new Notification("Reminder 🔔", {
              body: r.text,
            });

            return { ...r, notified: true };
          }

          return r;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ➕ Add reminder
  const addReminder = () => {
    if (!text || !time) return;

    const newReminder: Reminder = {
      id: Date.now(),
      text,
      time,
      priority,
      notified: false,
    };

    setReminders([...reminders, newReminder]);
    setText("");
    setTime("");
    setPriority("Medium");
  };

  // ❌ Delete reminder
  const deleteReminder = (id: number) => {
    setReminders(reminders.filter((r) => r.id !== id));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-6">
        
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Smart Reminder 🔔
        </h1>

        {/* Input Section */}
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Enter reminder..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg  text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={priority}
            onChange={(e) =>
              setPriority(e.target.value as "High" | "Medium" | "Low")
            }
            className="w-full border border-gray-300 p-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>

          <button
            onClick={addReminder}
            className="w-full bg-blue-500 text-white p-3 rounded-lg font-semibold hover:bg-blue-600 transition"
          >
            + Add Reminder
          </button>
        </div>

        {/* Divider */}
        <div className="my-6 border-t"></div>

        {/* Reminder List */}
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {reminders.length === 0 ? (
            <p className="text-center text-gray-500">No reminders yet</p>
          ) : (
            reminders.map((r) => (
              <div
                key={r.id}
                className={`flex justify-between items-center p-3 rounded-lg shadow-sm hover:shadow-md transition ${
                  r.priority === "High"
                    ? "border-l-4 border-red-500 bg-red-50"
                    : r.priority === "Medium"
                    ? "border-l-4 border-yellow-500 bg-yellow-50"
                    : "border-l-4 border-green-500 bg-green-50"
                }`}
              >
                <div>
                  <p className="font-semibold text-gray-800">{r.text}</p>

                  <p className="text-sm text-gray-500">
                    {new Date(r.time).toLocaleString()}
                  </p>

                  <p
                    className={`text-xs font-semibold mt-1 ${
                      r.priority === "High"
                        ? "text-red-500"
                        : r.priority === "Medium"
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {r.priority} Priority
                  </p>
                </div>

                <button
                  onClick={() => deleteReminder(r.id)}
                  className="text-red-500 hover:text-red-700 font-medium"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}