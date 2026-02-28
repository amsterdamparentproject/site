export default function FTPCohortScheduleTable({ cohort }) {
  const allEvents = [
    ...cohort.discussions.map((d) => ({ ...d, type: "Online" })),
    ...cohort.socials.map((s) => ({ ...s, type: "Local" })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="overflow-x-auto border border-brand-sand/30 rounded-lg">
      <table className="w-full text-left text-sm">
        <thead className="bg-brand-goldenrod border-b border-brand-sand/30">
          <tr>
            <th className="p-3 font-semibold text-brand-charcoal">Event</th>
            <th className="p-3 font-semibold text-brand-charcoal">Date</th>
            <th className="p-3 font-semibold text-brand-charcoal">Location</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-sand/30">
          {allEvents.map((event, i) => (
            <tr
              key={i}
              className="hover:bg-brand-sand/30 dark:hover:bg-brand-soft-charcoal/30"
            >
              <td className="p-3 text-brand-charcoal dark:text-brand-goldenrod font-medium">
                {event.name}
              </td>
              <td className="p-3 text-brand-soft-charcoal dark:text-brand-white">
                {`${event.date.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })} @ ${event.time}`}
              </td>
              <td className="p-3">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    event.location === "Online"
                      ? "bg-brand-soft-green/30 text-brand-charcoal dark:text-brand-white"
                      : "bg-brand-soft-green text-brand-white"
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
