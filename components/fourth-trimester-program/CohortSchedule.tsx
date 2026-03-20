export default function FTPCohortSchedule({ cohort }) {
  const sortedSessions = [...(cohort.sessions || [])].sort(
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
                  <div className="text-xs text-gray-400 italic">
                    <span className="text-xs">{session.type}</span>
                    <span className="sm:hidden"> - {session.location}</span>
                  </div>
                )}
              </td>

              {/* Date & Time */}
              <td className="p-4 text-brand-soft-charcoal dark:text-brand-white/80">
                <span className="font-medium">{formatDate(session.date)}</span>
                {session.time && (
                  <span className="block text-xs text-gray-400 italic">
                    {session.time}
                  </span>
                )}
              </td>

              {/* Location */}
              <td className="p-4 hidden sm:table-cell">
                <span>Location: </span>
                <span className="text-brand-charcoal font-medium dark:text-brand-sand">
                  {session.location || "To be determined"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
