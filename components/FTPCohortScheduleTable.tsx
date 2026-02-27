export default function FTPCohortScheduleTable({ cohort }) {
  const allEvents = [
    ...cohort.discussions.map((d) => ({ ...d, type: "Online" })),
    ...cohort.socials.map((s) => ({ ...s, type: "Local" })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="p-3 font-semibold text-gray-700">Event</th>
            <th className="p-3 font-semibold text-gray-700">Date</th>
            <th className="p-3 font-semibold text-gray-700">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {allEvents.map((event, i) => (
            <tr key={i} className="hover:bg-brand-sand/30">
              <td className="p-3 text-gray-900 font-medium">{event.name}</td>
              <td className="p-3 text-gray-600">
                {event.date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </td>
              <td className="p-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    event.location === "Online"
                      ? "bg-green-100 text-green-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {event.location}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
