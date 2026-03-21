export default function CohortSchedule({ cohort }) {
  const sortedSessions = [...(cohort?.sessions || [])].sort(
    (a, b) => a.date.getTime() - b.date.getTime(),
  );

  const formatDate = (date) => {
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="w-full overflow-x-auto rounded-lg dark:bg-brand-charcoal/50">
      <table className="w-full text-left text-sm border-collapse">
        <tbody className="divide-y divide-brand-sand/20">
          {sortedSessions.map((session, i) => (
            <tr key={i} className="hover:bg-brand-sand/10 transition-colors">
              {/* Event Name */}
              <td className="p-4 text-brand-soft-charcoal dark:text-brand-white">
                <span className="font-bold">{session.name}</span>
                {session.type && (
                  <div className="text-xs dark:text-brand-sand text-brand-soft-charcoal italic">
                    <span className="text-xs">{session.type}</span>
                    <span className="sm:hidden"> - {session.location}</span>
                  </div>
                )}
              </td>

              {/* Date & Time */}
              <td className="p-4 text-brand-soft-charcoal dark:text-brand-white">
                <span className="font-medium">{formatDate(session.date)}</span>
                {session.time && (
                  <span className="block text-xs dark:text-brand-sand text-brand-soft-charcoal italic">
                    {session.time}
                  </span>
                )}
              </td>

              {/* Location */}
              <td className="p-4 text-brand-soft-charcoal dark:text-brand-white">
                <span className="text-xs">Location:</span>
                {session.time && (
                  <span className="block text-xs dark:text-brand-sand text-brand-soft-charcoal italic">
                    {session.location || "To be determined"}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
