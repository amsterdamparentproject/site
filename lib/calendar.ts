export interface CalendarEvent {
  title: string;
  newsletter_description: string | null;
  description: string | null;
  tagline: string | null;
  date: string;
  until?: string;
  href: string;
  imgSrc?: string;
  comingSoon?: boolean;
}

export function getEventDescription(event: CalendarEvent): string | null {
  return (
    event.tagline ?? event.newsletter_description ?? event.description ?? null
  );
}
