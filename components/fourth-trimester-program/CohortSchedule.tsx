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
    <div className="w-full overflow-x-auto rounded-lg">
      <table className="w-full text-left text-sm border-collapse">
        <tbody className="divide-y divide-brand-sand/20">
          {sortedSessions.map((session, i) => (
            <tr key={i} className="hover:bg-brand-sand/10 transition-colors">
              {/* Event Name */}
              <td className="p-4 w-[60%] text-brand-soft-charcoal">
                <span className="font-bold">{session.name}</span>
                {session.type && (
                  <div className="text-xs text-brand-soft-charcoal italic">
                    <span className="text-xs">{session.type}</span>
                    <span className="md:hidden"> - {session.location}</span>
                  </div>
                )}
              </td>

              {/* Date & Time */}
              <td className="p-4 w-[40%] md:w-[20%] text-right md:text-left text-brand-soft-charcoal">
                <span className="font-medium">{formatDate(session.date)}</span>
                {session.time && (
                  <span className="block text-xs text-brand-soft-charcoal italic">
                    {session.time}
                  </span>
                )}
              </td>

              {/* Location */}
              <td className="md:p-4 hidden md:table-cell md:w-[20%] text-brand-soft-charcoal">
                <span className="text-xs">Location:</span>
                {session.time && (
                  <span className="block text-xs text-brand-soft-charcoal italic">
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
