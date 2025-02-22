import eventsData from "@/data/eventsData";
import Card from "@/components/Card";
import { genPageMetadata } from "app/seo";

export const metadata = genPageMetadata({ title: "Events & Prograams" });

export default function Events() {
  return (
    <>
      <div>
        <div className="space-y-2 pt-6 pb-8 md:space-y-5 flex flex-col items-center">
          <h1 className="text-brand-charcoal dark:text-brand-white text-4xl font-extrabold tracking-tight md:text-6xl md:leading-14">
            Calendar
          </h1>
          <p className="text-lg leading-7 text-brand-soft-charcoal dark:text-brand-white">
            Upcoming APP events and programs
          </p>
        </div>
        <div className="container pt-4 pb-6">
          <div className="-m-4 flex flex-wrap">
            {eventsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                date={d.date}
                imgSrc={d.imgSrc ? d.imgSrc : "/static/images/web-share.png"}
                href={d.href}
                comingSoon={d.comingSoon}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
